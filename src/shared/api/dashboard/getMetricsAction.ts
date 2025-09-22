import { connectToDatabase } from "@/shared/lib/dbConnect";
import Task from "@/entities/task/Task";

const getMetricsAction = async () => {
  try {
    await connectToDatabase();

    const totalPendingTasks = await Task.countDocuments({
      status: 'Pending',
    });

    const totalActiveTasks = await Task.countDocuments({
      status: { $in: ['Pending', 'In Progress', "Completed"] },
    });

    const totalInProgressTasks = await Task.countDocuments({
      status: { $in: ['In Progress'] },
    });

    const totalCompletedTasks = await Task.countDocuments({ status: 'Completed' });

    const metrics = {
      totalPendingTasks,
      totalInProgressTasks,
      totalActiveTasks,
      totalCompletedTasks,
    };

    return { status: 'success', metrics };
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return {
      status: 'error',
      message: (error as { message: string }).message || 'Internal server error.',
    };
  }
};

export default getMetricsAction;
