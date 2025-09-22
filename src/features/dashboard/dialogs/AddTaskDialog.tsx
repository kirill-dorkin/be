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
import PhoneInputField from "@/shared/ui/PhoneInputField";
import useGeoCountry from "@/shared/lib/useGeoCountry";
import { isValidPhoneNumber } from "react-phone-number-input";
import { addTaskAction } from "@/shared/api/dashboard/addTaskAction";

const TaskSchema = z.object({
  description: z
    .string()
    .min(1, { message: "Описание обязательно" })
    .max(255, { message: "Описание не может превышать 255 символов" }),
  customerName: z
    .string()
    .min(1, { message: "Имя клиента обязательно" })
    .max(100, { message: "Имя клиента не может превышать 100 символов" }),
  customerPhone: z
    .string()
    .min(1, { message: "Телефон клиента обязателен" })
    .refine(isValidPhoneNumber, { message: "Неверный номер телефона" }),
  laptopBrand: z
    .string()
    .min(1, { message: "Марка ноутбука обязательна" })
    .max(100, { message: "Марка ноутбука не может превышать 100 символов" }),
  laptopModel: z
    .string()
    .min(1, { message: "Модель ноутбука обязательна" })
    .max(100, { message: "Модель ноутбука не может превышать 100 символов" }),
  totalCost: z
    .string()
    .min(1, { message: "Стоимость обязательна" })
    .refine((val) => val !== '' && !isNaN(parseFloat(val)) && parseFloat(val) >= 0, { 
      message: "Стоимость должна быть положительным числом" 
    })
    .transform((val) => parseFloat(val)),
});

type TaskForm = z.infer<typeof TaskSchema>;

export function AddTaskDialog() {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const country = useGeoCountry();

  const methods = useForm<TaskForm>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      description: '',
      customerName: '',
      customerPhone: '',
      laptopBrand: '',
      laptopModel: '',
      totalCost: '0',
    },
    mode: "onChange",
  });

  const { handleSubmit, control, formState: { errors }, reset } = methods;

  const handleSubmitAction = async (data: TaskForm) => {
    console.log("🎯 handleSubmitAction CALLED");
    console.log("📋 Form submitted with data:", data);
    setLoading(true);
    try {
      const response = await addTaskAction(data);
      console.log('addTaskAction result:', response);

      if (response.status === "error") {
        showToast.error(response.message || "Произошла ошибка");
      } else {
        showToast.success(response.message || "Задача добавлена");
        reset(); // Сбрасываем форму
        setOpen(false); // Закрываем диалог
      }
    } catch (error) {
      console.error('Error in handleSubmitAction:', error);
      showToast.error(error instanceof Error ? error.message : "Произошла неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  const taskFields = [
    { name: "description", label: "Описание", type: "text" },
    { name: "customerName", label: "Имя клиента", type: "text" },
    { name: "customerPhone", label: "Телефон клиента", type: "text" },
    { name: "laptopBrand", label: "Марка ноутбука", type: "text" },
    { name: "laptopModel", label: "Модель ноутбука", type: "text" },
    { name: "totalCost", label: "Стоимость", type: "text" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg">Добавить задачу</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-full max-w-lg px-6 py-4 overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Добавить задачу</DialogTitle>
          <DialogDescription>
            Заполните данные новой задачи и нажмите сохранить.
          </DialogDescription>
        </DialogHeader>

        <FormProvider {...methods}>
          <form
            onSubmit={(e) => {
              console.log("🔥 Form onSubmit triggered");
              handleSubmit(handleSubmitAction)(e);
            }}
            className="space-y-4"
          >
            {taskFields.map((field) => (
              field.name === "customerPhone" ? (
                <PhoneInputField
                  key={field.name}
                  control={control}
                  name={field.name as keyof TaskForm}
                  label={field.label}
                  defaultCountry={country}
                />
              ) : (
                <InputFormField<TaskForm>
                  key={field.name}
                  control={control}
                  name={field.name as keyof TaskForm}
                  id={field.name}
                  label={field.label}
                  errors={errors}
                  type={field.type as "text" | "email" | "password" | "number" | "textarea" | "image"}
                />
              )
            ))}

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full py-2">
              {loading ? "Сохранение..." : "Сохранить"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
