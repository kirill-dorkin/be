"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Sparkles } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { type Resolver, useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";
import {
  Form,
  FormField,
  FormItem,
} from "@nimara/ui/components/form";
import { useToast } from "@nimara/ui/hooks";

import { CheckboxField } from "@/components/form/checkbox-field";
import { SelectFormField } from "@/components/form/select-form-field";
import { TextFormField } from "@/components/form/text-form-field";
import { TextareaField } from "@/components/form/textarea-field";
import { formatAsPrice } from "@/lib/formatters/util";
import {
  applyRepairDiscount,
  currencyMath,
  type RepairDiscount,
  toDiscountPercent,
} from "@/lib/repair/discount";
import {
  type RepairDeviceType,
  type RepairService,
  type RepairServiceCategory,
} from "@/lib/repair-services/data";
import {
  getRepairServiceDescription,
  getRepairServiceLabel,
} from "@/lib/repair-services/translations";
import type {
  SupportedCurrency,
  SupportedLocale,
} from "@/regions/types";

import {
  type DeviceSelection,
  DeviceServiceSelector,
} from "./device-service-selector";

const URGENCY_MULTIPLIER = 1.25;
const PICKUP_FEE = 500;

type EstimateRange = {
  max: number | null;
  min: number;
};

type EstimateBreakdown = {
  base: {
    service: EstimateRange;
    total: EstimateRange;
  };
  discounted: {
    rate: number;
    savings: EstimateRange;
    service: EstimateRange;
    total: EstimateRange;
  };
  kind: RepairService["price"]["kind"];
  pickupFee: number;
  urgentMultiplier: number;
};

type SelectedServiceEstimate = {
  deviceType: RepairDeviceType;
  estimate: EstimateBreakdown;
  modifiers: Record<string, number>;
  service: RepairService;
};

type Translator = ReturnType<typeof useTranslations>;

const buildSchema = (t: Translator) => {
  const serviceSelectionSchema = z.object({
    deviceType: z
      .string()
      .min(1, t("calculator.errors.deviceType"))
      .max(40),
    serviceSlugs: z
      .array(
        z
          .string()
          .min(1, t("calculator.errors.serviceSlug"))
          .max(120),
      )
      .min(1, t("calculator.errors.serviceSelection")),
  });

  return z
    .object({
      serviceSelections: z
        .array(serviceSelectionSchema)
        .min(1, t("calculator.errors.deviceSelection")),
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
      consent: z
        .boolean({
          errorMap: () => ({
            message: t("calculator.errors.consent"),
          }),
        })
        .refine((value) => value === true, {
          message: t("calculator.errors.consent"),
        }),
    })
    .refine(
      (data) => {
        if (!data.email) {
          return true;
        }
        const trimmed = data.email.trim();

        return (
          trimmed.length === 0 ||
          z.string().email().safeParse(trimmed).success
        );
      },
      {
        path: ["email"],
        message: t("calculator.errors.email"),
      },
    );
};

type Schema = ReturnType<typeof buildSchema>;

type FormSchema = z.output<Schema>;

type ServiceOption = {
  service: RepairService;
  serviceLabel: string;
  serviceSlug: string;
};

