'use client'

import { FaTasks, FaHourglassHalf, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import TaskReport from "@/components/dashboard/TaskReport";
import UserList from "@/components/dashboard/UserList";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardGreater from "@/components/dashboard/DashboardGreater";
import AdminProfileHeader from "@/components/dashboard/AdminProfileHeader";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardSummary from "@/components/dashboard/DashboardSummary";
import ListCard from "@/components/dashboard/ListCard";
import { ITask } from "@/models/Task";
import { IUser } from "@/models/User";

interface DashboardPageClientProps {
  page: string;
  perPage: string;
  items: ITask[];
  totalItemsLength: number;
  users: IUser[];
  metrics: {
    metrics?: {
      totalActiveTasks?: number;
      totalPendingTasks?: number;
      totalInProgressTasks?: number;
      totalCompletedTasks?: number;
    };
  } | null;
}

const DashboardPageClient = ({ 
  page, 
  perPage, 
  items, 
  totalItemsLength, 
  users, 
  metrics 
}: DashboardPageClientProps) => {
  const data = [
    {
      label: 'Active Tasks',
      value: metrics?.metrics?.totalActiveTasks ?? 0,
      icon: <FaTasks />,
    },
    {
      label: 'Pending Tasks',
      value: metrics?.metrics?.totalPendingTasks ?? 0,
      icon: <FaExclamationCircle />,
    },
    {
      label: 'In Progress Tasks',
      value: metrics?.metrics?.totalInProgressTasks ?? 0,
      icon: <FaHourglassHalf />,
    },
    {
      label: 'Completed Tasks',
      value: metrics?.metrics?.totalCompletedTasks ?? 0,
      icon: <FaCheckCircle />,
    },
  ];

  return (
    <DashboardContainer className="w-full min-h-svh py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardGreater />
        <AdminProfileHeader />
      </DashboardHeader>
      <DashboardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-6">
        <DashboardSummary data={data} />
        <section className="flex flex-col gap-6 col-span-1 sm:col-span-2 lg:col-span-5">
          <TaskReport
            page={page}
            per_page={perPage}
            items={items}
            totalItemsLength={totalItemsLength}
          />
        </section>
        <section className="flex flex-col col-span-1 sm:col-span-2 lg:col-span-2 gap-6">
          <ListCard
            title="Employee List"
            description="List of employees"
          >
            <UserList users={users} />
          </ListCard>
        </section>
      </DashboardContent>
    </DashboardContainer>
  );
};

export default DashboardPageClient;