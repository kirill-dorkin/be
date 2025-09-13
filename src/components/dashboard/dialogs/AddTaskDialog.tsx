"use client";

import { useState, } from "react";
import useCustomToast from "@/hooks/useCustomToast";
import { Button } from "@/components/ui/button";
import { useTranslations } from 'next-intl';
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

const createTaskSchema = (t: (key: string) => string) => z.object({
  description: z
    .string()
    .min(1, { message: t('validation.descriptionRequired') })
    .max(255, { message: t('validation.descriptionMaxLength') }),
  customerName: z
    .string()
    .min(1, { message: t('validation.customerNameRequired') })
    .max(100, { message: t('validation.customerNameMaxLength') }),
  customerPhone: z
    .string()
    .min(1, { message: t('validation.customerPhoneRequired') })
    .refine(isValidPhoneNumber, { message: t('validation.invalidPhoneNumber') }),
  laptopBrand: z
    .string()
    .min(1, { message: t('validation.laptopBrandRequired') })
    .max(100, { message: t('validation.laptopBrandMaxLength') }),
  laptopModel: z
    .string()
    .min(1, { message: t('validation.laptopModelRequired') })
    .max(100, { message: t('validation.laptopModelMaxLength') }),
  totalCost: z
    .number()
    .min(0, { message: t('validation.costPositive') }),
});

export function AddTaskDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const country = useGeoCountry();
  const t = useTranslations('dashboard.addTask');
  
  const TaskSchema = createTaskSchema(t);

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
        showErrorToast({ title: t('error'), description: response.message });
      } else {
        showSuccessToast({
          title: t('success'),
          description: response.message,
        });
      }
    } catch (error) {
      showErrorToast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('unknownError'),
      });
    } finally {
      setLoading(false);
    }
  };

  const taskFields = [
    { name: "description", label: t('fields.description'), type: "text" },
    { name: "customerName", label: t('fields.customerName'), type: "text" },
    { name: "customerPhone", label: t('fields.customerPhone'), type: "text" },
    { name: "laptopBrand", label: t('fields.laptopBrand'), type: "text" },
    { name: "laptopModel", label: t('fields.laptopModel'), type: "text" },
    { name: "totalCost", label: t('fields.totalCost'), type: "number" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="lg">{t('addTask')}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-full max-w-lg px-6 py-4 overflow-y-auto max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{t('addTask')}</DialogTitle>
          <DialogDescription>
            {t('fillTaskData')}
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
              {loading ? t('saving') : t('save')}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
