import { notFound } from "next/navigation";
import Link from "next/link";
import DashboardContainer from "@/features/dashboard/DashboardContainer";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import DashboardContent from "@/features/dashboard/DashboardContent";
import DashboardTitle from "@/features/dashboard/DashboardTitle";
import { getTaskByIdAction } from "@/shared/api/dashboard/getTaskByIdAction";

interface PageProps {
  params: { id: string };
}

export default async function TaskDetailsPage({ params }: PageProps) {
  const { id } = params;
  const response = await getTaskByIdAction(id);

  if (response.status === "error" || !response.item) {
    notFound();
  }

  const task = response.item;

  const statusLabel = task.status === 'Pending' ? 'В ожидании' : task.status === 'In Progress' ? 'В процессе' : task.status === 'Completed' ? 'Завершено' : task.status;
  const statusClass = task.status === 'Pending'
    ? 'bg-yellow-100 text-yellow-800'
    : task.status === 'In Progress'
      ? 'bg-blue-100 text-blue-800'
      : task.status === 'Completed'
        ? 'bg-green-100 text-green-800'
        : 'bg-muted text-foreground';
  const formattedCreatedAt = new Date(task.createdAt).toLocaleString('ru-RU');
  const formattedCost = new Intl.NumberFormat('ru-RU').format(task.totalCost);

  return (
    <DashboardContainer className="w-full min-h-screen py-10 px-10 overflow-y-auto">
      <DashboardHeader className="flex items-center justify-between">
        <DashboardTitle>Детали задачи</DashboardTitle>
        <Link
          href="/admin/tasks?page=1&per_page=5"
          className="text-sm px-3 py-2 rounded-md border hover:bg-muted transition-colors"
        >
          Назад к списку
        </Link>
      </DashboardHeader>
      <DashboardContent>
        <div className="bg-background shadow p-6 rounded-lg">
          <div className="flex items-start justify-between gap-4 pb-4 mb-6 border-b">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Описание</p>
              <p className="text-base font-medium">{task.description}</p>
            </div>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusClass}`}>
              {statusLabel}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Имя клиента</p>
              <p className="font-medium">{task.customerName}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Телефон клиента</p>
              <p className="font-medium">{task.customerPhone}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Бренд</p>
              <p className="font-medium">{task.laptopBrand || 'Не указан'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Модель</p>
              <p className="font-medium">{task.laptopModel || 'Не указана'}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Стоимость</p>
              <p className="font-semibold">{formattedCost} ₽</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Создано</p>
              <p className="font-medium">{formattedCreatedAt}</p>
            </div>
          </div>
        </div>
      </DashboardContent>
    </DashboardContainer>
  );
}
