"use client";

import { type ReactElement } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { RiDeleteBin6Line } from "react-icons/ri";
import useCustomToast from "@/hooks/useCustomToast";

export interface DeleteButtonProps {
  id: string;
  action: (id: string) => Promise<{ message: string; status: string }>;
}

export default function DeleteButton({
  id,
  action,
}: DeleteButtonProps): ReactElement {
  const t = useTranslations('common');
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const handleDeleteAction = async () => {
    try {
      const response = await action(id);

      if (response.status === "error") return showErrorToast({ title: t('error'), description: response.message });

      showSuccessToast({
        title: t('success'),
        description: response.message,
      });
    } catch (error) {

      showErrorToast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('unknownError'),
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
      <RiDeleteBin6Line className="text-destructive text-lg" />
    </Button>
  );
}
