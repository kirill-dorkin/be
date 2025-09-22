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
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputFormField from "@/shared/ui/InputFormField";
import { addUserAction } from "@/shared/api/dashboard/addUserAction";

const UserSchema = z.object({
  name: z.string().min(1, { message: "Имя обязательно" }).max(100),
  email: z.string().email({ message: "Некорректный email" }),
  password: z.string().min(6, { message: "Пароль должен быть не менее 6 символов" }),
});

type UserForm = z.infer<typeof UserSchema>;

export function AddUserDialog() {
  const [loading, setLoading] = useState(false);


  const methods = useForm<UserForm>({
    resolver: zodResolver(UserSchema),
    defaultValues: { name: "", email: "", password: "" },
    mode: "onChange",
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = methods;

  const handleSubmitAction = async (data: UserForm) => {
    setLoading(true);
    try {
      const response = await addUserAction(data.name, data.email, data.password, "worker");
      if (response.status === "error") {
        showToast.error(response.message || "Произошла ошибка");
      } else {
        showToast.success(response.message || "Пользователь добавлен");
        reset();
      }
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : "Не удалось добавить пользователя");
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
            <InputFormField<UserForm>
              name="name"
              label="Имя"
              id="name"
              type="text"
              control={control}
              errors={errors}
            />
            <InputFormField<UserForm>
              name="email"
              label="Email"
              id="email"
              type="text"
              control={control}
              errors={errors}
            />
            <InputFormField<UserForm>
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
