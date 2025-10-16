import { err, ok } from "@nimara/domain/objects/Result";

import { graphqlClient } from "#root/graphql/client";

import {
  ServiceRequestDraftOrderCreateMutationDocument,
  ServiceRequestOrderNoteAddMutationDocument,
  ServiceRequestUpdateMetadataMutationDocument,
} from "../graphql/mutations/generated";
import {
  ServiceRequestChannelQueryDocument,
  ServiceRequestProductQueryDocument,
  ServiceRequestWorkersQueryDocument,
} from "../graphql/queries/generated";
import type { ServiceRequestWorkersQuery } from "../graphql/queries/generated";
import type {
  SaleorServiceRequestConfig,
  ServiceRequestCreateInfra,
  ServiceRequestCreateInput,
  ServiceRequestCreateSuccess,
  ServiceWorker,
} from "../../types";

type MetadataEntry = { key: string; value: string };

const WORKER_GROUP_SEARCH_LIMIT = 20;

type WorkerGroupEdge = NonNullable<
  NonNullable<ServiceRequestWorkersQuery["permissionGroups"]>["edges"]
>[number];

type WorkerGroupNode = NonNullable<WorkerGroupEdge["node"]>;

type WorkerUser = NonNullable<WorkerGroupNode["users"]>[number];

const serializeBoolean = (value: boolean) => (value ? "true" : "false");

const buildMetadata = ({
  createdAt,
  request,
  service,
  worker,
}: ServiceRequestCreateInput & { worker?: ServiceWorker }): MetadataEntry[] => {
  const metadata: MetadataEntry[] = [
    { key: "repair:service_slug", value: service.slug },
    { key: "repair:service_name", value: service.name },
    { key: "repair:service_group", value: service.group },
    { key: "repair:service_category", value: service.category },
    { key: "repair:requested_at", value: createdAt },
    { key: "repair:customer_full_name", value: request.fullName },
    { key: "repair:customer_phone", value: request.phone },
    { key: "repair:device_type", value: request.deviceType },
    { key: "repair:is_urgent", value: serializeBoolean(request.urgent) },
    { key: "repair:needs_pickup", value: serializeBoolean(request.needsPickup) },
    { key: "repair:consent", value: serializeBoolean(request.consent) },
  ];

  if (request.email) {
    metadata.push({ key: "repair:customer_email", value: request.email });
  }

  if (request.message) {
    metadata.push({ key: "repair:customer_message", value: request.message });
  }

  if (request.preferredContact) {
    metadata.push({
      key: "repair:preferred_contact",
      value: request.preferredContact,
    });
  }

  if (request.priceEstimate) {
    metadata.push(
      { key: "repair:estimate_currency", value: request.priceEstimate.currency },
      {
        key: "repair:estimate_min",
        value:
          request.priceEstimate.min === null
            ? ""
            : String(request.priceEstimate.min),
      },
      {
        key: "repair:estimate_max",
        value:
          request.priceEstimate.max === null
            ? ""
            : String(request.priceEstimate.max),
      },
    );
  }

  if (Object.keys(request.modifiers).length > 0) {
    metadata.push({
      key: "repair:calculator_modifiers",
      value: JSON.stringify(request.modifiers),
    });
  }

  if (worker) {
    metadata.push(
      { key: "repair:worker_id", value: worker.id },
      { key: "repair:worker_email", value: worker.email },
      {
        key: "repair:worker_name",
        value: `${worker.firstName ?? ""} ${worker.lastName ?? ""}`.trim(),
      },
    );
  }

  return metadata;
};

