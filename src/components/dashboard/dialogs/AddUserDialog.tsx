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
  name: z.string().min(1, { message: "Name is required" }).max(100),
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
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
        showErrorToast({ title: "Error", description: response.message });
      } else {
        showSuccessToast({ title: "Success", description: response.message });
        reset();
      }
    } catch (error) {
      showErrorToast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add user",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Add Worker</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Worker</DialogTitle>
          <DialogDescription>Provide worker credentials</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4">
          <FormProvider {...methods}>
            <InputFormField
              name="name"
              label="Name"
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
              label="Password"
              id="password"
              type="password"
              control={control}
              errors={errors}
            />
          </FormProvider>
          <DialogFooter className="pt-2">
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
