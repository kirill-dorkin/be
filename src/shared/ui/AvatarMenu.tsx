"use client"
import { ReactElement } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { CreditCard, LogOut } from "lucide-react";

import { Avatar, AvatarImage, AvatarFallback } from "@/shared/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/shared/ui/dropdown-menu";

const renderMenuItem = (
  onClick: () => void,
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>,
  label: string
) => (
  <DropdownMenuItem onClick={onClick} className="cursor-pointer">
    <Icon className="mr-2 h-4 w-4" />
    <span>{label}</span>
  </DropdownMenuItem>
);

export default function AvatarMenu(): ReactElement {
  const { data: session } = useSession();
  const router = useRouter()
  const user = session?.user;

  const avatarFallback = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const handleAuthClick = () => {
    signOut();
  };

  return (
    <div className="empty:hidden text-sm bg-background relative text-secondary-foreground shadow rounded-full flex items-center justify-center size-9">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="cursor-pointer size-full">
            <AvatarImage
              src={user?.image || "/default-avatar.svg"}
              alt="User Avatar"
            />
            <AvatarFallback className="bg-background text-muted-foreground shadow">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Menu</DropdownMenuLabel>
          {/* <DropdownMenuSeparator /> */}
          <DropdownMenuGroup>
            {user?.role !== "admin" ? renderMenuItem(
              () => router.push("/account/orders"),
              CreditCard,
              "Orders"
            ) : renderMenuItem(
              () => router.push("/admin/dashboard"),
              CreditCard,
              "Dashboard"
            )}
          </DropdownMenuGroup>
          {/* <DropdownMenuSeparator /> */}
          {renderMenuItem(handleAuthClick, LogOut, "Log out")}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
