"use client";
import React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import { useSession } from "next-auth/react";

const AdminProfileHeader: React.FC = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const name = user?.name;
  const image = user?.image;

  return (
    <div className="flex items-center justify-between space-x-6 bg-transparent rounded-lg">
      <span className="font-semibold text-muted-foreground">{name}</span>

      <Avatar className="w-10 h-10">
        <AvatarImage src={image as string} alt={`Фото профиля ${name}`} />
        <AvatarFallback>{name?.charAt(0) as string}</AvatarFallback>
      </Avatar>
    </div>
  );
};

export default AdminProfileHeader;

