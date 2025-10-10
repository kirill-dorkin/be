"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";
import { Form } from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { CheckboxField } from "@/components/form/checkbox-field";
import { SelectFormField } from "@/components/form/select-form-field";
import { TextFormField } from "@/components/form/text-form-field";
import { TextareaField } from "@/components/form/textarea-field";
import { formatAsPrice } from "@/lib/formatters/util";
import {
  type RepairService,
  type RepairServiceCategory,
} from "@/lib/repair-services/data";
import type {
  SupportedCurrency,
  SupportedLocale,
} from "@/regions/types";

const URGENCY_MULTIPLIER = 1.25;
const PICKUP_FEE = 500;

type Translator = ReturnType<typeof useTranslations>;

const buildSchema = (t: Translator) =>
  z
    .object({
      deviceType: z
        .string()
        .min(1, t("calculator.errors.deviceType"))
        .max(40),
      serviceSlug: z
        .string()
        .min(1, t("calculator.errors.serviceSlug"))
        .max(120),
      fullName: z
        .string()
        .min(2, t("calculator.errors.fullNameMin"))
        .max(120, t("calculator.errors.fullNameMax")),
      phone: z
        .string()
        .min(5, t("calculator.errors.phoneMin"))
        .max(40, t("calculator.errors.phoneMax")),
      email: z
        .string()
        .email(t("calculator.errors.email"))
        .max(120, t("calculator.errors.email"))
        .optional()
        .or(z.literal("").optional()),
      message: z
        .string()
        .max(2000, t("calculator.errors.messageMax"))
        .optional()
        .or(z.literal("").optional()),
      urgent: z.boolean().optional().default(false),
      needsPickup: z.boolean().optional().default(false),
      preferredContact: z
        .enum(["phone", "email"], {
          errorMap: () => ({
            message: t("calculator.errors.preferredContact"),
          }),
        })
        .default("phone"),
      consent: z.literal(true, {
        errorMap: () => ({
          message: t("calculator.errors.consent"),
        }),
      }),
    })
    .refine(
      (data) => {
        if (!data.email) {
          return true;
        }
        const trimmed = data.email.trim();

        
return trimmed.length === 0 || z.string().email().safeParse(trimmed).success;
      },
      {
        path: ["email"],
        message: t("calculator.errors.email"),
      },
    );

type FormSchema = z.infer<ReturnType<typeof buildSchema>>;

type ServiceOption = {
  label: string;
  service: RepairService;
};

const toPriceLabel = ({
  locale,
  currency,
  price,
  labels,
}: {
  currency: SupportedCurrency;
  labels: {
    fixed: string;
    from: string;
    range: string;
  };
  locale: SupportedLocale;
  price: {
    kind: RepairService["price"]["kind"];
    max: number | null;
    min: number;
  };
}) => {
  const formatPrice = (amount: number) =>
    formatAsPrice({ amount, currency, locale });

  if (price.kind === "from" || price.max === null) {
    return labels.from.replace("{price}", formatPrice(price.min));
  }

  if (price.kind === "range") {
    return labels.range
      .replace("{min}", formatPrice(price.min))
      .replace("{max}", formatPrice(price.max));
  }

  return labels.fixed.replace("{price}", formatPrice(price.min));
};

