import { notFound } from "next/navigation";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import getTaskByIdAction from "@/actions/dashboard/getTaskByIdAction";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const response = await getTaskByIdAction(id);

  if (response.status === "error" || !response.item) {
    notFound();
  }

  const task = response.item;

  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader>
        <DashboardTitle>Детали задачи</DashboardTitle>
      </DashboardHeader>
      <DashboardContent>
        <div className="bg-background shadow p-6 rounded-lg space-y-3">
          <p><span className="font-semibold">Описание:</span> {task.description}</p>
          <p><span className="font-semibold">Клиент:</span> {task.customerName}</p>
          <p><span className="font-semibold">Телефон:</span> {task.customerPhone}</p>
          <p><span className="font-semibold">Бренд:</span> {task.laptopBrand}</p>
          <p><span className="font-semibold">Модель:</span> {task.laptopModel}</p>
          <p><span className="font-semibold">Статус:</span> {task.status}</p>
          <p><span className="font-semibold">Стоимость:</span> {task.totalCost} сом</p>
          <p><span className="font-semibold">Создано:</span> {new Date(task.createdAt).toLocaleString()}</p>
        </div>
      </DashboardContent>
    </DashboardContainer>
  );
}
