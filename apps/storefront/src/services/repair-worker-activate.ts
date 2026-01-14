import { secureSaleorClient } from "@/graphql/client";

const activateStaffMutation = {
  toString: () => `
    mutation RepairWorkerActivateMutation($id: ID!, $isActive: Boolean) {
      staffUpdate(id: $id, input: { isActive: $isActive }) {
        errors {
          field
          message
          code
        }
      }
    }
  `,
};

export const activateRepairWorker = async (id: string) => {
  const client = secureSaleorClient();

  const result = await client.execute(activateStaffMutation, {
    operationName: "RepairWorkerActivateMutation",
    variables: {
      id,
      isActive: true,
    },
    options: {
      cache: "no-store",
    },
  });

  if (!result.ok) {
    throw new Error("Failed to activate worker");
  }

  const errors = (
    result.data as { staffUpdate?: { errors?: Array<{ message?: string }> } }
  ).staffUpdate?.errors;

  if (errors && errors.length) {
    throw new Error("Failed to activate worker");
  }
};
