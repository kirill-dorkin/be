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

const ServiceSchema = z.object({
  category: z.string().min(1),
  name: z.string().min(1, { message: "Name is required" }).max(100),
  cost: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v >= 0, { message: "Cost must be positive" }),
  duration: z.string().optional(),
});

export function AddServiceDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [categories, setCategories] = useState<ICategory[]>([]);

  useEffect(() => {
    getCategoriesAction(1, 100).then((res) => {
      if (res.status === "success") {
        setCategories(res.items);
      }
    });
  }, []);

  const methods = useForm<{ category: string; name: string; cost: number; duration?: string }>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: { category: "", name: "", cost: 0, duration: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  const handleSubmitAction = async (data: { category: string; name: string; cost: number; duration?: string }) => {
    setLoading(true);
    try {
      const response = await addServiceAction(data.category, data.name, data.cost, data.duration || "");
      if (response.status === "error") {
        showErrorToast({ title: "Error", description: response.message });
      } else {
        showSuccessToast({ title: "Success", description: response.message });
        reset();
      }
    } catch (error) {
      showErrorToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add service",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Service</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Service</DialogTitle>
          <DialogDescription>Service details</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField
              name="name"
              label="Name"
              type="text"
              control={control}
              errors={errors}
            />
            <InputFormField
              name="cost"
              label="Cost"
              type="number"
              control={control}
              errors={errors}
            />
            <InputFormField
              name="duration"
              label="Duration (e.g. 2 days)"
              type="text"
              control={control}
              errors={errors}
            />
            <div className="flex flex-col gap-2">
              <label className="text-sm" htmlFor="category">Category</label>
              <Select
                value={methods.watch("category")}
                onValueChange={(value) => methods.setValue("category", value)}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </FormProvider>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
