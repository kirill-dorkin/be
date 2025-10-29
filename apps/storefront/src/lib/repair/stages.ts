import { type RepairStage } from "@nimara/domain/objects/RepairWorkflow";

export const REPAIR_STAGE_FLOW: RepairStage[] = [
  "pending_assignment",
  "diagnostics",
  "waiting_for_parts",
  "in_progress",
  "quality_check",
  "ready_for_delivery",
  "completed",
  "cancelled",
];

export const ACTIVE_REPAIR_STAGES: RepairStage[] = REPAIR_STAGE_FLOW.filter(
  (stage) => stage !== "pending_assignment" && stage !== "cancelled",
);
