import { secureSaleorClient } from "@/graphql/client";
import {
  REPAIR_METADATA_KEYS,
  REPAIR_ROLE,
  REPAIR_STATUS,
} from "@/lib/repair/metadata";

type WorkerEdge = {
  cursor: string;
  node: {
    dateJoined: string;
    email: string;
    firstName: string;
    id: string;
    isActive: boolean | null;
    lastName: string;
    metadata: Array<{ key: string; value: string | null }> | null;
  };
};

const toMetadataRecord = (
  metadata: WorkerEdge["node"]["metadata"],
): Record<string, string> => {
  const record: Record<string, string> = {};

  metadata?.forEach((item) => {
    if (item.key && item.value !== null) {
      record[item.key] = item.value;
    }
  });

  return record;
};

const repairWorkersQuery = {
  toString: () => `
    query RepairWorkersQuery($first: Int!, $after: String, $metadataKey: String!, $metadataValue: String!) {
      customers(first: $first, after: $after, filter: { metadata: [{ key: $metadataKey, value: $metadataValue }] }) {
        edges {
          cursor
          node {
            id
            email
            firstName
            lastName
            isActive
            dateJoined
            metadata {
              key
              value
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `,
};

const repairWorkerUpdateMutation = {
  toString: () => `
    mutation RepairWorkerUpdateMutation($id: ID!, $metadata: [MetadataInput!]!) {
      customerUpdate(id: $id, input: { metadata: $metadata }) {
        errors {
          field
          message
          code
        }
        user {
          id
          metadata {
            key
            value
          }
        }
      }
    }
  `,
};

export const fetchRepairWorkers = async () => {
  const client = secureSaleorClient();

  const result = await client.execute(repairWorkersQuery, {
    operationName: "RepairWorkersQuery",
    variables: {
      first: 100,
      metadataKey: REPAIR_METADATA_KEYS.role,
      metadataValue: REPAIR_ROLE.worker,
    },
    options: {
      cache: "no-store",
    },
  });

  if (!result.ok) {
    throw new Error("Failed to fetch repair workers");
  }

  const data = result.data as {
    customers?: {
      edges?: WorkerEdge[];
    };
  };

  const edges = (data.customers?.edges ?? []);

  return edges
    .filter((edge): edge is WorkerEdge => Boolean(edge?.node))
    .map((edge) => {
      const metadata = toMetadataRecord(edge.node.metadata);

      return {
        id: edge.node.id,
        email: edge.node.email,
        firstName: edge.node.firstName,
        lastName: edge.node.lastName,
        dateJoined: edge.node.dateJoined,
        status: metadata[REPAIR_METADATA_KEYS.status] ?? REPAIR_STATUS.pending,
        phone: metadata[REPAIR_METADATA_KEYS.phone] ?? "",
      };
    });
};

export const updateRepairWorkerStatus = async ({
  id,
  status,
}: {
  id: string;
  status: string;
}) => {
  const client = secureSaleorClient();

  const result = await client.execute(repairWorkerUpdateMutation, {
    operationName: "RepairWorkerUpdateMutation",
    variables: {
      id,
      metadata: [
        { key: REPAIR_METADATA_KEYS.role, value: REPAIR_ROLE.worker },
        { key: REPAIR_METADATA_KEYS.status, value: status },
      ],
    },
    options: {
      cache: "no-store",
    },
  });

  if (!result.ok) {
    throw new Error("Failed to update worker status");
  }

  const updatePayload = result.data as {
    customerUpdate?: {
      errors: Array<{ message?: string }>;
      user?: {
        metadata?: Array<{ key: string; value: string | null }>;
      };
    };
  };

  if (updatePayload.customerUpdate?.errors.length) {
    throw new Error("Failed to update worker status");
  }

  const metadata = toMetadataRecord(
    (updatePayload.customerUpdate?.user?.metadata ??
      []) as WorkerEdge["node"]["metadata"],
  );

  return metadata[REPAIR_METADATA_KEYS.status] ?? REPAIR_STATUS.pending;
};
