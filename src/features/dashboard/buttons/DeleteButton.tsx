"use client";

import { type ReactElement } from "react";
import { Button } from "@/shared/ui/button";
import { Icons } from '@/shared/ui/icons';
import useCustomToast from "@/shared/lib/useCustomToast";

export interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<{ message: string; status: string }>;
}

export default function DeleteButton({
  id,
  action,
}: DeleteButtonProps): ReactElement {
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const handleDeleteAction = async () => {
    try {
      const response = await action(id);

      if (response.status === "error") return showErrorToast({ title: "Ошибка", description: response.message });

      showSuccessToast({
        title: "Успешно",
        description: response.message,
      });
    } catch (error) {

      showErrorToast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла неизвестная ошибка",
      });
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
