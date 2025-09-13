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
import addServiceAction from "@/actions/dashboard/addServiceAction";
import getCategoriesAction from "@/actions/dashboard/getCategoriesAction";
import { ICategory } from "@/models/Category";
import { useTranslations } from "next-intl";
import { ServiceFormData } from "@/schemas/ServiceSchema";

const createServiceSchema = (t: ReturnType<typeof useTranslations>) => z.object({
  category: z.string().min(1),
  name: z.string().min(1, { message: t("services.nameRequired") }).max(100),
  cost: z.string().refine((v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0, { message: t("services.costMustBePositive") }),
  duration: z.string().optional(),
});

export function AddServiceDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [categories, setCategories] = useState<ICategory[]>([]);
  const t = useTranslations();
  
  const ServiceSchema = createServiceSchema(t);

  useEffect(() => {
    getCategoriesAction(1, 100).then((res) => {
      if (res.status === "success") {
        setCategories((res.items as unknown as ICategory[]) || []);
      }
    });
  }, []);

  const methods = useForm<ServiceFormData>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: { category: "", name: "", cost: "0", duration: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  const handleSubmitAction = async (data: ServiceFormData) => {
    setLoading(true);
    try {
      const response = await addServiceAction(data.category, data.name, parseFloat(data.cost), data.duration || "");
      if (response.status === "error") {
        showErrorToast({ title: t("common.error"), description: response.message });
      } else {
        showSuccessToast({ title: t("common.success"), description: response.message });
        reset();
      }
    } catch (error) {
      showErrorToast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("services.addServiceError"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{t("services.addService")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("services.addService")}</DialogTitle>
          <DialogDescription>{t("services.serviceDetails")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField<ServiceFormData>
              name="name"
              id="name"
              label={t("services.name")}
              type="text"
              control={control}
              errors={errors}
            />
            <InputFormField<ServiceFormData>
              name="cost"
              id="cost"
              label={t("services.cost")}
              type="number"
              control={control}
              errors={errors}
            />
            <InputFormField<ServiceFormData>
              name="duration"
              id="duration"
              label={t("services.duration")}
              type="text"
              control={control}
              errors={errors}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm" htmlFor="category">{t("services.category")}</label>
              <Select
                value={methods.watch("category")}
                onValueChange={(value) => methods.setValue("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder={t("common.select")} />
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
            <Button type="submit" disabled={loading}>{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
