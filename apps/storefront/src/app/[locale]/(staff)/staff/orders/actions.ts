"use server";

import { revalidatePath } from "next/cache";
import { redirect as nextRedirect } from "next/navigation";

import { type RepairStage } from "@nimara/domain/objects/RepairWorkflow";
import { graphqlClient } from "@nimara/infrastructure/graphql/client";
import { SERVICE_METADATA_KEYS } from "@nimara/infrastructure/service-request/metadata";
import {
  ServiceRequestOrderNoteAddMutationDocument,
  ServiceRequestUpdateMetadataMutationDocument,
} from "@nimara/infrastructure/service-request/saleor/graphql/mutations/generated";

import { auth, getAccessToken } from "@/auth";
import { clientEnvs } from "@/envs/client";
import { serverEnvs } from "@/envs/server";
import { localePrefixes } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { isApprovedRepairWorker } from "@/lib/repair/metadata";
import { DEFAULT_LOCALE, type SupportedLocale } from "@/regions/types";
import { errorService } from "@/services/error";

const buildLocalizedPath = (locale: SupportedLocale, path: string) => {
  if (locale === DEFAULT_LOCALE) {
    return path;
  }

  const prefix =
    localePrefixes[locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>];

  return `${prefix}${path}`;
};

const assertRepairStaff = async () => {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const user = session.user as {
    email: string;
    firstName: string;
    id: string;
    isStaff?: boolean;
    lastName: string;
    metadata?: Record<string, string>;
    permissionGroups?: Array<{ id: string; name: string }>;
  };

  const repairGroupName = serverEnvs.SERVICE_WORKER_GROUP_NAME;
  const belongsToRepairGroup = Boolean(
    user?.isStaff &&
      user.permissionGroups?.some((group) => group.name === repairGroupName),
  );

  const metadata = user?.metadata;
  const approvedWorker = isApprovedRepairWorker(metadata);

  if (!belongsToRepairGroup && !approvedWorker) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.email,
  };
};

const updateMetadata = async (
  accessToken: string,
  orderId: string,
  input: Array<{ key: string; value: string }>,
) => {
  const client = graphqlClient(
    clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    accessToken,
  );

  const response = await client.execute(
    ServiceRequestUpdateMetadataMutationDocument,
    {
      operationName: "ServiceRequestUpdateMetadataMutation",
      variables: {
        id: orderId,
        input,
      },
      options: { cache: "no-store" },
    },
  );

  return response.ok;
};

const addOrderNote = async (
  accessToken: string,
  orderId: string,
  message: string,
) => {
  const client = graphqlClient(
    clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    accessToken,
  );

  const response = await client.execute(
    ServiceRequestOrderNoteAddMutationDocument,
    {
      operationName: "ServiceRequestOrderNoteAddMutation",
      variables: {
        orderId,
        message,
      },
      options: { cache: "no-store" },
    },
  );

  return response.ok;
};

const revalidateStaffPath = (locale: SupportedLocale) => {
  revalidatePath(buildLocalizedPath(locale, paths.staff.orders.asPath()));
};

export const claimRepairOrder = async (
  orderId: string,
  locale: SupportedLocale,
) => {
  const staffUser = await assertRepairStaff();

  if (!staffUser) {
    nextRedirect(
      buildLocalizedPath(
        locale,
        paths.signIn.asPath({
          query: { redirectUrl: paths.staff.orders.asPath() },
        }),
      ),
    );
  }

  const accessToken = await getAccessToken();

  if (!accessToken || !staffUser) {
    return { ok: false };
  }

  const issuedAt = new Date().toISOString();

  const metadataPayload = [
    { key: SERVICE_METADATA_KEYS.workerId, value: staffUser.id },
    { key: SERVICE_METADATA_KEYS.workerEmail, value: staffUser.email },
    { key: SERVICE_METADATA_KEYS.workerName, value: staffUser.name },
    { key: SERVICE_METADATA_KEYS.stage, value: "diagnostics" },
    { key: SERVICE_METADATA_KEYS.stageUpdatedAt, value: issuedAt },
  ];

  const metadataResult = await updateMetadata(
    accessToken,
    orderId,
    metadataPayload,
  );

  if (!metadataResult) {
    errorService.logError(
      new Error("Failed to claim repair order: metadata update failed"),
    );

    return { ok: false };
  }

  await addOrderNote(
    accessToken,
    orderId,
    `Мастер ${staffUser.name} взял заказ в работу. Этап: диагностика.`,
  );

  revalidateStaffPath(locale);

  return { ok: true };
};

export const updateRepairStage = async (
  orderId: string,
  stage: RepairStage,
  locale: SupportedLocale,
) => {
  const staffUser = await assertRepairStaff();

  if (!staffUser) {
    nextRedirect(
      buildLocalizedPath(
        locale,
        paths.signIn.asPath({
          query: { redirectUrl: paths.staff.orders.asPath() },
        }),
      ),
    );
  }

  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { ok: false };
  }

  const issuedAt = new Date().toISOString();

  const metadataPayload: Array<{ key: string; value: string }> = [
    { key: SERVICE_METADATA_KEYS.stage, value: stage },
    { key: SERVICE_METADATA_KEYS.stageUpdatedAt, value: issuedAt },
  ];

  if (stage === "pending_assignment") {
    metadataPayload.push(
      { key: SERVICE_METADATA_KEYS.workerId, value: "" },
      { key: SERVICE_METADATA_KEYS.workerEmail, value: "" },
      { key: SERVICE_METADATA_KEYS.workerName, value: "" },
    );
  }

  const metadataResult = await updateMetadata(
    accessToken,
    orderId,
    metadataPayload,
  );

  if (!metadataResult) {
    errorService.logError(
      new Error("Failed to update repair stage: metadata update failed"),
    );

    return { ok: false };
  }

  await addOrderNote(accessToken, orderId, `Этап ремонта обновлён: ${stage}.`);

  revalidateStaffPath(locale);

  return { ok: true };
};
