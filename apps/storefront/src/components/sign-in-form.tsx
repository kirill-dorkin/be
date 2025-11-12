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
import { LocalizedLink } from "@/i18n/routing";
import { login } from "@/lib/actions/login";
import { useRouterWithState } from "@/lib/hooks";
import { paths } from "@/lib/paths";

import { ResetPasswordLink } from "./reset-password-link";
import { type SignInSchema, signInSchema } from "./schema";

function SignInFormComponent({ redirectUrl }: { redirectUrl?: string }) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { isRedirecting, push } = useRouterWithState();

  // Мемоизация флагов
  const hasPasswordChanged = useMemo(
    () => searchParams.get("hasPasswordChanged") === "true",
    [searchParams]
  );
  const isFromConfirmation = useMemo(
    () => searchParams.get("confirmationSuccess") === "true",
    [searchParams]
  );

  const form = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema({ t })),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Мемоизация isDisabled
  const isDisabled = useMemo(
    () => isRedirecting || form.formState?.isSubmitting,
    [isRedirecting, form.formState?.isSubmitting]
  );

  // Мемоизация redirectTarget
  const redirectTarget = useMemo(
    () => redirectUrl ?? searchParams.get("redirectUrl") ?? undefined,
    [redirectUrl, searchParams]
  );

  // Мемоизация handleSubmit
  const handleSubmit = useCallback(async (values: SignInSchema) => {
    const data = await login({ ...values, redirectUrl: redirectTarget });

    if (data.redirectUrl) {
      push(data.redirectUrl);
    }

    if (data.error) {
      form.setError("email", { message: "" });
      form.setError("password", { message: "" });
    }
  }, [redirectTarget, push, form]);

  useEffect(() => {
    const toastTimeout = setTimeout(() => {
      if (isFromConfirmation) {
        toast({
          description: t("auth.confirm-account-success"),
          position: "center",
        });
      }
    }, 500);

    return () => window.clearTimeout(toastTimeout);
  }, [isFromConfirmation]);

  useEffect(() => {
    if (hasPasswordChanged) {
      toast({
        description: t("auth.set-up-new-password-success"),
        position: "center",
      });
    }
  }, [hasPasswordChanged]);

  return (
    <>
      <h1 className="text-slate-700 dark:text-primary pb-8 text-2xl font-normal leading-8">
        {t("auth.sign-in")}
      </h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col gap-y-2"
          id="sign-in-form"
          noValidate
        >
          {(form?.formState?.errors?.email ||
            form?.formState?.errors?.password) && (
            <p className="text-destructive pb-2 text-sm">
              {t("auth.sign-in-error")}
            </p>
          )}
          <div className="text-foreground w-full">
            <TextFormField
              name="email"
              label={t("common.email")}
              type="email"
            />
          </div>
          <div className="text-foreground w-full">
            <TextFormField
              name="password"
              label={t("common.password")}
              type="password"
            />
          </div>
          <div>
            <ResetPasswordLink />
          </div>

          <Button
            className="my-4 w-full"
            type="submit"
            form="sign-in-form"
            disabled={isDisabled}
            loading={isDisabled}
          >
            {isDisabled ? t("common.please-wait") : t("auth.sign-in")}
          </Button>
        </form>
      </Form>
      <p className="text-muted-foreground text-sm">
        {t.rich("staff.apply-cta", {
          link: (chunks) => (
            <LocalizedLink
              href={paths.staff.apply.asPath()}
              className="underline underline-offset-2"
            >
              {chunks}
            </LocalizedLink>
          ),
        })}
      </p>
    </>
  );
}

// Мемоизация - форма входа
export const SignInForm = memo(SignInFormComponent, (prevProps, nextProps) => {
  return prevProps.redirectUrl === nextProps.redirectUrl;
});
