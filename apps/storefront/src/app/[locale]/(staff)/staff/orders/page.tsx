import { redirect as nextRedirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { auth, getAccessToken } from "@/auth";
import { serverEnvs } from "@/envs/server";
import { localePrefixes } from "@/i18n/routing";
import { paths } from "@/lib/paths";
import { REPAIR_STAGE_FLOW } from "@/lib/repair/stages";
import { DEFAULT_LOCALE,type SupportedLocale } from "@/regions/types";
import { fetchRepairOrders, type StaffRepairOrder } from "@/services/repair-orders-dashboard";

import { StaffOrdersBoard } from "./staff-orders-board";

type PageProps = {
  params: Promise<{ locale: SupportedLocale }>;
};

const buildLocalizedPath = (locale: SupportedLocale, path: string) => {
  if (locale === DEFAULT_LOCALE) {
    return path;
  }

  const prefix = localePrefixes[
    locale as Exclude<SupportedLocale, typeof DEFAULT_LOCALE>
  ];

  return `${prefix}${path}`;
};

export default async function StaffOrdersPage({ params }: PageProps) {
  const { locale } = await params;
  const session = await auth();

  if (!session?.user) {
    nextRedirect(
      buildLocalizedPath(locale, paths.signIn.asPath({
        query: { redirectUrl: paths.staff.orders.asPath() },
      })),
    );
  }

  const user = session.user as {
    email: string;
    firstName: string;
    id: string;
    lastName: string;
  };

  const accessToken = await getAccessToken();

  if (!accessToken) {
    nextRedirect(
      buildLocalizedPath(locale, paths.signIn.asPath({
        query: { redirectUrl: paths.staff.orders.asPath() },
      })),
    );
  }

  const orders = await fetchRepairOrders({
    accessToken: accessToken,
    workerGroupName: serverEnvs.SERVICE_WORKER_GROUP_NAME,
  });

  const t = await getTranslations("staff");

  const stageOptions = REPAIR_STAGE_FLOW.map((stage) => ({
    value: stage,
    label: t(`stages.${stage}` as const),
  }));

  const annotatedOrders: Array<StaffRepairOrder & {
    isMine: boolean;
    isUnassigned: boolean;
  }> = orders.map((order) => ({
    ...order,
    isMine: order.workerId === user.id,
    isUnassigned: !order.workerId,
  }));

  return (
    <StaffOrdersBoard
      locale={locale}
      orders={annotatedOrders}
      stageOptions={stageOptions}
    />
  );
}
