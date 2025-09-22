"use client";
import { useState, useEffect } from "react";
import { showToast } from "@/shared/lib/toast";
import { Button } from "@/shared/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
import { addServiceAction } from "@/shared/api/dashboard/addServiceAction";
import { getCategoriesAction } from "@/shared/api/dashboard/getCategoriesAction";
import { ICategory } from "@/entities/category/Category";

const ServiceSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1, { message: "Название обязательно" }).max(100),
  cost: z.number().min(0, { message: "Стоимость должна быть положительной" }),
  duration: z.string().optional(),
});

type ServiceForm = z.infer<typeof ServiceSchema>;

interface AddServiceDialogProps {
  onServiceAdded?: () => void;
}

export function AddServiceDialog({ onServiceAdded }: AddServiceDialogProps) {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    getCategoriesAction(1, 100).then((res) => {
      if (res.status === "success" && "items" in res) {
        setCategories(res.items as unknown as ICategory[]);
      }
    });
  }, []);

  const methods = useForm<ServiceForm>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: { category: "", name: "", cost: 0, duration: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    control,
  } = methods;

  const handleSubmitAction = async (data: ServiceForm) => {
    setLoading(true);
    try {
      const response = await addServiceAction(data.category, data.name, data.cost, data.duration || "");
      if (response.status === "error") {
        showToast.error(response.message);
      } else {
        showToast.success(response.message);
        reset();
        onServiceAdded?.();
      }
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Не удалось добавить услугу");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Добавить услугу</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить услугу</DialogTitle>
          <DialogDescription>Детали услуги</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField<ServiceForm>
              name="name"
              label="Название"
              id="name"
              type="text"
              control={control}
            />
            <InputFormField<ServiceForm>
              name="cost"
              label="Стоимость"
              id="cost"
              type="number"
              control={control}
            />
            <InputFormField<ServiceForm>
              name="duration"
              label="Длительность (например, 2 дня)"
              id="duration"
              type="text"
              control={control}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm" htmlFor="category">Категория</label>
              <Select
                value={methods.watch("category")}
                onValueChange={(value) => methods.setValue("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Выбрать" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id as string} value={c._id as string}>{c.name as string}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormProvider>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading}>Сохранить</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