const buildOrderNote = ({ request, service, worker }: ServiceRequestCreateInput & {
  worker?: ServiceWorker;
}): string => {
  const noteLines: string[] = [
    "Заявка на ремонт создана storefront приложением.",
    `Услуга: ${service.name} (${service.slug}).`,
    `Клиент: ${request.fullName} (${request.phone}${request.email ? `, ${request.email}` : ""}).`,
  ];

  if (request.message) {
    noteLines.push(`Комментарий клиента: ${request.message}`);
  }

  const flags: string[] = [];

  if (request.urgent) {
    flags.push("срочный ремонт");
  }

  if (request.needsPickup) {
    flags.push("требуется выезд/забор устройства");
  }

  if (flags.length > 0) {
    noteLines.push(`Особые условия: ${flags.join(", ")}.`);
  }

  if (worker) {
    noteLines.push(
      `Назначенный работник: ${
        `${worker.firstName ?? ""} ${worker.lastName ?? ""}`.trim() || worker.email
      } (${worker.email}).`,
    );
  }

  return noteLines.join("\n");
};

const pickRandomWorker = (workers: ServiceWorker[]): ServiceWorker | undefined => {
  if (!workers.length) {
    return undefined;
  }

  const index = Math.floor(Math.random() * workers.length);

  return workers[index];
};