const extractErrorMessage = (error: unknown): string | undefined => {
  if (!error) {
    return undefined;
  }

  if (typeof error === "string") {
    return error;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string"
  ) {
    return (error as { message: string }).message;
  }

  if (typeof error === "object" && error !== null) {
    for (const value of Object.values(error as Record<string, unknown>)) {
      const message = extractErrorMessage(value);

      if (message) {
        return message;
      }
    }
  }

  return undefined;
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

const calculateServiceEstimate = ({
  service,
  urgent,
  includePickupFee,
  discountRate,
}: {
  discountRate: number;
  includePickupFee: boolean;
  service: RepairService;
  urgent: boolean;
}): EstimateBreakdown => {
  let serviceMin = currencyMath.toCurrency(service.price.min);
  let serviceMax =
    service.price.kind === "from" || service.price.max === null
      ? null
      : currencyMath.toCurrency(service.price.max);

  if (urgent) {
    serviceMin = currencyMath.toCurrency(
      serviceMin * URGENCY_MULTIPLIER,
    );
    if (serviceMax !== null) {
      serviceMax = currencyMath.toCurrency(
        serviceMax * URGENCY_MULTIPLIER,
      );
    }
  }

  const pickupFee = includePickupFee ? PICKUP_FEE : 0;

  const totalMin = currencyMath.toCurrency(serviceMin + pickupFee);
  const totalMax =
    serviceMax !== null
      ? currencyMath.toCurrency(serviceMax + pickupFee)
      : null;

  const discountedServiceMin = applyRepairDiscount(
    serviceMin,
    discountRate,
  );
  const discountedServiceMax =
    serviceMax !== null
      ? applyRepairDiscount(serviceMax, discountRate)
      : null;

  const discountedTotalMin = currencyMath.toCurrency(
    discountedServiceMin + pickupFee,
  );
  const discountedTotalMax =
    discountedServiceMax !== null
      ? currencyMath.toCurrency(discountedServiceMax + pickupFee)
      : null;

  const savingsMin = currencyMath.toCurrency(
    totalMin - discountedTotalMin,
  );
  const savingsMax =
    totalMax !== null && discountedTotalMax !== null
      ? currencyMath.toCurrency(totalMax - discountedTotalMax)
      : null;

  return {
    kind: service.price.kind,
    base: {
      service: {
        min: serviceMin,
        max: serviceMax,
      },
      total: {
        min: totalMin,
        max: totalMax,
      },
    },
    discounted: {
      rate: discountRate,
      service: {
        min: discountedServiceMin,
        max: discountedServiceMax,
      },
      total: {
        min: discountedTotalMin,
        max: discountedTotalMax,
      },
      savings: {
        min: savingsMin,
        max: savingsMax,
      },
    },
    pickupFee,
    urgentMultiplier: urgent ? URGENCY_MULTIPLIER : 1,
  };
};

export const ServicesEstimator = ({
  catalog,
  currency,
  locale: serverLocale,
  initialServiceSlug,
  repairDiscount,
}: {
  catalog: RepairServiceCategory[];
  currency: SupportedCurrency;
  initialServiceSlug?: string;
  locale: SupportedLocale;
  repairDiscount?: RepairDiscount;
}) => {
  const locale = useLocale() as SupportedLocale;
  const activeLocale = locale ?? serverLocale;

  const t = useTranslations("services");
  const { toast } = useToast();

  const discountRate = repairDiscount?.percentage ?? 0;
  const discountPercent = toDiscountPercent(discountRate);
  const hasDiscount = discountRate > 0;

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

  const getDeviceLabelKey = (
    deviceType: RepairDeviceType,
  ): `deviceLabels.${RepairDeviceType}` => `deviceLabels.${deviceType}`;

  const servicesByDevice = useMemo(() => {
    const map = new Map<RepairDeviceType, ServiceOption[]>();

    for (const category of catalog) {
      for (const service of category.services) {
        const options = map.get(service.deviceType) ?? [];
        const serviceLabel =
          getRepairServiceLabel(service.name, activeLocale) ?? service.name;

        options.push({
          serviceLabel,
          service,
          serviceSlug: service.slug,
        });
        map.set(service.deviceType, options);
      }
    }

    for (const [device, options] of map.entries()) {
      options.sort((a, b) =>
        a.serviceLabel.localeCompare(b.serviceLabel, activeLocale, {
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
        label: t(getDeviceLabelKey(deviceType)),
      })),
    [servicesByDevice, t],
  );

  const defaultServiceSelections: DeviceSelection[] = initialService
    ? [
        {
          deviceType: initialService.deviceType,
          serviceSlugs: [initialService.slug],
        },
      ]
    : [];

  const form = useForm<FormSchema>({
    resolver: zodResolver(schema) as Resolver<FormSchema>,
    defaultValues: {
      serviceSelections: defaultServiceSelections,
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
    formState: { isSubmitting },
  } = form;

  const [hasSubmitted, setHasSubmitted] = useState(false);

  const serviceSelections = watch("serviceSelections") ?? [];
  const urgent = watch("urgent") ?? false;
  const needsPickup = watch("needsPickup") ?? false;

  const selectedServices = useMemo(
    () =>
      serviceSelections.flatMap(({ deviceType, serviceSlugs }) => {
        const validServices =
          servicesByDevice.get(deviceType as RepairDeviceType) ?? [];
        const allowedSlugs = new Set(validServices.map((item) => item.serviceSlug));

        return serviceSlugs
          .filter((slug) => allowedSlugs.has(slug))
          .map((slug) => {
            const service = serviceIndex.get(slug);

            if (!service) {
              return null;
            }

            return {
              deviceType: service.deviceType,
              service,
            };
          })
          .filter((entry): entry is { deviceType: RepairDeviceType; service: RepairService } =>
            entry !== null,
          );
      }),
    [serviceSelections, servicesByDevice, serviceIndex],
  );

  const selectedServiceEstimates = useMemo<SelectedServiceEstimate[]>(() => {
    if (selectedServices.length === 0) {
      return [];
    }

    return selectedServices.map((entry, index) => {
      const includePickupFee = needsPickup && index === 0;
      const estimate = calculateServiceEstimate({
        service: entry.service,
        urgent,
        includePickupFee,
        discountRate,
      });

      const modifiers: Record<string, number> = {
        pickup: includePickupFee ? PICKUP_FEE : 0,
        urgent: urgent ? URGENCY_MULTIPLIER : 1,
      };

      if (discountRate > 0) {
        const discountValueMin = currencyMath.toCurrency(
          estimate.base.total.min - estimate.discounted.total.min,
        );

        if (discountValueMin > 0) {
          modifiers.discountPercent = discountRate;
          modifiers.discountAmountMin = discountValueMin;

          if (
            estimate.base.total.max !== null &&
            estimate.discounted.total.max !== null
          ) {
            const discountValueMax = currencyMath.toCurrency(
              estimate.base.total.max - estimate.discounted.total.max,
            );

            if (discountValueMax > 0) {
              modifiers.discountAmountMax = discountValueMax;
            }
          }
        }
      }

      return {
        deviceType: entry.deviceType,
        service: entry.service,
        estimate,
        modifiers,
      };
    });
  }, [selectedServices, needsPickup, urgent, discountRate]);

  const aggregatedTotals = useMemo(() => {
    if (selectedServiceEstimates.length === 0) {
      return null;
    }

    const base: EstimateRange = { min: 0, max: 0 };
    const discounted: EstimateRange = { min: 0, max: 0 };

    for (const entry of selectedServiceEstimates) {
      base.min = currencyMath.toCurrency(
        base.min + entry.estimate.base.total.min,
      );

      if (base.max !== null) {
        const value = entry.estimate.base.total.max;

        if (value === null) {
          base.max = null;
        } else {
          base.max = currencyMath.toCurrency(base.max + value);
        }
      }

      discounted.min = currencyMath.toCurrency(
        discounted.min + entry.estimate.discounted.total.min,
      );

      if (discounted.max !== null) {
        const value = entry.estimate.discounted.total.max;

        if (value === null) {
          discounted.max = null;
        } else {
          discounted.max = currencyMath.toCurrency(
            discounted.max + value,
          );
        }
      }
    }

    const savings: EstimateRange = {
      min: currencyMath.toCurrency(base.min - discounted.min),
      max:
        base.max !== null && discounted.max !== null
          ? currencyMath.toCurrency(base.max - discounted.max)
          : null,
    };

    return {
      base,
      discounted,
      savings,
    };
  }, [selectedServiceEstimates]);

  const priceLabelStrings = useMemo(() => {
    const tr = t;

    return {
      fixed: tr.raw("calculator.priceLabel.fixed"),
      from: tr.raw("calculator.priceLabel.from"),
      range: tr.raw("calculator.priceLabel.range"),
    };
  }, [t]);

  const freeLabel = t("calculator.freeLabel");

  const aggregateLabels = useMemo(() => {
    if (!aggregatedTotals) {
      return {
        base: null as string | null,
        discounted: t("calculator.estimateUnavailable"),
      };
    }

    const formatPriceValue = (amount: number) =>
      formatAsPrice({ amount, currency, locale: activeLocale });

    const buildLabel = (range: EstimateRange) => {
      if (range.max === null) {
        return priceLabelStrings.from.replace(
          "{price}",
          formatPriceValue(range.min),
        );
      }

      if (range.min !== range.max) {
        return priceLabelStrings.range
          .replace("{min}", formatPriceValue(range.min))
          .replace("{max}", formatPriceValue(range.max));
      }

      return priceLabelStrings.fixed.replace(
        "{price}",
        formatPriceValue(range.min),
      );
    };

    return {
      base: buildLabel(aggregatedTotals.base),
      discounted: buildLabel(aggregatedTotals.discounted),
    };
  }, [
    aggregatedTotals,
    priceLabelStrings,
    currency,
    activeLocale,
    t,
  ]);

  const isEstimateFree =
    !!aggregatedTotals &&
    aggregatedTotals.discounted.min === 0 &&
    (aggregatedTotals.discounted.max === null ||
      aggregatedTotals.discounted.max === 0);

  const hasDiscountApplied =
    hasDiscount &&
    !!aggregatedTotals &&
    aggregatedTotals.savings.min > 0;

  const totalSavingsLabel =
    hasDiscountApplied && aggregatedTotals
      ? t("calculator.discountSavings", {
          amount: formatAsPrice({
            amount: aggregatedTotals.savings.min,
            currency,
            locale: activeLocale,
          }),
        })
      : null;

  const serviceSummaries = useMemo(
    () =>
      selectedServiceEstimates.map(({ deviceType, service, estimate }) => {
        const serviceLabel = getRepairServiceLabel(
          service.name,
          activeLocale,
        );

        const basePriceLabel = toPriceLabel({
          currency,
          locale: activeLocale,
          price: {
            min: estimate.base.total.min,
            max: estimate.base.total.max,
            kind: service.price.kind,
          },
          labels: priceLabelStrings,
        });

        const hasDiscountApplied =
          estimate.discounted.total.min !==
            estimate.base.total.min ||
          estimate.discounted.total.max !==
            estimate.base.total.max;

        const discountedPriceLabel = hasDiscountApplied
          ? toPriceLabel({
              currency,
              locale: activeLocale,
              price: {
                min: estimate.discounted.total.min,
                max: estimate.discounted.total.max,
                kind: service.price.kind,
              },
              labels: priceLabelStrings,
            })
          : null;

        const savingsLabel =
          discountedPriceLabel && estimate.discounted.savings.min > 0
            ? t("calculator.discountSavings", {
                amount: formatAsPrice({
                  amount: estimate.discounted.savings.min,
                  currency,
                  locale: activeLocale,
                }),
              })
            : null;

        return {
          deviceLabel: t(getDeviceLabelKey(deviceType)),
          description:
            getRepairServiceDescription(
              service.shortDescription,
              activeLocale,
            ) ??
            t("calculator.fallbackDescription", {
              service: serviceLabel,
            }),
          id: service.slug,
          name: serviceLabel,
          basePriceLabel,
          discountedPriceLabel,
          savingsLabel,
        };
      }),
    [
      selectedServiceEstimates,
      t,
      currency,
      activeLocale,
      priceLabelStrings,
    ],
  );

  const serviceSelectionsError = extractErrorMessage(
    form.formState.errors.serviceSelections,
  );

  const onSubmit = async (values: FormSchema) => {
    const preferredContact = values.preferredContact ?? "phone";
    const isUrgent = values.urgent ?? false;
    const requiresPickup = values.needsPickup ?? false;

    if (selectedServiceEstimates.length === 0 || !aggregatedTotals) {
      toast({
        description: t("calculator.submitError"),
        variant: "destructive",
      });

      return;
    }

    const selectionsPayload = selectedServiceEstimates.map(
      ({ deviceType, service, estimate, modifiers }, index) => ({
        deviceType,
        serviceSlug: service.slug,
        priceEstimate: {
          min: estimate.discounted.total.min,
          max: estimate.discounted.total.max,
          currency,
        },
        modifiers,
        order: index,
      }),
    );

    const payload = {
      fullName: values.fullName,
      phone: values.phone,
      email: values.email?.trim() || undefined,
      message: values.message?.trim() || undefined,
      urgent: isUrgent,
      needsPickup: requiresPickup,
      preferredContact,
      consent: values.consent ?? false,
      serviceSelections: selectionsPayload,
      totalEstimate: {
        min: aggregatedTotals.discounted.min,
        max: aggregatedTotals.discounted.max,
        currency,
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
        serviceSelections: values.serviceSelections,
        urgent: isUrgent,
        needsPickup: requiresPickup,
        preferredContact,
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

  return (
    <section className="bg-muted/50 w-full overflow-hidden rounded-lg p-4 sm:p-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold sm:text-2xl">
          {t("calculator.title")}
        </h2>
        <p className="text-muted-foreground max-w-2xl text-sm">
          {t("calculator.subtitle")}
        </p>
      </div>

      <div className="mt-6 grid w-full gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Form {...form}>
          <form
            className="grid w-full gap-4"
            noValidate
            onSubmit={handleSubmit(onSubmit)}
          >
            <FormField
              control={form.control}
              name="serviceSelections"
              render={({ field }) => (
                <FormItem>
                  <DeviceServiceSelector
                    deviceOptions={deviceOptions}
                    servicesByDevice={servicesByDevice}
                    value={(field.value ?? []) as DeviceSelection[]}
                    onChange={field.onChange}
                    labels={{
                      deviceLabel: t("calculator.deviceTypeLabel"),
                      deviceSelectionHint: t("calculator.deviceSelectionHint"),
                      addDeviceHint: t("calculator.deviceSelectionEmptyHint"),
                      serviceHint: t("calculator.serviceSelectionHint"),
                      servicePlaceholder: t(
                        "calculator.serviceSelectionPlaceholder",
                      ),
                      removeDeviceLabel: t("calculator.removeDevice"),
                    }}
                    error={serviceSelectionsError}
                  />
                </FormItem>
              )}
            />

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

        <div className="bg-background border-muted text-foreground flex flex-col gap-4 rounded-lg border p-4 sm:p-6">
          <div>
            <h3 className="text-base font-semibold sm:text-lg">
              {t("calculator.estimateTitle")}
            </h3>
            <p className="text-muted-foreground text-sm">
              {t("calculator.estimateHint")}
            </p>
          </div>

          <div className="space-y-4 rounded-lg border border-dashed p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="uppercase">
                {t("calculator.estimateBadge")}
              </Badge>
              {selectedServiceEstimates.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {t("calculator.selectedServicesCount", {
                    count: selectedServiceEstimates.length,
                  })}
                </span>
              )}
            </div>
            {hasDiscountApplied && (
              <div className="flex items-center gap-2 rounded-md bg-emerald-50 px-3 py-2 text-emerald-700">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                  {t("calculator.discountApplied", {
                    percent: discountPercent,
                  })}
                </span>
              </div>
            )}
            {selectedServiceEstimates.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {t("calculator.noServicesSelected")}
              </p>
            ) : isEstimateFree ? (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm line-through">
                  {aggregateLabels.base}
                </span>
                <span className="text-emerald-600 text-2xl font-semibold">
                  {freeLabel}
                </span>
                {totalSavingsLabel && (
                  <span className="text-emerald-700 text-sm font-medium">
                    {totalSavingsLabel}
                  </span>
                )}
              </div>
            ) : hasDiscountApplied && aggregateLabels.base ? (
              <div className="flex flex-col gap-1">
                <span className="text-muted-foreground text-sm line-through">
                  {aggregateLabels.base}
                </span>
                <span className="text-emerald-600 text-3xl font-semibold">
                  {aggregateLabels.discounted}
                </span>
                {totalSavingsLabel && (
                  <span className="text-emerald-700 text-sm font-medium">
                    {totalSavingsLabel}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-2xl font-semibold leading-tight text-primary">
                {aggregateLabels.discounted}
              </p>
            )}
            {selectedServiceEstimates.length > 0 && (
              <div className="space-y-2">
                {serviceSummaries.map((summary) => (
                  <div
                    key={summary.id}
                    className="bg-muted/50 text-muted-foreground flex flex-col gap-1 rounded-lg border border-muted/60 p-2.5 sm:p-3"
                  >
                    <span className="break-words text-sm font-semibold text-foreground">
                      {summary.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {summary.deviceLabel}
                    </span>
                    {summary.discountedPriceLabel ? (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground line-through">
                          {summary.basePriceLabel}
                        </span>
                        <span className="text-emerald-600 text-sm font-semibold">
                          {summary.discountedPriceLabel}
                        </span>
                        {summary.savingsLabel && (
                          <span className="text-emerald-700 text-xs font-medium">
                            {summary.savingsLabel}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm font-semibold text-primary">
                        {summary.basePriceLabel}
                      </span>
                    )}
                    <span className="break-words text-xs text-muted-foreground">
                      {summary.description}
                    </span>
                  </div>
                ))}
              </div>
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
