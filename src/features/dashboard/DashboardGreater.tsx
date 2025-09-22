"use client";
import { useSession } from "next-auth/react";
import DashboardTitle from "./DashboardTitle";
import useClientComponent from "@/shared/lib/useClientComponent";

const DashboardGreater = () => {
  const isClient = useClientComponent();
  const { data: session } = useSession();

  const userNickname = session?.user?.name?.split(" ")[0];

  return isClient ? (
    <DashboardTitle>Добро пожаловать, {userNickname} 🥳👋</DashboardTitle>
  ) : (
    <DashboardTitle>Привет 🥳👋</DashboardTitle>
  );
};

export default DashboardGreater;

