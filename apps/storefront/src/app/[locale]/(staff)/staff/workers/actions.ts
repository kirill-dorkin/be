"use server";

import { revalidatePath } from "next/cache";

import { paths } from "@/lib/paths";
import { REPAIR_STATUS } from "@/lib/repair/metadata";
import { activateRepairWorker } from "@/services/repair-worker-activate";
import { updateRepairWorkerStatus } from "@/services/repair-workers";

export const approveWorker = async (workerId: string) => {
  await updateRepairWorkerStatus({ id: workerId, status: REPAIR_STATUS.approved });
  await activateRepairWorker(workerId);

  revalidatePath(paths.staff.adminWorkers.asPath());
};

export const rejectWorker = async (workerId: string) => {
  await updateRepairWorkerStatus({ id: workerId, status: REPAIR_STATUS.rejected });

  revalidatePath(paths.staff.adminWorkers.asPath());
};

export const resetWorkerStatus = async (workerId: string) => {
  await updateRepairWorkerStatus({ id: workerId, status: REPAIR_STATUS.pending });

  revalidatePath(paths.staff.adminWorkers.asPath());
};
