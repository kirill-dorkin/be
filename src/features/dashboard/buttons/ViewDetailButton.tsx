"use client";
import { type ReactElement } from "react";
import { Button } from "@/shared/ui/button";
import { Icons } from '@/shared/ui/icons';
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
      <Icons.view className="text-foreground text-lg" />
    </Button>
  );
}

