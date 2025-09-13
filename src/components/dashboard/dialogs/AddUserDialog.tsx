"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
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

const createUserSchema = (t: ReturnType<typeof useTranslations>) => z.object({
  name: z.string().min(1, { message: t("users.nameRequired") }).max(100),
  email: z.string().email({ message: t("users.emailInvalid") }),
  password: z.string().min(6, { message: t("users.passwordMinLength") }),
});

type UserForm = z.infer<ReturnType<typeof createUserSchema>>;

export function AddUserDialog() {
  const t = useTranslations();
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const methods = useForm<UserForm>({
    resolver: zodResolver(createUserSchema(t)),
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
        showErrorToast({ title: t("common.error"), description: response.message || t("common.errorOccurred") });
      } else {
        showSuccessToast({ title: t("common.success"), description: response.message || t("common.operationSuccessful") });
        reset();
      }
    } catch (error) {
      showErrorToast({
        title: t("common.error"),
        description: error instanceof Error ? error.message : t("users.addUserError"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>{t("users.addUser")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("users.addUser")}</DialogTitle>
          <DialogDescription>{t("users.userDetails")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField
              name="name"
              label={t("users.name")}
              id="name"
              type="text"
              control={control}
              errors={errors}
            />
            <InputFormField
              name="email"
              label={t("users.email")}
              id="email"
              type="text"
              control={control}
              errors={errors}
            />
            <InputFormField
              name="password"
              label={t("users.password")}
              id="password"
              type="password"
              control={control}
              errors={errors}
            />
          </FormProvider>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? t("users.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
