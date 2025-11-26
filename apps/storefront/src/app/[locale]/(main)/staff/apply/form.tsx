"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Bike, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { cn } from "@nimara/ui/lib/utils";

import { TextFormField } from "@/components/form/text-form-field";
import { MIN_PASSWORD_LENGTH } from "@/config";
import { REPAIR_ROLE } from "@/lib/repair/metadata";

import { submitWorkerApplication } from "./actions";
import { applyFormSchema, type ApplyFormValues } from "./schema";

export const WorkerApplyForm = () => {
  const t = useTranslations("staff-apply");
  const tc = useTranslations("common");
  const ta = useTranslations("auth");
  const te = useTranslations("errors");

  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [renderSuccess, setRenderSuccess] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const hideTimerRef = useRef<NodeJS.Timeout | null>(null);
  const unmountTimerRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<ApplyFormValues>({
    resolver: zodResolver(applyFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      role: REPAIR_ROLE.worker,
    },
  });

  const isProcessing = form.formState.isSubmitting;
  const selectedRole = form.watch("role");

  const clearSuccessTimers = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (unmountTimerRef.current) {
      clearTimeout(unmountTimerRef.current);
      unmountTimerRef.current = null;
    }
  };

  const showSuccessMessage = () => {
    clearSuccessTimers();
    setRenderSuccess(true);
    setShowSuccess(true);

    hideTimerRef.current = setTimeout(() => {
      setShowSuccess(false);
      unmountTimerRef.current = setTimeout(() => {
        setRenderSuccess(false);
      }, 350);
    }, 10000);
  };

  useEffect(() => () => clearSuccessTimers(), []);

  const handleSubmit = async (values: ApplyFormValues) => {
    clearSuccessTimers();
    setRenderSuccess(false);
    setShowSuccess(false);
    setStatusMessage(null);
    const result = await submitWorkerApplication(values);

    if (result.ok) {
      showSuccessMessage();
      const currentRole = form.getValues("role");

      form.reset({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        role: currentRole,
      });

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
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">
            {t("role.label")}
          </p>
          <p className="text-muted-foreground text-sm">
            {t("role.hint")}
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              {
                value: REPAIR_ROLE.worker,
                title: t("role.repair.title"),
                description: t("role.repair.description"),
                icon: <Wrench className="h-5 w-5" aria-hidden="true" />,
              },
              {
                value: REPAIR_ROLE.courier,
                title: t("role.courier.title"),
                description: t("role.courier.description"),
                icon: <Bike className="h-5 w-5" aria-hidden="true" />,
              },
            ].map((option) => {
              const isActive = selectedRole === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => form.setValue("role", option.value, { shouldDirty: true })}
                  className={cn(
                    "flex h-full flex-col gap-2 rounded-2xl border p-4 text-left transition hover:border-primary/50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                    isActive
                      ? "border-primary bg-primary/5 shadow-sm"
                      : "border-border/70 bg-background",
                  )}
                  aria-pressed={isActive}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-full",
                        isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                      )}
                    >
                      {option.icon}
                    </span>
                    <span className="font-semibold text-foreground">{option.title}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {renderSuccess && (
          <div
            className={cn(
              "flex flex-col items-start gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm transition-all duration-500 ease-out",
              showSuccess
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0",
            )}
            role="status"
            aria-live="polite"
          >
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
