"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ReactNode, useMemo, useState, useTransition } from "react";

import { type RepairStage } from "@nimara/domain/objects/RepairWorkflow";
import { Badge } from "@nimara/ui/components/badge";
import { Button } from "@nimara/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@nimara/ui/components/select";
import { useToast } from "@nimara/ui/hooks";

import { formatAsDate } from "@/lib/formatters/util";
import { type SupportedLocale } from "@/regions/types";
import { type StaffRepairOrder } from "@/services/repair-orders-dashboard";

import { claimRepairOrder, updateRepairStage } from "./actions";

type StageOption = {
  label: string;
  value: RepairStage;
};

type DashboardOrder = StaffRepairOrder & {
  isMine: boolean;
  isUnassigned: boolean;
};

type Props = {
  locale: SupportedLocale;
  orders: DashboardOrder[];
  stageOptions: StageOption[];
};

const OrderSection = ({
  title,
  description,
  orders,
  renderOrder,
}: {
  description: string;
  orders: DashboardOrder[];
  renderOrder: (order: DashboardOrder) => ReactNode;
  title: string;
}) => (
  <div className="space-y-3 rounded-2xl border border-border/40 bg-background p-4 shadow-sm">
    <div className="flex flex-col gap-1">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
    <div className="space-y-3">
      {orders.map((order) => (
        <div key={order.id}>{renderOrder(order)}</div>
      ))}
      {orders.length === 0 && (
        <p className="text-muted-foreground text-sm">—</p>
      )}
    </div>
  </div>
);

const formatBadgeDate = (
  locale: SupportedLocale,
  value: string | undefined,
) => {
  if (!value) {
    return null;
  }

  return formatAsDate({
    locale,
    date: value,
    options: {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    },
  });
};

export function StaffOrdersBoard({ locale, orders, stageOptions }: Props) {
  const t = useTranslations("staff");
  const tc = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const { unassigned, myActive, completed } = useMemo(() => {
    const unassignedOrders = orders.filter((order) => order.isUnassigned);
    const myOrders = orders.filter(
      (order) => order.isMine && order.stage !== "completed" && order.stage !== "cancelled",
    );
    const completedOrders = orders.filter((order) => order.isMine && order.stage === "completed");

    return {
      unassigned: unassignedOrders,
      myActive: myOrders,
      completed: completedOrders,
    };
  }, [orders]);

  const onClaim = (orderId: string) => {
    setPendingOrderId(orderId);
    startTransition(async () => {
      const result = await claimRepairOrder(orderId, locale);

      if (result?.ok) {
        toast({ description: t("toast.claimed"), variant: "default" });
        router.refresh();
      } else {
        toast({ description: t("toast.error"), variant: "destructive" });
      }

      setPendingOrderId(null);
    });
  };

  const onStageChange = (orderId: string, stage: RepairStage) => {
    setPendingOrderId(orderId);
    startTransition(async () => {
      const result = await updateRepairStage(orderId, stage, locale);

      if (result?.ok) {
        toast({ description: t("toast.stageUpdated"), variant: "default" });
        router.refresh();
      } else {
        toast({ description: t("toast.error"), variant: "destructive" });
      }

      setPendingOrderId(null);
    });
  };

  const stageLabel = (stage: RepairStage) =>
    stageOptions.find((option) => option.value === stage)?.label ?? stage;

  const renderOrderCard = (order: DashboardOrder) => {
    const stageUpdatedAt = order.stageUpdatedAt ?? order.created;

    return (
      <div className="rounded-xl border border-border/50 bg-background p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs uppercase tracking-wide">
            {stageLabel(order.stage)}
          </Badge>

          <span className="text-xs text-muted-foreground">
            {t("orderCard.stageUpdated")}: {formatBadgeDate(locale, stageUpdatedAt) ?? "—"}
          </span>
        </div>

        <div className="mt-3 space-y-2 text-sm">
          <div className="flex flex-col">
            <span className="text-xs uppercase text-muted-foreground">
              {t("orderCard.created")}
            </span>
            <span className="font-medium text-foreground">
              {formatBadgeDate(locale, order.created)}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase text-muted-foreground">
              {t("orderCard.customer")}
            </span>
            <span className="font-medium text-foreground">
              {order.customerName ?? "—"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase text-muted-foreground">
              {t("orderCard.phone")}
            </span>
            <span className="text-foreground">
              {order.customerPhone ?? "—"}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-xs uppercase text-muted-foreground">
              {t("orderCard.service")}
            </span>
            <span className="text-foreground">
              {order.serviceName ?? "—"}
            </span>
          </div>

          {order.customerMessage && (
            <div className="rounded-lg bg-muted/60 p-3 text-xs text-muted-foreground">
              {order.customerMessage}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {order.urgent && (
              <Badge variant="destructive" className="uppercase">
                {t("orderCard.urgent")}
              </Badge>
            )}
            {order.needsPickup && (
              <Badge variant="secondary" className="uppercase">
                {t("orderCard.pickup")}
              </Badge>
            )}
          </div>

          {order.totalAmount != null && order.totalCurrency && (
            <div className="flex flex-col">
              <span className="text-xs uppercase text-muted-foreground">
                {t("orderCard.total")}
              </span>
              <span className="font-medium text-foreground">
                {new Intl.NumberFormat(locale, {
                  style: "currency",
                  currency: order.totalCurrency,
                }).format(order.totalAmount)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {order.isUnassigned && (
            <Button
              onClick={() => onClaim(order.id)}
              disabled={isPending && pendingOrderId === order.id}
            >
            {isPending && pendingOrderId === order.id
                ? tc("please-wait")
                : t("actions.claim")}
            </Button>
          )}

          {order.isMine && !order.isUnassigned && (
            <div className="flex flex-wrap items-center gap-2">
              <Select
                defaultValue={order.stage}
                onValueChange={(value) =>
                  onStageChange(order.id, value as RepairStage)
                }
                disabled={isPending && pendingOrderId === order.id}
              >
                <SelectTrigger className="w-56">
                  <SelectValue placeholder={stageLabel(order.stage)} />
                </SelectTrigger>
                <SelectContent>
                  {stageOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="ghost"
                className="text-sm"
                onClick={() => onStageChange(order.id, "pending_assignment")}
                disabled={
                  (isPending && pendingOrderId === order.id) ||
                  order.stage === "pending_assignment"
                }
              >
                {t("actions.release")}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <OrderSection
        title={t("sections.unassigned")}
        description={t("empty.unassigned")}
        orders={unassigned}
        renderOrder={renderOrderCard}
      />
      <OrderSection
        title={t("sections.myOrders")}
        description={t("empty.myOrders")}
        orders={myActive}
        renderOrder={renderOrderCard}
      />
      <OrderSection
        title={t("sections.completed")}
        description={t("empty.completed")}
        orders={completed}
        renderOrder={renderOrderCard}
      />
    </div>
  );
}
