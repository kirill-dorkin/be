"use client";
import { useSession } from "next-auth/react";
import DashboardTitle from "./DashboardTitle";
import useClientComponent from "@/hooks/useClientComponent";

const DashboardGreater = () => {
  const isClient = useClientComponent();
  const { data: session } = useSession();

  const userNickname = session?.user?.name?.split(" ")[0];

  return isClient ? (
    <DashboardTitle>{userNickname ? `Добро пожаловать, ${userNickname}` : 'Добро пожаловать'} 🥳👋</DashboardTitle>
  ) : (
    <DashboardTitle>Привет 🥳👋</DashboardTitle>
  );
};

export default DashboardGreater;

