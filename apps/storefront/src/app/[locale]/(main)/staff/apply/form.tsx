"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";

import { TextFormField } from "@/components/form/text-form-field";
import { MIN_PASSWORD_LENGTH } from "@/config";

import { submitWorkerApplication } from "./actions";
import { applyFormSchema, type ApplyFormValues } from "./schema";

export const WorkerApplyForm = () => {
  const t = useTranslations("staff-apply");
  const tc = useTranslations("common");
  const ta = useTranslations("auth");
  const te = useTranslations("errors");

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
    },
  });

  const isProcessing = form.formState.isSubmitting;

  const handleSubmit = async (values: ApplyFormValues) => {
    setIsSubmitted(false);
    setStatusMessage(null);
    const result = await submitWorkerApplication(values);

    if (result.ok) {
      setIsSubmitted(true);
      form.reset();

      return;
    }

    if (result.error && typeof result.error === "object" && "fieldErrors" in result.error) {
      const { fieldErrors = {}, formErrors = [] } = result.error as {
        fieldErrors?: Record<string, string[]>;
        formErrors?: string[];
      };

      Object.entries(fieldErrors).forEach(([field, messages]) => {
        if (messages?.length) {
          form.setError(field as keyof ApplyFormValues, {
            message: messages[0],
          });
        }
      });

      if (formErrors.length) {
        form.setError("email", { message: formErrors[0] });
        setStatusMessage(formErrors[0]);
      }

      return;
    }

    if (Array.isArray(result.error)) {
      result.error.forEach((error, index) => {
        const fallbackMessage = error.message || te(error.code);
        const targetField = (error.field as keyof ApplyFormValues | undefined) ?? "email";

        form.setError(targetField, {
          message: fallbackMessage,
        });

        if (index === 0) {
          setStatusMessage(fallbackMessage);
        }
      });

      return;
    }

    setStatusMessage(t("submit-error-general"));
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-y-4"
        noValidate
      >
        {isSubmitted && (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800">
            <span className="flex items-center gap-2 text-base font-semibold">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white">
                ✓
              </span>
              {t("success-title")}
            </span>
            <p className="text-muted-foreground text-sm">{t("success-description")}</p>
          </div>
        )}
        {statusMessage && (
          <div className="text-destructive text-sm" role="alert">
            {statusMessage}
          </div>
        )}
        <div className="flex flex-col gap-3 md:flex-row">
          <TextFormField
            name="firstName"
            label={tc("first-name")}
            autoComplete="given-name"
            className="md:w-1/2"
          />
          <TextFormField
            name="lastName"
            label={tc("last-name")}
            autoComplete="family-name"
            className="md:w-1/2"
          />
        </div>
        <TextFormField
          name="email"
          label={tc("email")}
          type="email"
          autoComplete="email"
        />
        <TextFormField
          name="phone"
          label={tc("phone")}
          autoComplete="tel"
        />
        <TextFormField
          name="password"
          label={tc("password")}
          type="password"
          placeholder={ta("password-placeholder", {
            minPasswordLength: MIN_PASSWORD_LENGTH,
          })}
          autoComplete="new-password"
        />

        <Button type="submit" disabled={isProcessing} loading={isProcessing}>
          {isProcessing ? t("submit-loading") : t("submit")}
        </Button>
      </form>
    </Form>
  );
};
