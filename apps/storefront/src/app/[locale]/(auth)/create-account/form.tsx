"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { memo, useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { TextFormField } from "@/components/form/text-form-field";
import { MIN_PASSWORD_LENGTH } from "@/config";
import { LocalizedLink } from "@/i18n/routing";
import { useRouterWithState } from "@/lib/hooks";
import { paths } from "@/lib/paths";

import { registerAccount } from "./actions";
import { type FormSchema, formSchema } from "./schema";

const SignUpFormComponent = () => {
  const t = useTranslations();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") || "";

  const { isRedirecting, push } = useRouterWithState();

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema({ t })),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirm: "",
      referralCode: referralCode,
    },
  });

  // Update referral code if URL changes
  useEffect(() => {
    if (referralCode) {
      form.setValue("referralCode", referralCode);
    }
  }, [referralCode, form]);

  // Мемоизация isDisabled
  const isDisabled = useMemo(
    () => isRedirecting || form.formState?.isSubmitting,
    [isRedirecting, form.formState?.isSubmitting],
  );

  // Мемоизация обработчика submit
  const handleSubmit = useCallback(
    async (values: FormSchema) => {
      const result = await registerAccount(values);

      console.log(
        "[CreateAccount Form] Full result:",
        JSON.stringify(result, null, 2),
      );

      if (result.ok) {
        // Check if email confirmation is required
        if (result.data?.requiresEmailConfirmation) {
          toast({
            description: t("auth.create-account-success-confirm-email"),
            position: "center",
            duration: 10000,
          });
        } else {
          toast({
            description: t("auth.create-account-success"),
            position: "center",
          });
        }

        const redirectTarget =
          result.data?.redirectUrl ?? paths.account.profile.asPath();

        push(redirectTarget);

        return;
      }

      const getErrorMessage = (
        error?: (typeof result.errors)[number],
      ): string => {
        if (!error) {
          return t("auth.create-account-error");
        }

        if (error.message) {
          return error.message;
        }

        if (error.code) {
          try {
            return t(`errors.${error.code}` as any);
          } catch {
            // no-op
          }
        }

        return t("auth.create-account-error");
      };

      const firstErrorMessage = getErrorMessage(result.errors[0]);

      toast({
        description: firstErrorMessage,
        position: "center",
        variant: "destructive",
      });

      result.errors.forEach((error) => {
        const message = getErrorMessage(error);

        if (error.field) {
          form.setError(error.field as keyof FormSchema, {
            message,
          });
        } else {
          form.setError("email", {
            message,
          });
        }
      });

      return;
    },
    [push, form, t, toast],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-2"
        id="create-account-form"
        noValidate
      >
        <div className="flex gap-4">
          <div className="w-1/2">
            <TextFormField
              name="firstName"
              label={t("common.first-name")}
              autoComplete="given-name"
            />
          </div>
          <div className="w-1/2">
            <TextFormField
              name="lastName"
              label={t("common.last-name")}
              autoComplete="family-name"
            />
          </div>
        </div>
        <div className="w-full">
          <TextFormField
            name="email"
            label={t("common.email")}
            placeholder={t("auth.email-placeholder")}
            type="email"
          />
        </div>
        <div className="w-full">
          <TextFormField
            name="password"
            label={t("common.password")}
            type="password"
            placeholder={t("auth.password-placeholder", {
              minPasswordLength: MIN_PASSWORD_LENGTH,
            })}
          />
        </div>
        <div className="w-full">
          <TextFormField
            name="confirm"
            label={t("auth.confirm-password")}
            type="password"
          />
        </div>
        <div className="mt-7">
          <p className="dark:text-muted-foreground text-sm text-stone-700">
            {t.rich("auth.create-account-agreement", {
              termsOfUse: () => (
                <LocalizedLink
                  href={paths.termsOfUse.asPath()}
                  className="underline decoration-gray-400 underline-offset-2 dark:decoration-gray-300"
                >
                  {t("common.terms-of-use")}
                </LocalizedLink>
              ),
              privacyPolicy: () => (
                <LocalizedLink
                  href={paths.privacyPolicy.asPath()}
                  className="underline decoration-gray-400 underline-offset-2 dark:decoration-gray-300"
                >
                  {t("common.privacy-policy")}
                </LocalizedLink>
              ),
            })}
          </p>
        </div>
        <Button
          className="my-4 w-full"
          type="submit"
          form="create-account-form"
          disabled={isDisabled}
          loading={isDisabled}
        >
          {t("auth.create-account")}
        </Button>
      </form>
    </Form>
  );
};

// Мемоизация - форма регистрации
export const SignUpForm = memo(SignUpFormComponent);
