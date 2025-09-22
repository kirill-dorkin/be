import { notFound } from "next/navigation";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import { getTaskByIdAction } from "@/actions/dashboard/getTaskByIdAction";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const task = await getTaskByIdAction(id);

  if (!task) {
    notFound();
  }

  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader>
        <DashboardTitle>Детали задачи</DashboardTitle>
      </DashboardHeader>
      <DashboardContent>
        <div className="bg-background shadow p-6 rounded-lg space-y-3">
          <p><span className="font-semibold">Описание:</span> {task.description}</p>
          <p><span className="font-semibold">Клиент:</span> {task.client.name}</p>
          <p><span className="font-semibold">Телефон:</span> {task.client.phone}</p>
          <p><span className="font-semibold">Бренд:</span> {task.device?.brand || 'Не указан'}</p>
          <p><span className="font-semibold">Модель:</span> {task.device?.model || 'Не указана'}</p>
          <p><span className="font-semibold">Статус:</span> {task.status}</p>
          <p><span className="font-semibold">Стоимость:</span> {task.service.price} сом</p>
          <p><span className="font-semibold">Создано:</span> {new Date(task.createdAt).toLocaleString()}</p>
        </div>
      </DashboardContent>
    </DashboardContainer>
  );
}
