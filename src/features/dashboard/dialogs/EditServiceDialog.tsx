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
} from "@/shared/ui/dialog";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputFormField from "@/shared/ui/InputFormField";
import { updateServiceAction } from "@/shared/api/dashboard/updateServiceAction";
import { getCategoriesAction } from "@/shared/api/dashboard/getCategoriesAction";
import { ICategory } from "@/entities/category/Category";
import { Service } from "@/shared/types";
import { Edit } from "lucide-react";

const ServiceSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1, { message: "Название обязательно" }).max(100),
  cost: z.number().min(0, { message: "Стоимость должна быть положительной" }),
  duration: z.string().optional(),
});

type ServiceForm = z.infer<typeof ServiceSchema>;

interface EditServiceDialogProps {
  service: Service;
  onServiceUpdated?: () => void;
}

export function EditServiceDialog({ service, onServiceUpdated }: EditServiceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<ICategory[]>([]);

  const methods = useForm<ServiceForm>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: {
      category: typeof service.category === 'string' ? service.category : (service.category as any)?._id || '',
      name: service.name,
      cost: service.cost,
      duration: service.duration || '',
    },
  });

  const { handleSubmit, control, reset } = methods;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesAction();
        setCategories((response.items as unknown as ICategory[]) || []);
      } catch (error) {
        console.error("Ошибка загрузки категорий:", error);
        showToast.error("Ошибка загрузки категорий");
      }
    };

    if (open) {
      fetchCategories();
      // Сброс формы с актуальными данными услуги при открытии
      reset({
        category: typeof service.category === 'string' ? service.category : (service.category as any)?._id || '',
        name: service.name,
        cost: service.cost,
        duration: service.duration || '',
      });
    }
  }, [open, service, reset]);

  const handleSubmitAction = async (data: ServiceForm) => {
    setLoading(true);
    try {
      const result = await updateServiceAction(service._id as string, {
        category: data.category,
        name: data.name,
        cost: data.cost,
        duration: data.duration,
      });

      if (result.status === "success") {
        showToast.success("Услуга успешно обновлена");
        setOpen(false);
        onServiceUpdated?.();
      } else {
        showToast.error(result.message || "Ошибка обновления услуги");
      }
    } catch (error) {
      console.error("Ошибка обновления услуги:", error);
      showToast.error("Ошибка обновления услуги");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 w-8 p-0"
      >
        <Edit className="h-4 w-4" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Редактировать услугу</DialogTitle>
          <DialogDescription>Изменить детали услуги</DialogDescription>
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
              min={0}
              step={0.01}
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}