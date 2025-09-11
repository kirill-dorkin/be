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
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputFormField from "@/components/InputFormField";
import addUserAction from "@/actions/dashboard/addUserAction";

const UserSchema = z.object({
  name: z.string().min(1, { message: "Имя обязательно" }).max(100),
  email: z.string().email({ message: "Некорректный email" }),
  password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
});

type UserForm = z.infer<typeof UserSchema>;

export function AddUserDialog() {
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const methods = useForm<UserForm>({
    resolver: zodResolver(UserSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = methods;

  const handleSubmitAction = async (data: UserForm) => {
    setLoading(true);
    try {
      const response = await addUserAction(data.name, data.email, data.password);
      if (response.status === "error") {
        showErrorToast({ title: "Ошибка", description: response.message || "Произошла ошибка" });
      } else {
        showSuccessToast({ title: "Успешно", description: response.message || "Операция выполнена успешно" });
        reset();
      }
    } catch (error) {
      showErrorToast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось добавить пользователя",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Добавить сотрудника</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить сотрудника</DialogTitle>
          <DialogDescription>Укажите данные сотрудника</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField
              name="name"
              label="Имя"
              id="name"
              type="text"
              control={control}
              errors={errors}
            />
            <InputFormField
              name="email"
              label="Email"
              id="email"
              type="text"
              control={control}
              errors={errors}
            />
            <InputFormField
              name="password"
              label="Пароль"
              id="password"
              type="password"
              control={control}
              errors={errors}
            />
          </FormProvider>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