export const ServicesEstimator = ({
  catalog,
  currency,
  locale: serverLocale,
  initialServiceSlug,
}: {
  catalog: RepairServiceCategory[];
  currency: SupportedCurrency;
  initialServiceSlug?: string;
  locale: SupportedLocale;
}) => {
  const locale = useLocale() as SupportedLocale;
  const activeLocale = locale ?? serverLocale;

  const t = useTranslations("services");
  const { toast } = useToast();

  const schema = useMemo(() => buildSchema(t), [t]);

  const allServices = useMemo(
    () => catalog.flatMap((category) => category.services),
    [catalog],
  );

  const serviceIndex = useMemo(
    () =>
      new Map(allServices.map((service) => [service.slug, service] as const)),
    [allServices],
  );

  const initialService =
    (initialServiceSlug
      ? serviceIndex.get(initialServiceSlug)
      : undefined) ?? null;

  const servicesByDevice = useMemo(() => {
    const map = new Map<string, ServiceOption[]>();

    for (const category of catalog) {
      for (const service of category.services) {
        const options = map.get(service.deviceType) ?? [];

        options.push({
          label: `${category.name} · ${service.name}`,
          service,
        });
        map.set(service.deviceType, options);
      }
    }

    for (const [device, options] of map.entries()) {
      options.sort((a, b) =>
        a.label.localeCompare(b.label, activeLocale, {
          sensitivity: "base",
        }),
      );
      map.set(device, options);
    }

    return map;
  }, [catalog, activeLocale]);

  const deviceOptions = useMemo(
    () =>
      Array.from(servicesByDevice.keys()).map((deviceType) => ({
        value: deviceType,
        label: t(`deviceLabels.${deviceType}`),
      })),
    [servicesByDevice, t],
  );

  const defaultDeviceType =
    initialService?.deviceType ??
    deviceOptions[0]?.value ??
    servicesByDevice.keys().next().value ??
    "";

  const defaultServiceSlug =
    initialService?.slug ??
    servicesByDevice.get(defaultDeviceType)?.[0]?.service.slug ??
    "";

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      deviceType: defaultDeviceType,
      serviceSlug: defaultServiceSlug,
      fullName: "",
      phone: "",
      email: "",
      message: "",
      urgent: false,
      needsPickup: false,
      preferredContact: "phone",
      consent: false,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = form;

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const deviceType = watch("deviceType");
  const serviceSlug = watch("serviceSlug");
  const urgent = watch("urgent");
  const needsPickup = watch("needsPickup");

  useEffect(() => {
    if (!deviceType) {
      return;
    }

    const options = servicesByDevice.get(deviceType) ?? [];

    if (options.length === 0) {
      setValue("serviceSlug", "");
      return;
    }

    const hasCurrentSelection = options.some(
      ({ service }) => service.slug === serviceSlug,
    );

    if (!hasCurrentSelection) {
      setValue("serviceSlug", options[0]?.service.slug ?? "");
    }
  }, [deviceType, serviceSlug, servicesByDevice, setValue]);

  const selectedService =
    (serviceSlug ? serviceIndex.get(serviceSlug) : undefined) ?? null;

  const priceLabelStrings = useMemo(() => {
    const tr = t;

    return {
      fixed: tr.raw("calculator.priceLabel.fixed"),
      from: tr.raw("calculator.priceLabel.from"),
      range: tr.raw("calculator.priceLabel.range"),
    };
  }, [t]);

  const estimate = useMemo(() => {
    if (!selectedService) {
      return null;
    }

    let min = selectedService.price.min;
    let max =
      selectedService.price.kind === "from" || selectedService.price.max === null
        ? null
        : selectedService.price.max;

    if (urgent) {
      min *= URGENCY_MULTIPLIER;
      if (max !== null) {
        max *= URGENCY_MULTIPLIER;
      }
    }

    if (needsPickup) {
      min += PICKUP_FEE;
      if (max !== null) {
        max += PICKUP_FEE;
      }
    }

    return {
      min,
      max,
      kind: selectedService.price.kind,
    };
  }, [selectedService, urgent, needsPickup]);

  const estimateLabel = useMemo(() => {
    if (!estimate || !selectedService) {
      return t("calculator.estimateUnavailable");
    }

    return toPriceLabel({
      currency,
      locale: activeLocale,
      price: {
        min: estimate.min,
        max: estimate.max,
        kind: selectedService.price.kind,
      },
      labels: priceLabelStrings,
    });
  }, [
    estimate,
    selectedService,
    currency,
    activeLocale,
    priceLabelStrings,
  ]);

  const onSubmit = async (values: FormSchema) => {
    if (!selectedService || !estimate) {
      toast({
        description: t("calculator.submitError"),
        variant: "destructive",
      });
      return;
    }

    const payload = {
      ...values,
      email: values.email?.trim() || undefined,
      message: values.message?.trim() || undefined,
      priceEstimate: {
        min: Number(estimate.min.toFixed(2)),
        max:
          estimate.max !== null ? Number(estimate.max.toFixed(2)) : null,
        currency,
      },
      modifiers: {
        urgent: values.urgent ? URGENCY_MULTIPLIER : 1,
        pickup: values.needsPickup ? PICKUP_FEE : 0,
      },
    };

    try {
      const response = await fetch("/api/service-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      toast({
        description: t("calculator.submitSuccess"),
        variant: "default",
      });

      setHasSubmitted(true);

      form.reset({
        deviceType: values.deviceType,
        serviceSlug: values.serviceSlug,
        urgent: values.urgent,
        needsPickup: values.needsPickup,
        preferredContact: values.preferredContact,
        fullName: "",
        phone: "",
        email: "",
        message: "",
        consent: false,
      });
    } catch (error) {
      toast({
        description: t("calculator.submitError"),
        variant: "destructive",
      });
      console.error("Service request failed", error);
    }
  };

  const serviceOptions = useMemo(
    () =>
      (servicesByDevice.get(deviceType) ?? []).map(({ service, label }) => ({
        value: service.slug,
        label,
      })),
    [deviceType, servicesByDevice],
  );

  return (
    <section className="bg-muted/50 rounded-lg p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">
          {t("calculator.title")}
        </h2>
        <p className="text-muted-foreground max-w-2xl text-sm">
          {t("calculator.subtitle")}
        </p>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Form {...form}>
          <form
            className="grid gap-4"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectFormField
                name="deviceType"
                label={t("calculator.deviceTypeLabel")}
                placeholder={t("calculator.deviceTypePlaceholder")}
                isRequired
                options={deviceOptions}
              />
              <SelectFormField
                name="serviceSlug"
                label={t("calculator.serviceLabel")}
                placeholder={t("calculator.servicePlaceholder")}
                isRequired
                options={serviceOptions}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextFormField
                name="fullName"
                label={t("calculator.fullName")}
                placeholder={t("calculator.fullNamePlaceholder")}
                isRequired
                disabled={isSubmitting}
              />
              <TextFormField
                name="phone"
                label={t("calculator.phone")}
                placeholder={t("calculator.phonePlaceholder")}
                isRequired
                disabled={isSubmitting}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <TextFormField
                name="email"
                label={t("calculator.email")}
                placeholder={t("calculator.emailPlaceholder")}
                type="email"
                disabled={isSubmitting}
              />
              <SelectFormField
                name="preferredContact"
                label={t("calculator.preferredContactLabel")}
                options={[
                  {
                    value: "phone",
                    label: t("calculator.contactOptions.phone"),
                  },
                  {
                    value: "email",
                    label: t("calculator.contactOptions.email"),
                  },
                ]}
                isRequired
                disabled={isSubmitting}
              />
            </div>

            <TextareaField
              name="message"
              label={t("calculator.message")}
              placeholder={t("calculator.messagePlaceholder")}
              maxLength={2000}
            />

            <div className="grid gap-2 sm:grid-cols-2">
              <CheckboxField
                name="urgent"
                label={t("calculator.urgentLabel")}
              />
              <CheckboxField
                name="needsPickup"
                label={t("calculator.pickupLabel")}
              />
            </div>

            <CheckboxField
              name="consent"
              label={t("calculator.consentLabel")}
              isRequired
              className="border border-dashed border-stone-300/70 rounded-md px-3 py-2"
            />

            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {t("calculator.submit")}
            </Button>
          </form>
        </Form>

        <div className="bg-background border-muted text-foreground flex flex-col gap-4 rounded-lg border p-6">
          <div>
            <h3 className="text-lg font-semibold">
              {t("calculator.estimateTitle")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("calculator.estimateHint")}
            </p>
          </div>

          <div className="space-y-3 rounded-lg border border-dashed p-4">
            <Badge variant="outline" className="uppercase">
              {selectedService
                ? t(`deviceLabels.${selectedService.deviceType}`)
                : t("calculator.estimateBadge")}
            </Badge>
            <p className="text-2xl font-semibold leading-tight">
              {estimateLabel}
            </p>
            {selectedService && (
              <p className="text-muted-foreground text-sm">
                {selectedService.shortDescription ??
                  t("calculator.fallbackDescription", {
                    service: selectedService.name,
                  })}
              </p>
            )}
            <p className="text-muted-foreground text-xs">
              {t("calculator.estimateDisclaimer")}
            </p>
          </div>

          {hasSubmitted && (
            <p className="text-muted-foreground text-xs">
              {t("calculator.thankYou")}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
