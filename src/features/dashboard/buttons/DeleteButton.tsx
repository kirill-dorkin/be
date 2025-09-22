"use client";

import { type ReactElement } from "react";
import { Button } from "@/shared/ui/button";
import { Icons } from '@/shared/ui/icons';
import { showToast } from "@/shared/lib/toast";

export interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<{ message?: string; status: string }>;
}

export default function DeleteButton({
  id,
  action,
}: DeleteButtonProps): ReactElement {


  const handleDeleteAction = async () => {
    try {
      const response = await action(id);

      if (response.status === "error") {
        return showToast.error(response.message || "Произошла ошибка при удалении");
      }

      showToast.success(response.message || "Успешно удалено");
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Произошла неизвестная ошибка");
    }
  };

  return (
    <Button
      onClick={handleDeleteAction}
      size="sm"
      variant="ghost"
      className="bg-transparent"
    >
      <Icons.delete className="text-destructive text-lg" />
    </Button>
  );
}
