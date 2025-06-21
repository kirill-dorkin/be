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
import addServiceAction from "@/actions/dashboard/addServiceAction";
import getDevicesAction from "@/actions/dashboard/getDevicesAction";
import { useEffect, useState as useReactState } from "react";
import { IDevice } from "@/models/Device";

const ServiceSchema = z.object({
  device: z.string().min(1),
  name: z.string().min(1, { message: "Name is required" }).max(100),
  cost: z
    .string()
    .transform((v) => parseFloat(v))
    .refine((v) => !isNaN(v) && v >= 0, { message: "Cost must be positive" }),
});

export function AddServiceDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const [devices, setDevices] = useReactState<IDevice[]>([]);

  useEffect(() => {
    getDevicesAction(1, 100).then((res) => {
      if (res.status === "success") {
        setDevices(res.items);
      }
    });
  }, [setDevices]);

  const methods = useForm<{ device: string; name: string; cost: number }>({
    resolver: zodResolver(ServiceSchema),
    defaultValues: { device: "", name: "", cost: 0 },
    mode: "onChange",
  });

  const { handleSubmit, control, reset } = methods;

  const handleSubmitAction = async (data: { device: string; name: string; cost: number }) => {
    setLoading(true);
    try {
      const response = await addServiceAction(data.device, data.name, data.cost);
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
            <InputFormField name="name" label="Name" type="text" control={control} />
            <InputFormField name="cost" label="Cost" type="number" control={control} />
            <div className="flex flex-col gap-2">
              <label className="text-sm" htmlFor="device">Device</label>
              <select id="device" {...methods.register("device")}
                className="border rounded px-3 py-2">
                <option value="">Select</option>
                {devices.map((d) => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
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
