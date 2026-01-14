import {
  REPAIR_STAGES,
  type RepairStage,
} from "@nimara/domain/objects/RepairWorkflow";
import { graphqlClient } from "@nimara/infrastructure/graphql/client";
import { SERVICE_METADATA_KEYS } from "@nimara/infrastructure/service-request/metadata";
import { ServiceRequestOrdersQueryDocument } from "@nimara/infrastructure/service-request/saleor/graphql/queries/generated";

import { clientEnvs } from "@/envs/client";

const DEFAULT_PAGE_SIZE = 100;

type MetadataMap = Record<string, string | undefined>;

const toMetadataMap = (
  entries: Array<{ key: string; value: string | null }> | null | undefined,
): MetadataMap => {
  if (!entries?.length) {
    return {};
  }

  return entries.reduce<MetadataMap>((acc, entry) => {
    acc[entry.key] = entry.value ?? undefined;

    return acc;
  }, {});
};

const coerceStage = (value: string | undefined): RepairStage => {
  if (!value) {
    return "pending_assignment";
  }

  return (REPAIR_STAGES as readonly string[]).includes(value)
    ? (value as RepairStage)
    : "pending_assignment";
};

const parseBooleanMetadata = (value: string | undefined) => value === "true";

export type StaffRepairOrder = {
  created: string;
  customerEmail?: string;
  customerMessage?: string;
  customerName?: string;
  customerPhone?: string;
  deviceType?: string;
  id: string;
  metadata: MetadataMap;
  needsPickup: boolean;
  number: string | null;
  preferredContact?: string;
  serviceName?: string;
  serviceSlug?: string;
  stage: RepairStage;
  stageUpdatedAt?: string;
  totalAmount?: number | null;
  totalCurrency?: string | null;
  urgent: boolean;
  leadGroup?: string;
  leadPriorityUntil?: string;
  workerEmail?: string;
  workerId?: string;
  workerName?: string;
};

export const fetchRepairOrders = async ({
  accessToken,
  workerGroupName,
  first = DEFAULT_PAGE_SIZE,
}: {
  accessToken: string;
  first?: number;
  workerGroupName: string;
}): Promise<StaffRepairOrder[]> => {
  const client = graphqlClient(
    clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    accessToken,
  );

  const result = await client.execute(ServiceRequestOrdersQueryDocument, {
    operationName: "ServiceRequestOrdersQuery",
    variables: {
      first,
      filter: {
        metadata: [
          {
            key: SERVICE_METADATA_KEYS.workerGroup,
            value: workerGroupName,
          },
        ],
      },
      sortBy: {
        field: "CREATION_DATE",
        direction: "DESC",
      },
    },
    options: {
      cache: "no-store",
    },
  });

  if (!result.ok) {
    return [];
  }

  const connection = result.data.orders;

  if (!connection?.edges?.length) {
    return [];
  }

  return connection.edges
    .filter((edge): edge is NonNullable<typeof edge> => Boolean(edge?.node))
    .map((edge) => {
      const order = edge.node;
      const metadata = toMetadataMap(order.metadata ?? []);

      const stage = coerceStage(metadata[SERVICE_METADATA_KEYS.stage]);

      return {
        id: order.id,
        number: order.number,
        created: order.created,
        metadata,
        stage,
        stageUpdatedAt: metadata[SERVICE_METADATA_KEYS.stageUpdatedAt],
        leadGroup: metadata[SERVICE_METADATA_KEYS.leadGroup],
        leadPriorityUntil: metadata[SERVICE_METADATA_KEYS.leadPriorityUntil],
        workerId: metadata[SERVICE_METADATA_KEYS.workerId],
        workerEmail: metadata[SERVICE_METADATA_KEYS.workerEmail],
        workerName: metadata[SERVICE_METADATA_KEYS.workerName],
        customerName: metadata[SERVICE_METADATA_KEYS.customerFullName],
        customerPhone: metadata[SERVICE_METADATA_KEYS.customerPhone],
        customerEmail: metadata[SERVICE_METADATA_KEYS.customerEmail],
        serviceName: metadata[SERVICE_METADATA_KEYS.serviceName],
        serviceSlug: metadata[SERVICE_METADATA_KEYS.serviceSlug],
        deviceType: metadata[SERVICE_METADATA_KEYS.deviceType],
        urgent: parseBooleanMetadata(metadata[SERVICE_METADATA_KEYS.urgent]),
        needsPickup: parseBooleanMetadata(
          metadata[SERVICE_METADATA_KEYS.needsPickup],
        ),
        customerMessage: metadata[SERVICE_METADATA_KEYS.customerMessage],
        preferredContact: metadata[SERVICE_METADATA_KEYS.preferredContact],
        totalAmount: order.total?.gross?.amount ?? null,
        totalCurrency: order.total?.gross?.currency ?? null,
      } satisfies StaffRepairOrder;
    });
};
