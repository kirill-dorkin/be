"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { memo, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { TextFormField } from "@/components/form/text-form-field";
import { ResetPasswordLink } from "@/components/reset-password-link";
import { login } from "@/lib/actions/login";
import { useRouterWithState } from "@/lib/hooks";
import { paths } from "@/lib/paths";

import { type PasswordFormSchema, passwordFormSchema } from "./schema";

const UserPasswordFormComponent = ({
  userAccountEmail,
}: {
  userAccountEmail: string;
}) => {
  const t = useTranslations();

  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<PasswordFormSchema>({
    resolver: zodResolver(passwordFormSchema({ t })),
    defaultValues: {
      password: "",
    },
  });

  // Мемоизация флага disabled
  const isDisabled = useMemo(
    () => isRedirecting || form.formState?.isSubmitting,
    [isRedirecting, form.formState?.isSubmitting],
  );

  // Мемоизация обработчика submit
  const handleSubmit = useCallback(
    async ({ password }: PasswordFormSchema) => {
      const data = await login({
        email: userAccountEmail,
        password,
        redirectUrl: paths.checkout.shippingAddress.asPath(),
      });

      if (data.redirectUrl) {
        push(data.redirectUrl);
      }

      if (data?.error) {
        form.setError("password", { message: t("auth.sign-in-error") });
      }
    },
    [userAccountEmail, push, form, t],
  );

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 py-4"
        onSubmit={form.handleSubmit(handleSubmit)}
        id="user-details-password-form"
        noValidate
      >
        <TextFormField
          name="password"
          label={t("common.password")}
          type="password"
        />
        <div>
          <ResetPasswordLink />
        </div>

        <Button
          type="submit"
          className="ml-2"
          form="user-details-password-form"
          disabled={isDisabled}
          loading={isDisabled}
        >
          {isDisabled ? t("common.please-wait") : t("common.continue")}
        </Button>
      </form>
    </Form>
  );
};

// Мемоизация - форма пароля пользователя в checkout
export const UserPasswordForm = memo(
  UserPasswordFormComponent,
  (prevProps, nextProps) => {
    return prevProps.userAccountEmail === nextProps.userAccountEmail;
  },
);
