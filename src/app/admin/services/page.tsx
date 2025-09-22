"use client";
import { useState, useEffect } from "react";
import { ClientPageProps } from "@/types";
import ServiceTable from "@/features/dashboard/ServiceTable";
import DashboardContainer from "@/features/dashboard/DashboardContainer";
import DashboardHeader from "@/features/dashboard/DashboardHeader";
import DashboardTitle from "@/features/dashboard/DashboardTitle";
import SelectShowing from "@/features/dashboard/SelectShowing";
import DashboardContent from "@/features/dashboard/DashboardContent";
import { AddServiceDialog } from "@/features/dashboard/dialogs/AddServiceDialog";
import { getServicesAction } from "@/shared/api/dashboard/getServicesAction";
import { deleteServiceAction } from "@/shared/api/dashboard/deleteServiceAction";
import { useSearchParams } from "next/navigation";

const ServicesPage = () => {
  const searchParams = useSearchParams();
  const page = searchParams?.get("page") || "1";
  const perPage = searchParams?.get("perPage") || "5";
  
  const [services, setServices] = useState<any[]>([]);
  const [totalItemsLength, setTotalItemsLength] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadServices = async () => {
    setLoading(true);
    try {
      const servicesResponse = (await getServicesAction(
        Number(page),
        Number(perPage),
      )) as unknown as { items: any[]; totalItemsLength: number };
      setServices(servicesResponse.items ?? []);
      setTotalItemsLength(servicesResponse.totalItemsLength ?? 0);
    } catch (error) {
      console.error("Error loading services:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, [page, perPage]);
  return (
    <DashboardContainer className="w-full min-h-screen py-12 px-10 overflow-y-auto">
      <DashboardHeader className="flex justify-between">
        <DashboardTitle>Услуги</DashboardTitle>
        <div className="flex gap-4">
          <SelectShowing />
          <AddServiceDialog onServiceAdded={loadServices} />
        </div>
      </DashboardHeader>
      <DashboardContent className="bg-background shadow p-6 rounded-lg">
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ServiceTable
            page={page}
            per_page={perPage}
            deleteAction={deleteServiceAction}
            items={services}
            totalItemsLength={totalItemsLength}
            onServiceUpdated={loadServices}
          />
        )}
      </DashboardContent>
    </DashboardContainer>
  );
};

export default ServicesPage;
