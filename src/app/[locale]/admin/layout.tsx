'use client'
import { ReactNode, useEffect } from "react";
import EnhancedSidebar from "@/components/dashboard/EnhancedSidebar";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
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

    if (session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return null
  }

  if (session?.user?.role !== "admin") {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <EnhancedSidebar />
      </div>
      
      {/* Mobile Layout */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <MobileSidebar />
          <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
       </div>
     </div>
   );
}
