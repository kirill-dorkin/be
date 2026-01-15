import { serverEnvs } from "@/envs/server";
import { secureSaleorClient } from "@/graphql/client";
import {
  REPAIR_METADATA_KEYS,
  REPAIR_ROLE,
  REPAIR_STATUS,
} from "@/lib/repair/metadata";

type WorkerNode = {
  dateJoined: string;
  email: string;
  firstName: string;
  id: string;
  isActive: boolean | null;
  lastName: string;
  metadata: Array<{ key: string; value: string | null }> | null;
};

const toMetadataRecord = (
  metadata: WorkerNode["metadata"] | Array<{ key: string; value: string | null }>,
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
    query RepairWorkersQuery($first: Int!, $groupName: String!) {
      permissionGroups(first: $first, filter: { search: $groupName }) {
        edges {
          node {
            id
            name
            users {
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
        }
      }
    }
  `,
};

const repairWorkerUpdateMutation = {
  toString: () => `
    mutation RepairWorkerUpdateMutation($id: ID!, $metadata: [MetadataInput!]!, $addGroups: [ID!]) {
      staffUpdate(id: $id, input: { metadata: $metadata, addGroups: $addGroups }) {
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
      first: 3,
      groupName: serverEnvs.SERVICE_WORKER_GROUP_NAME,
    },
    options: {
      cache: "no-store",
    },
  });

  if (!result.ok) {
    throw new Error("Failed to fetch repair workers");
  }

  const groups = (result.data as any).permissionGroups?.edges ?? [];
  const users: WorkerNode[] = groups.flatMap(
    (edge: { node?: { users?: WorkerNode[] } }) => edge?.node?.users ?? [],
  );

  return users.map((user) => {
    const metadata = toMetadataRecord(user.metadata);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateJoined: user.dateJoined,
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
  const workerGroupName = serverEnvs.SERVICE_WORKER_GROUP_NAME;

  const groupResult = await client.execute(
    `
    query WorkerGroupIdQuery($search: String!) {
      permissionGroups(first: 1, filter: { search: $search }) {
        edges { node { id name } }
      }
    }
  `,
    {
      operationName: "WorkerGroupIdQuery",
      variables: { search: workerGroupName },
      options: { cache: "no-store" },
    },
  );

  const groupId =
    groupResult.ok &&
    groupResult.data.permissionGroups?.edges?.[0]?.node?.id
      ? groupResult.data.permissionGroups.edges[0].node.id
      : null;

  const result = await client.execute(repairWorkerUpdateMutation, {
    operationName: "RepairWorkerUpdateMutation",
    variables: {
      id,
      metadata: [
        { key: REPAIR_METADATA_KEYS.role, value: REPAIR_ROLE.worker },
        { key: REPAIR_METADATA_KEYS.status, value: status },
      ],
      addGroups: groupId ? [groupId] : [],
    },
    options: {
      cache: "no-store",
    },
  });

  if (!result.ok) {
    throw new Error("Failed to update worker status");
  }

  const updatePayload = result.data as {
    staffUpdate?: {
      errors: Array<{ message?: string }>;
      user?: {
        metadata?: Array<{ key: string; value: string | null }>;
      };
    };
  };

  if (updatePayload.staffUpdate?.errors.length) {
    throw new Error("Failed to update worker status");
  }

  const metadata = toMetadataRecord(
    updatePayload.staffUpdate?.user?.metadata ?? [],
  );

  return metadata[REPAIR_METADATA_KEYS.status] ?? REPAIR_STATUS.pending;
};
