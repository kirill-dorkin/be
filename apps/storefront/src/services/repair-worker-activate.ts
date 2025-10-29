import { secureSaleorClient } from "@/graphql/client";

const activateCustomerMutation = {
  toString: () => `
    mutation RepairWorkerActivateMutation($id: ID!, $isActive: Boolean) {
      customerUpdate(id: $id, input: { isActive: $isActive }) {
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

  const result = await client.execute(activateCustomerMutation, {
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

  const errors = (result.data as { customerUpdate?: { errors?: Array<{ message?: string }> } }).customerUpdate?.errors;

  if (errors && errors.length) {
    throw new Error("Failed to activate worker");
  }
};
