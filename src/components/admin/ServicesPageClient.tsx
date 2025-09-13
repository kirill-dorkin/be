'use client'

import { useTranslations } from 'next-intl';
import SelectShowing from "@/components/dashboard/SelectShowing";
import DashboardContainer from "@/components/dashboard/DashboardContainer";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardTitle from "@/components/dashboard/DashboardTitle";
import ServiceTable from "@/components/dashboard/ServiceTable";
import { AddServiceDialog } from "@/components/dashboard/dialogs/AddServiceDialog";
import deleteServiceAction from "@/actions/dashboard/deleteServiceAction";
import { IService } from "@/models/Service";

interface ServicesPageClientProps {
  page: string | string[];
  perPage: string | string[];
  items: IService[];
  totalItemsLength: number;
}

const ServicesPageClient = ({ page, perPage, items, totalItemsLength }: ServicesPageClientProps) => {
  const t = useTranslations('admin.services');

  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardTitle>{t('title')}</DashboardTitle>
        <div className="flex gap-4">
          <SelectShowing />
          <AddServiceDialog />
        </div>
      </DashboardHeader>
      <DashboardContent className="bg-background shadow p-6 rounded-lg">
        <ServiceTable
          page={page}
          per_page={perPage}
          deleteAction={deleteServiceAction}
          items={items}
          totalItemsLength={totalItemsLength}
        />
      </DashboardContent>
    </DashboardContainer>
  );
};

export default ServicesPageClient;