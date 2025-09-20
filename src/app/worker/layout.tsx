"use client"
import { ReactNode, useEffect } from "react";
import Sidebar from "@/components/dashboard/Sidebar"
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (session?.user?.role !== "worker") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return null
  }

  return (
    <div className="flex max-h-svh">
      <Sidebar />
      {children}
    </div>
  );
}