export const saleorServiceRequestCreateInfra = (
  config: SaleorServiceRequestConfig,
): ServiceRequestCreateInfra => {
  const client = graphqlClient(config.apiURL, config.appToken);

  return async (input) => {
    const { logger } = config;

    const channelResult = await client.execute(
      ServiceRequestChannelQueryDocument,
      {
        variables: { slug: config.channelSlug },
        operationName: "ServiceRequestChannelQuery",
        options: { cache: "no-store" },
      },
    );

    if (!channelResult.ok || !channelResult.data.channel) {
      logger.error("[ServiceRequest] Channel not found.", {
        channelSlug: config.channelSlug,
        errors: channelResult.ok ? undefined : channelResult.errors,
      });

      return err([
        {
          code: "NOT_FOUND_ERROR",
          message: "Service channel not found.",
          context: { channelSlug: config.channelSlug },
        },
      ]);
    }

    const channelId = channelResult.data.channel.id;

    const productResult = await client.execute(
      ServiceRequestProductQueryDocument,
      {
        variables: {
          slug: input.service.slug,
          channel: config.channelSlug,
        },
        operationName: "ServiceRequestProductQuery",
        options: { cache: "no-store" },
      },
    );

    if (!productResult.ok || !productResult.data.product) {
      logger.error("[ServiceRequest] Service product not found in Saleor.", {
        serviceSlug: input.service.slug,
        errors: productResult.ok ? undefined : productResult.errors,
      });

      return err([
        {
          code: "NOT_FOUND_ERROR",
          message: "Service product not found.",
          context: { serviceSlug: input.service.slug },
        },
      ]);
    }

    const product = productResult.data.product;
    const variantId =
      product.defaultVariant?.id ?? product.variants?.[0]?.id ?? undefined;

    if (!variantId) {
      logger.error("[ServiceRequest] Service product has no variants.", {
        serviceSlug: input.service.slug,
      });

      return err([
        {
          code: "NOT_FOUND_ERROR",
          message: "Service product has no variants.",
          context: { serviceSlug: input.service.slug },
        },
      ]);
    }

    const workersResult = await client.execute(
      ServiceRequestWorkersQueryDocument,
      {
        variables: {
          search: config.workerGroupName,
          first: WORKER_GROUP_SEARCH_LIMIT,
        },
        operationName: "ServiceRequestWorkersQuery",
        options: { cache: "no-store" },
      },
    );

    if (!workersResult.ok) {
      logger.error("[ServiceRequest] Failed to load worker group.", {
        errors: workersResult.errors,
        groupName: config.workerGroupName,
      });

      return err([
        {
          code: "HTTP_ERROR",
          message: "Failed to load worker group.",
        },
      ]);
    }

    const matchedGroup = workersResult.data.permissionGroups?.edges
      ?.map(
        (edge: WorkerGroupEdge): WorkerGroupNode | null => edge.node ?? null,
      )
      .find(
        (group: WorkerGroupNode | null): group is WorkerGroupNode =>
          Boolean(group && group.name === config.workerGroupName),
      );

    if (!matchedGroup) {
      logger.error("[ServiceRequest] Worker group not found.", {
        groupName: config.workerGroupName,
      });

      return err([
        {
          code: "NOT_FOUND_ERROR",
          message: "Worker group not found.",
          context: { groupName: config.workerGroupName },
        },
      ]);
    }

    const availableWorkers: ServiceWorker[] =
      matchedGroup.users
        ?.filter((user: WorkerUser) => user.isActive)
        .map((user: WorkerUser) => ({
          id: user.id,
          email: user.email,
          firstName: user.firstName ?? "",
          lastName: user.lastName ?? "",
        })) ?? [];

    if (!availableWorkers.length) {
      logger.error("[ServiceRequest] No active workers in the group.", {
        groupName: config.workerGroupName,
      });

      return err([
        {
          code: "NOT_FOUND_ERROR",
          message: "No active workers found.",
          context: { groupName: config.workerGroupName },
        },
      ]);
    }

    const worker = pickRandomWorker(availableWorkers);

    const price = input.request.priceEstimate?.min ?? 0;
    const email = input.request.email?.trim() || undefined;

    const draftResult = await client.execute(
      ServiceRequestDraftOrderCreateMutationDocument,
      {
        variables: {
          input: {
            channelId,
            externalReference: `repair:${input.service.slug}:${input.createdAt}`,
            userEmail: email,
            lines: [
              {
                variantId,
                quantity: 1,
                price,
              },
            ],
          },
        },
        operationName: "ServiceRequestDraftOrderCreateMutation",
        options: { cache: "no-store" },
      },
    );

    if (!draftResult.ok || draftResult.data.draftOrderCreate?.errors.length) {
      logger.error("[ServiceRequest] Failed to create draft order.", {
        errors: draftResult.ok
          ? draftResult.data.draftOrderCreate?.errors
          : draftResult.errors,
        serviceSlug: input.service.slug,
      });

      return err([
        {
          code: "HTTP_ERROR",
          message: "Failed to create service request order.",
        },
      ]);
    }

    const orderId = draftResult.data.draftOrderCreate?.order?.id;

    if (!orderId) {
      logger.error("[ServiceRequest] Draft order response missing order data.");

      return err([
        {
          code: "UNKNOWN_ERROR",
          message: "Draft order response incomplete.",
        },
      ]);
    }

    const metadataEntries = buildMetadata({
      ...input,
      worker,
    });

    const metadataResult = await client.execute(
      ServiceRequestUpdateMetadataMutationDocument,
      {
        variables: {
          id: orderId,
          input: metadataEntries,
        },
        operationName: "ServiceRequestUpdateMetadataMutation",
        options: { cache: "no-store" },
      },
    );

    if (!metadataResult.ok || metadataResult.data.updateMetadata?.errors.length) {
      logger.error("[ServiceRequest] Failed to update order metadata.", {
        errors: metadataResult.ok
          ? metadataResult.data.updateMetadata?.errors
          : metadataResult.errors,
        orderId,
      });

      return err([
        {
          code: "HTTP_ERROR",
          message: "Failed to update order metadata.",
        },
      ]);
    }

    const noteResult = await client.execute(
      ServiceRequestOrderNoteAddMutationDocument,
      {
        variables: {
          orderId,
          message: buildOrderNote({ ...input, worker }),
        },
        operationName: "ServiceRequestOrderNoteAddMutation",
        options: { cache: "no-store" },
      },
    );

    if (!noteResult.ok || noteResult.data.orderNoteAdd?.errors.length) {
      logger.error("[ServiceRequest] Failed to add order note.", {
        errors: noteResult.ok
          ? noteResult.data.orderNoteAdd?.errors
          : noteResult.errors,
        orderId,
      });

      return err([
        {
          code: "HTTP_ERROR",
          message: "Failed to annotate service request order.",
        },
      ]);
    }

    logger.info("[ServiceRequest] Draft order created and assigned.", {
      orderId,
      workerId: worker?.id,
    });

    const success: ServiceRequestCreateSuccess = {
      orderId,
      orderNumber: draftResult.data.draftOrderCreate?.order?.number,
      assignedWorker: worker,
    };

    return ok(success);
  };
};
