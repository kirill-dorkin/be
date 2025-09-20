"use client";
import { useState, useEffect } from "react";
import useCustomToast from "@/hooks/useCustomToast";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import addDeviceAction from "@/actions/dashboard/addDeviceAction";
import getCategoriesAction from "@/actions/dashboard/getCategoriesAction";
import { ICategory } from "@/models/Category";

const DeviceSchema = z.object({
  category: z.string().min(1),
  brand: z.string().min(1, { message: "Бренд обязателен" }).max(100),
  modelName: z.string().optional(),
});

type DeviceForm = z.infer<typeof DeviceSchema>;

export function AddDeviceDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    getCategoriesAction(1, 100).then((res) => {
      if (res.status === "success" && "items" in res) {
        setCategories(res.items as unknown as ICategory[]);
      }
    });
  }, []);

  const methods = useForm<DeviceForm>({
    resolver: zodResolver(DeviceSchema),
    defaultValues: { category: "", brand: "", modelName: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    control,
  } = methods;

  const handleSubmitAction = async (data: DeviceForm) => {
    setLoading(true);
    try {
      const response = await addDeviceAction(data.category, data.brand, data.modelName || "");
      if (response.status === "error") {
        showErrorToast({ title: "Ошибка", description: response.message || "Произошла ошибка" });
      } else {
        showSuccessToast({ title: "Успешно", description: response.message || "Устройство добавлено" });
        reset();
      }
    } catch (error) {
      showErrorToast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось добавить устройство",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Добавить устройство</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить устройство</DialogTitle>
          <DialogDescription>Укажите параметры устройства</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField<DeviceForm>
              name="brand"
              id="brand"
              label="Бренд"
              type="text"
              control={control}
            />
            <InputFormField<DeviceForm>
              name="modelName"
              id="modelName"
              label="Модель (необязательно)"
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
