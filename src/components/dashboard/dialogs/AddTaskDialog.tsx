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
import PhoneInputField from "@/components/PhoneInputField";
import useGeoCountry from "@/hooks/useGeoCountry";
import { isValidPhoneNumber } from "react-phone-number-input";
import addTaskAction from "@/actions/dashboard/addTaskAction";

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
    .number()
    .min(0, { message: "Стоимость должна быть положительным числом" }),
});

type TaskForm = z.infer<typeof TaskSchema>;

export function AddTaskDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const country = useGeoCountry();

  const methods = useForm<TaskForm>({
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

  const { handleSubmit, control, formState: { errors } } = methods;

  const handleSubmitAction = async (data: TaskForm) => {
    setLoading(true);
    try {
      const response = await addTaskAction(data);

      if (response.status === "error") {
        showErrorToast({ title: "Ошибка", description: response.message || "Произошла ошибка" });
      } else {
        showSuccessToast({
          title: "Успешно",
          description: response.message || "Задача добавлена",
        });
      }
    } catch (error) {
      showErrorToast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Произошла неизвестная ошибка",
      });
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
    { name: "totalCost", label: "Стоимость", type: "number" },
  ];

  return (
    <Dialog>
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
            onSubmit={handleSubmit(handleSubmitAction)}
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
