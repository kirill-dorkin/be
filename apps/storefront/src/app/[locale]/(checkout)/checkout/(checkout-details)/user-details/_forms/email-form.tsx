"use client";

import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { FieldType } from "@nimara/domain/objects/AddressForm";
import type { Checkout } from "@nimara/domain/objects/Checkout";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { TextFormField } from "@/components/form/text-form-field";
import { useRouterWithState } from "@/lib/hooks";
import { cn } from "@/lib/utils";
import type { TranslationMessage } from "@/types";

import { checkIfUserHasAnAccount, updateUserDetails } from "./actions";
import { type EmailFormSchema } from "./schema";

const UserEmailFormComponent = ({
  checkout,
  form,
  setUserAccountEmail,
}: {
  checkout: Checkout;
  form: UseFormReturn<EmailFormSchema>;
  setUserAccountEmail: (email: string) => void;
}) => {
  const t = useTranslations();
  const { isRedirecting, push } = useRouterWithState();

  // Мемоизация флага disabled
  const isDisabled = useMemo(
    () => isRedirecting || form.formState?.isSubmitting,
    [isRedirecting, form.formState?.isSubmitting]
  );

  // Мемоизация обработчика submit
  const handleSubmit = useCallback(async ({ email }: EmailFormSchema) => {
    console.log("🔵 Form submitted with email:", email);

    try {
      console.log("🔵 Checking if user exists...");
      const checkResult = await checkIfUserHasAnAccount(email);
      console.log("🔵 Check result:", checkResult);

      if (checkResult.ok && checkResult.data.user) {
        console.log("🔵 User found, setting email:", checkResult.data.user.email);
        setUserAccountEmail(checkResult.data.user.email);

        return;
      }

      console.log("🔵 User not found, updating checkout email...");
      const result = await updateUserDetails({
        checkout,
        email,
      });
      console.log("🔵 Update result:", result);

      if (result.ok) {
        console.log("🔵 Redirecting to:", result.data.redirectUrl);
        push(result.data.redirectUrl);

        return;
      }

      console.log("🔴 Update failed with errors:", result.errors);
      result.errors.map((error) => {
        if (error.field) {
          form.setError(error.field as keyof EmailFormSchema, {
            message: t(`errors.${error.code}`),
          });
        } else {
          form.setError("root", {
            message: t(`errors.${error.code}`),
          });
        }
      });
    } catch (error) {
      console.error("🔴 Email form submission error:", error);
      form.setError("root", {
        message: t("errors.UNKNOWN_ERROR"),
      });
    }
  }, [checkout, setUserAccountEmail, push, form, t]);

  // Мемоизация кода ошибки сервера
  const serverErrorCode = useMemo(
    () => form.formState.errors.root?.message,
    [form.formState.errors.root?.message]
  );

  console.log("🟡 Email form render - isDisabled:", isDisabled, "isRedirecting:", isRedirecting, "isSubmitting:", form.formState.isSubmitting);

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          console.log("🟢 Form onSubmit event triggered");
          form.handleSubmit(handleSubmit)(e);
        }}
        className="flex flex-col gap-y-2"
        id="user-details-email-form"
        noValidate
      >
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <div className="flex-grow">
              <TextFormField
                label={t("user-details.email")}
                name="email"
                type={"email" as FieldType}
                isRequired={true}
              />
            </div>
            <Button
              className={cn({ "mb-[1.813rem]": form.formState.errors.email })}
              type="submit"
              form="user-details-email-form"
              disabled={isDisabled}
              loading={isDisabled}
              onClick={() => console.log("🟢 Button clicked")}
            >
              {isDisabled ? t("common.saving") : t("common.continue")}
            </Button>
          </div>
        </div>
        {serverErrorCode && (
          <p className="text-destructive">
            {t(serverErrorCode as TranslationMessage)}
          </p>
        )}
      </form>
    </Form>
  );
};

// Мемоизация - форма email пользователя в checkout
export const UserEmailForm = memo(UserEmailFormComponent, (prevProps, nextProps) => {
  return prevProps.checkout.id === nextProps.checkout.id;
});
