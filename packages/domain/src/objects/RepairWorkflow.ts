export const REPAIR_STAGES = [
  "pending_assignment",
  "diagnostics",
  "waiting_for_parts",
  "in_progress",
  "quality_check",
  "ready_for_delivery",
  "completed",
  "cancelled",
] as const;

export type RepairStage = (typeof REPAIR_STAGES)[number];

export const DELIVERY_STAGES = [
  "not_required",
  "pending_assignment",
  "pickup_scheduled",
  "picked_up",
  "delivered_to_service",
  "ready_for_return",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const;

export type DeliveryStage = (typeof DELIVERY_STAGES)[number];

export const isRepairStage = (value: string): value is RepairStage =>
  (REPAIR_STAGES as readonly string[]).includes(value);

export const isDeliveryStage = (value: string): value is DeliveryStage =>
  (DELIVERY_STAGES as readonly string[]).includes(value);
