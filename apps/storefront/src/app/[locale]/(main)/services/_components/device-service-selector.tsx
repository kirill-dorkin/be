"use client";

import { X } from "lucide-react";
import { memo, useCallback, useMemo } from "react";

import { Button } from "@nimara/ui/components/button";
import { cn } from "@nimara/ui/lib/utils";

import type { RepairDeviceType } from "@/lib/repair-services/data";

export type DeviceSelection = {
  deviceType: RepairDeviceType;
  serviceSlugs: string[];
};

type ServiceOption = {
  serviceLabel: string;
  serviceSlug: string;
};

type DeviceOption = {
  label: string;
  value: RepairDeviceType;
};

type DeviceServiceSelectorProps = {
  deviceOptions: DeviceOption[];
  error?: string;
  labels: {
    addDeviceHint: string;
    deviceLabel: string;
    deviceSelectionHint: string;
    removeDeviceLabel: string;
    serviceHint: string;
    servicePlaceholder: string;
  };
  onChange: (value: DeviceSelection[]) => void;
  servicesByDevice: Map<RepairDeviceType, ServiceOption[]>;
  value: DeviceSelection[];
};

const toggleItem = <T,>(items: T[], item: T, predicate: (a: T) => boolean) => {
  const exists = items.some(predicate);

  if (exists) {
    return items.filter((entry) => !predicate(entry));
  }

  return [...items, item];
};

const DeviceServiceSelectorComponent = ({
  deviceOptions,
  servicesByDevice,
  value,
  labels,
  error,
  onChange,
}: DeviceServiceSelectorProps) => {
  const selections = value ?? [];

  const selectionMap = useMemo(() => {
    const map = new Map<RepairDeviceType, DeviceSelection>();

    for (const selection of selections) {
      map.set(selection.deviceType, selection);
    }

    return map;
  }, [selections]);

  // Мемоизация обработчика переключения устройства
  const handleDeviceToggle = useCallback(
    (deviceType: RepairDeviceType) => {
      const existing = selectionMap.get(deviceType);

      if (existing) {
        onChange(selections.filter((item) => item.deviceType !== deviceType));

        return;
      }

      onChange([...selections, { deviceType, serviceSlugs: [] }]);
    },
    [selectionMap, selections, onChange],
  );

  // Мемоизация обработчика переключения услуги
  const handleServiceToggle = useCallback(
    (deviceType: RepairDeviceType, serviceSlug: string) => {
      const current = selectionMap.get(deviceType);

      if (!current) {
        return;
      }

      const nextServiceSlugs = toggleItem(
        current.serviceSlugs,
        serviceSlug,
        (candidate) => candidate === serviceSlug,
      );

      const nextSelections = selections.map((selection) =>
        selection.deviceType === deviceType
          ? { ...selection, serviceSlugs: nextServiceSlugs }
          : selection,
      );

      onChange(nextSelections);
    },
    [selectionMap, selections, onChange],
  );

  const selectedDevices = new Set(
    selections.map((selection) => selection.deviceType),
  );

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col gap-1">
        <span className="text-foreground text-sm font-medium">
          {labels.deviceLabel}
        </span>
        <span className="text-muted-foreground text-sm">
          {labels.deviceSelectionHint}
        </span>
      </div>

      <div className="grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
        {deviceOptions.map(({ value: deviceType, label }) => {
          const isSelected = selectedDevices.has(deviceType);

          return (
            <Button
              key={deviceType}
              type="button"
              className={cn(
                "h-auto min-h-[2.5rem] w-full justify-start whitespace-normal rounded-full border px-3 py-2 text-left text-sm font-medium transition-colors sm:px-4",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-muted hover:bg-muted/70",
              )}
              variant="outline"
              onClick={() => handleDeviceToggle(deviceType)}
            >
              <span className="w-full break-words">{label}</span>
            </Button>
          );
        })}
      </div>

      {selections.length === 0 && (
        <p className="text-muted-foreground text-sm">{labels.addDeviceHint}</p>
      )}

      <div className="w-full space-y-4">
        {selections.map((selection) => {
          const services = servicesByDevice.get(selection.deviceType) ?? [];

          return (
            <div
              key={selection.deviceType}
              className="border-border/60 bg-card text-card-foreground w-full space-y-4 overflow-hidden rounded-xl border p-3 shadow-sm sm:p-4"
            >
              <div className="flex w-full flex-wrap items-start justify-between gap-2">
                <div className="flex min-w-0 max-w-[calc(100%-3rem)] flex-1 flex-col gap-1">
                  <span className="text-muted-foreground break-words text-sm font-semibold uppercase tracking-wide">
                    {
                      deviceOptions.find(
                        ({ value }) => value === selection.deviceType,
                      )?.label
                    }
                  </span>
                  <span className="text-muted-foreground break-words text-xs">
                    {labels.serviceHint}
                  </span>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  aria-label={labels.removeDeviceLabel}
                  onClick={() => handleDeviceToggle(selection.deviceType)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid w-full max-w-full gap-2 sm:grid-cols-2">
                {services.map(({ serviceSlug, serviceLabel }) => {
                  const isActive = selection.serviceSlugs.includes(serviceSlug);

                  return (
                    <Button
                      type="button"
                      key={serviceSlug}
                      className={cn(
                        "h-auto min-h-[2.5rem] max-w-full justify-start whitespace-normal rounded-lg border px-3 py-2 text-left text-sm font-medium transition sm:px-4",
                        isActive
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted text-muted-foreground hover:bg-muted/70",
                      )}
                      variant="outline"
                      onClick={() =>
                        handleServiceToggle(selection.deviceType, serviceSlug)
                      }
                      aria-pressed={isActive}
                    >
                      <span className="block w-full break-words text-left">
                        {serviceLabel}
                      </span>
                    </Button>
                  );
                })}
              </div>

              {selection.serviceSlugs.length === 0 && (
                <p className="text-muted-foreground text-xs">
                  {labels.servicePlaceholder}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {error && <p className="text-destructive text-sm font-medium">{error}</p>}
    </div>
  );
};

// Мемоизация - селектор устройств и услуг для калькулятора ремонта
export const DeviceServiceSelector = memo(
  DeviceServiceSelectorComponent,
  (prevProps, nextProps) => {
    return (
      prevProps.value === nextProps.value &&
      prevProps.error === nextProps.error &&
      prevProps.deviceOptions.length === nextProps.deviceOptions.length &&
      prevProps.servicesByDevice.size === nextProps.servicesByDevice.size
    );
  },
);
