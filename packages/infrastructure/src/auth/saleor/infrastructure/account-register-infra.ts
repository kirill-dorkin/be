import { err, ok } from "@nimara/domain/objects/Result";
import { type NonEmptyArray } from "@nimara/domain/objects/types";

import { graphqlClient } from "#root/graphql/client";

import type {
  AccountRegisterInfra,
  SaleorAuthServiceConfig,
} from "../../types";
import { AccountRegisterMutationDocument } from "../graphql/mutations/generated";

export const saleorAccountRegisterInfra =
  ({ apiURL, logger }: SaleorAuthServiceConfig): AccountRegisterInfra =>
  async (accountRegisterInput) => {
    const result = await graphqlClient(apiURL).execute(
      AccountRegisterMutationDocument,
      {
        variables: { accountRegisterInput },
        operationName: "AccountRegisterMutation",
      },
    );

    if (!result.ok) {
      logger.error("Failed to register account.", { errors: result.errors });

      return result;
    }

    const accountErrors = result.data.accountRegister?.errors ?? [];

    if (accountErrors.length) {
      logger.error("Account register mutation returned errors.", {
        error: accountErrors,
      });

      const normalizedErrors = accountErrors.map((error) => {
        const normalizedCode = error.code === "UNIQUE" ? "UNIQUE_ERROR" : "ACCOUNT_REGISTER_ERROR";

        return {
          code: normalizedCode,
          field: error.field ?? undefined,
          message: error.message ?? undefined,
          originalError: error,
        };
      }) as NonEmptyArray<{
        code: "UNIQUE_ERROR" | "ACCOUNT_REGISTER_ERROR";
        field: string | undefined;
        message: string | undefined;
        originalError: typeof accountErrors[number];
      }>;

      return err(normalizedErrors);
    }

    return ok({ success: true });
  };
