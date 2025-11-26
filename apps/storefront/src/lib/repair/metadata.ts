export const REPAIR_METADATA_KEYS = {
  role: "repair:role",
  status: "repair:status",
  phone: "repair:phone",
} as const;

export const REPAIR_ROLE = {
  worker: "WORKER",
  courier: "COURIER",
} as const;

export const REPAIR_STATUS = {
  pending: "PENDING",
  approved: "APPROVED",
  rejected: "REJECTED",
} as const;

export const isRepairWorker = (metadata: Record<string, string> | undefined) =>
  metadata?.[REPAIR_METADATA_KEYS.role] === REPAIR_ROLE.worker;

export const getRepairWorkerStatus = (
  metadata: Record<string, string> | undefined,
) => metadata?.[REPAIR_METADATA_KEYS.status];

export const isApprovedRepairWorker = (
  metadata: Record<string, string> | undefined,
) =>
  isRepairWorker(metadata) &&
  getRepairWorkerStatus(metadata) === REPAIR_STATUS.approved;

export const isPendingRepairWorker = (
  metadata: Record<string, string> | undefined,
) =>
  isRepairWorker(metadata) &&
  getRepairWorkerStatus(metadata) === REPAIR_STATUS.pending;
