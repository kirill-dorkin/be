"use client";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import DashboardTitle from "./DashboardTitle";
import useClientComponent from "@/hooks/useClientComponent";

const DashboardGreater = () => {
  const isClient = useClientComponent();
  const { data: session } = useSession();
  const t = useTranslations();

  const userNickname = session?.user?.name?.split(" ")[0];

  return isClient ? (
    <DashboardTitle>{userNickname ? t('dashboard.greeting.welcomeUser', { name: userNickname }) : t('dashboard.greeting.welcome')} 🥳👋</DashboardTitle>
  ) : (
    <DashboardTitle>{t('dashboard.greeting.hello')} 🥳👋</DashboardTitle>
  );
};

export default DashboardGreater;

