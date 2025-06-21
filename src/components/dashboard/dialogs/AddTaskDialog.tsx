"use client";

import { useState, } from "react";
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
import { ITask } from "@/models/Task";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputFormField from "@/components/InputFormField";
import PhoneInputField from "@/components/PhoneInputField";
import useGeoCountry from "@/hooks/useGeoCountry";
import { isValidPhoneNumber } from "react-phone-number-input";
import addTaskAction from "@/actions/dashboard/addTaskAction";

const TaskSchema = z.object({
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(255, { message: "Description cannot exceed 255 characters" }),
  customerName: z
    .string()
    .min(1, { message: "Customer name is required" })
    .max(100, { message: "Customer name cannot exceed 100 characters" }),
  customerPhone: z
    .string()
    .min(1, { message: "Customer phone is required" })
    .refine(isValidPhoneNumber, { message: "Invalid phone number" }),
  laptopBrand: z
    .string()
    .min(1, { message: "Laptop brand is required" })
    .max(100, { message: "Laptop brand cannot exceed 100 characters" }),
  laptopModel: z
    .string()
    .min(1, { message: "Laptop model is required" })
    .max(100, { message: "Laptop model cannot exceed 100 characters" }),
  totalCost: z
    .string()
    .transform((value) => parseFloat(value))
    .refine((value) => !isNaN(value) && value >= 0, {
      message: "Total cost must be a positive number",
    }),
});

export function AddTaskDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const country = useGeoCountry();

  const methods = useForm<ITask>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      description: '',
      customerName: '',
      customerPhone: '',
      laptopBrand: '',
      laptopModel: '',
      totalCost: 0,
    },
    mode: "onChange",
  });

  const { control, handleSubmit, formState: { errors } } = methods;

  const handleSubmitAction = async (data: ITask) => {
    setLoading(true);
    try {
      const response = await addTaskAction(data);

      if (response.status === "error") {
        showErrorToast({ title: "Error", description: response.message });
      } else {
        showSuccessToast({
          title: "Success",
          description: response.message,
        });
      }
    } catch (error) {
      showErrorToast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setLoading(false);
    }
  };

  const taskFields = [
    { name: "description", label: "Description", type: "text" },
    { name: "customerName", label: "Customer Name", type: "text" },
    { name: "customerPhone", label: "Customer Phone", type: "text" },
    { name: "laptopBrand", label: "Laptop Brand", type: "text" },
    { name: "laptopModel", label: "Laptop Model", type: "text" },
    { name: "totalCost", label: "Total Cost", type: "number" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">Add New Task</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-full max-w-lg px-6 py-4 overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
          <DialogDescription>
            Fill in the details for the new task. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(handleSubmitAction)}
            className="space-y-4"
          >
            {taskFields.map((field) => (
              field.name === "customerPhone" ? (
                <PhoneInputField
                  key={field.name}
                  control={control}
                  name={field.name as keyof ITask}
                  label={field.label}
                  defaultCountry={country}
                />
              ) : (
                <InputFormField
                  key={field.name}
                  control={control}
                  name={field.name as keyof ITask}
                  id={field.name}
                  label={field.label}
                  errors={errors}
                  type={field.type}
                />
              )
            ))}

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full py-2">
                {loading ? "Saving..." : "Save Task"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
