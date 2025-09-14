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

import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputFormField from "@/components/InputFormField";
import PhoneInputField from "@/components/PhoneInputField";
import useGeoCountry from "@/hooks/useGeoCountry";
import { isValidPhoneNumber } from "react-phone-number-input";
import addTaskAction from "@/actions/dashboard/addTaskAction";
import { TaskFormData } from "@/schemas/TaskSchema";

const createTaskSchema = () => z.object({
  description: z
    .string()
    .min(1, { message: 'Описание обязательно' })
    .max(255, { message: 'Описание не должно превышать 255 символов' }),
  customerName: z
    .string()
    .min(1, { message: 'Имя клиента обязательно' })
    .max(100, { message: 'Имя клиента не должно превышать 100 символов' }),
  customerPhone: z
    .string()
    .min(1, { message: 'Телефон клиента обязателен' })
    .refine(isValidPhoneNumber, { message: 'Неверный номер телефона' }),
  laptopBrand: z
    .string()
    .min(1, { message: 'Бренд ноутбука обязателен' })
    .max(100, { message: 'Бренд ноутбука не должен превышать 100 символов' }),
  laptopModel: z
    .string()
    .min(1, { message: 'Модель ноутбука обязательна' })
    .max(100, { message: 'Модель ноутбука не должна превышать 100 символов' }),
  totalCost: z
    .number()
    .min(0, { message: 'Стоимость должна быть положительной' }),
});

export function AddTaskDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const country = useGeoCountry();
  
  const TaskSchema = createTaskSchema();

  const methods = useForm<TaskFormData>({
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

  const handleSubmitAction = async (data: TaskFormData) => {
    setLoading(true);
    try {
      const response = await addTaskAction(data);

      if (response.status === "error") {
        showErrorToast({ title: 'Ошибка', description: response.message });
      } else {
        showSuccessToast({
          title: 'Успех',
          description: response.message,
        });
      }
    } catch (error) {
      showErrorToast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Неизвестная ошибка',
      });
    } finally {
      setLoading(false);
    }
  };

  const taskFields = [
    { name: "description", label: 'Описание', type: "text" },
    { name: "customerName", label: 'Имя клиента', type: "text" },
    { name: "customerPhone", label: 'Телефон клиента', type: "text" },
    { name: "laptopBrand", label: 'Бренд ноутбука', type: "text" },
    { name: "laptopModel", label: 'Модель ноутбука', type: "text" },
    { name: "totalCost", label: 'Общая стоимость', type: "number" },
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
            Заполните данные задачи
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
                  name={field.name as keyof TaskFormData}
                  label={field.label}
                  defaultCountry={country}
                />
              ) : (
                <InputFormField
                  key={field.name}
                  control={control}
                  name={field.name as keyof TaskFormData}
                  id={field.name}
                  label={field.label}
                  errors={errors}
                  type={field.type}
                />
              )
            ))}

            <DialogFooter>
              <Button type="submit" disabled={loading} className="w-full py-2">
              {loading ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
