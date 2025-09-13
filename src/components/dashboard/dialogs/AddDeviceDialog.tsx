"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
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
import { DeviceFormData } from "@/schemas/DeviceSchema";

const createDeviceSchema = (t: ReturnType<typeof useTranslations>) => z.object({
  category: z.string().min(1),
  brand: z.string().min(1, { message: t("devices.brandRequired") }).max(100),
  deviceModel: z.string().optional(),
});

export function AddDeviceDialog() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    getCategoriesAction(1, 100).then((res) => {
      if (res.status === "success") {
        setCategories((res.items as unknown as ICategory[]) || []);
      }
    });
  }, []);

  const methods = useForm<DeviceFormData>({
    resolver: zodResolver(createDeviceSchema(t)),
    defaultValues: { category: "", brand: "", deviceModel: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  const handleSubmitAction = async (data: DeviceFormData) => {
    setLoading(true);
    try {
      const response = await addDeviceAction(data.category, data.brand, data.deviceModel || "");
      if (response.status === "error") {
        showErrorToast({ title: t("common.error"), description: response.message });
      } else {
        showSuccessToast({ title: t("common.success"), description: response.message });
        reset();
      }
    } catch (error) {
      showErrorToast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("devices.addDeviceError"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{t("devices.addDevice")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("devices.addDevice")}</DialogTitle>
          <DialogDescription>{t("devices.deviceDetails")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField<DeviceFormData>
              name="brand"
              id="brand"
              label={t("devices.brand")}
              type="text"
              control={control}
              errors={errors}
            />
            <InputFormField<DeviceFormData>
              name="deviceModel"
              id="deviceModel"
              label={t("devices.model")}
              type="text"
              control={control}
              errors={errors}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm" htmlFor="category">{t("devices.category")}</label>
              <Select
                value={methods.watch("category")}
                onValueChange={(value) => methods.setValue("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={t("status.select")} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id?.toString()} value={c._id?.toString() || ''}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormProvider>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading}>{t("status.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
