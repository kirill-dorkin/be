"use client";
import { useState } from "react";
import { showToast } from "@/shared/lib/toast";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputFormField from "@/shared/ui/InputFormField";
import { addCategoryAction } from "@/shared/api/dashboard/addCategoryAction";

const CategorySchema = z.object({
  name: z.string().min(1, { message: "Название обязательно" }).max(100),
});

type CategoryForm = z.infer<typeof CategorySchema>;

export function AddCategoryDialog() {
  const [loading, setLoading] = useState(false);


  const methods = useForm<CategoryForm>({
    resolver: zodResolver(CategorySchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  const handleSubmitAction = async (data: { name: string }) => {
    setLoading(true);
    try {
      const response = await addCategoryAction(data.name);
      if (response.status === "error") {
        showToast.error(response.message);
      } else {
        showToast.success(response.message);
        reset();
      }
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Не удалось добавить категорию");
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
          <DialogDescription>Укажите название категории</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField<CategoryForm>
              name="name"
              label="Название категории"
              id="name"
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
