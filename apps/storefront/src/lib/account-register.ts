type AccountRegisterError = {
  field?: string;
  originalError?: unknown;
};

const isRedirectRequiredError = (error: AccountRegisterError) => {
  if (error.field !== "redirectUrl") {
    return false;
  }

  if (
    typeof error.originalError === "object" &&
    error.originalError !== null &&
    "code" in error.originalError
  ) {
    const { code } = error.originalError as { code?: string | null };

    return code === "REQUIRED";
  }

  return false;
};

/**
 * Determines whether account registration should be retried with a redirect URL.
 * Saleor requires the `redirectUrl` only when email confirmation is enabled.
 */
export const shouldRetryAccountRegisterWithRedirect = (
  errors?: AccountRegisterError[],
) => Boolean(errors?.some(isRedirectRequiredError));
