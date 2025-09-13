"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import useCustomToast from "@/hooks/useCustomToast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputFormField from "@/components/InputFormField";
import addCategoryAction from "@/actions/dashboard/addCategoryAction";

const createCategorySchema = (t: ReturnType<typeof useTranslations>) => z.object({
  name: z.string().min(1, { message: t("categories.nameRequired") }).max(100),
});

type CategoryFormData = z.infer<ReturnType<typeof createCategorySchema>>;

export function AddCategoryDialog() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(createCategorySchema(t)),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  const handleSubmitAction = async (data: CategoryFormData) => {
    setLoading(true);
    try {
      const response = await addCategoryAction(data.name);
      if (response.status === "error") {
        showErrorToast({ title: t("common.error"), description: response.message });
      } else {
        showSuccessToast({ title: t("common.success"), description: response.message });
        reset();
      }
    } catch (error) {
      showErrorToast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("categories.addCategoryError"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{t("categories.addCategory")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("categories.addCategory")}</DialogTitle>
          <DialogDescription>{t("categories.categoryDetails")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField
              name="name"
              id="name"
              label={t("categories.name")}
              type="text"
              control={control}
              errors={errors}
            />
          </FormProvider>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading}>{t("status.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
