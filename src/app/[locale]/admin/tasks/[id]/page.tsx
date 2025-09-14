import { notFound } from "next/navigation";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import getTaskByIdAction from "@/actions/dashboard/getTaskByIdAction";
import { getTranslations } from 'next-intl/server';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TaskDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const response = await getTaskByIdAction(id);
  const t = await getTranslations('admin.tasks');

  if (response.status === "error" || !response.item) {
    notFound();
  }

  const task = response.item;

  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader>
        <DashboardTitle>{t('details.title')}</DashboardTitle>
      </DashboardHeader>
      <DashboardContent>
        <div className="bg-background shadow p-6 rounded-lg space-y-3">
          <p><span className="font-semibold">{t('details.description')}:</span> {task.description}</p>
          <p><span className="font-semibold">{t('details.client')}:</span> {task.customerName}</p>
          <p><span className="font-semibold">{t('details.phone')}:</span> {task.customerPhone}</p>
          <p><span className="font-semibold">{t('details.brand')}:</span> {task.laptopBrand}</p>
          <p><span className="font-semibold">{t('details.model')}:</span> {task.laptopModel}</p>
          <p><span className="font-semibold">{t('details.status')}:</span> {task.status}</p>
          <p><span className="font-semibold">{t('details.cost')}:</span> {task.totalCost} {t('details.currency')}</p>
          <p><span className="font-semibold">{t('details.created')}:</span> {new Date(task.createdAt).toLocaleString()}</p>
        </div>
      </DashboardContent>
    </DashboardContainer>
  );
}
