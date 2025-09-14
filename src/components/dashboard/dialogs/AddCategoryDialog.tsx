"use client";
import { useState } from "react";

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

const createCategorySchema = () => z.object({
  name: z.string().min(1, { message: "Название обязательно" }).max(100),
});

type CategoryFormData = z.infer<ReturnType<typeof createCategorySchema>>;

export function AddCategoryDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const methods = useForm<CategoryFormData>({
    resolver: zodResolver(createCategorySchema()),
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
        showErrorToast({ title: "Ошибка", description: response.message });
      } else {
        showSuccessToast({ title: "Успех", description: response.message });
        reset();
      }
    } catch (error) {
      showErrorToast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Ошибка при добавлении категории",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Добавить категорию</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить категорию</DialogTitle>
          <DialogDescription>Введите детали категории</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField
              name="name"
              id="name"
              label="Название"
              type="text"
              control={control}
              errors={errors}
            />
          </FormProvider>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading}>Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
