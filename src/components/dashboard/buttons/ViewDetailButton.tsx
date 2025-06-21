"use client";
import { type ReactElement } from "react";
import { Button } from "@/components/ui/button";
import { GrView } from "react-icons/gr";
import { useRouter } from "next/navigation";

export interface ViewDetailButtonProps {
  path: string;
}

export default function ViewDetailButton({
  path,
}: ViewDetailButtonProps): ReactElement {
  const router = useRouter();

  const handleView = async () => {
    router.push(path);
  };

  return (
    <Button
      onClick={handleView}
      size="sm"
      variant="ghost"
      className="bg-transparent"
    >
      <GrView className="text-foreground text-lg" />
    </Button>
  );
}

