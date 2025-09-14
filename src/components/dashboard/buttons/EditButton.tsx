"use client";
import { type ReactElement, useState } from "react";
import { Button } from "@/components/ui/button";
import { MdOutlineEdit } from "react-icons/md";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { setUserRoleAction } from "@/actions/dashboard/setUserRoleAction";
import useCustomToast from "@/hooks/useCustomToast";

export interface EditButtonProps {
  email: string;
}

export default function EditButton({
  email
}: EditButtonProps): ReactElement {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();

  const handleSaveRole = async () => {
    if (!role) {
      showErrorToast({
        title: "Ошибка",
        description: "Выберите роль",
      });
      return;
    }

    setLoading(true)

    const result = await setUserRoleAction({ email, role });

    setLoading(false);

    if (result.status === "success") {
      showSuccessToast({
        title: "Успех",
        description: result.message as string,
      });
    } else {
      showErrorToast({
        title: "Ошибка",
        description: result.message as string,
      });
    }
  };

  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button
            size="sm"
            variant="ghost"
            className="bg-transparent"
            disabled={loading}
          >
            <MdOutlineEdit className="text-foreground text-lg" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Изменить роль</DialogTitle>
            <DialogDescription>
              Измените роль пользователя в системе
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Роль
              </Label>
              <Select
                value={role}
                onValueChange={setRole}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Выберите роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Роли</SelectLabel>
                    <SelectItem value="admin">Администратор</SelectItem>
                    <SelectItem value="worker">Сотрудник</SelectItem>
                    <SelectItem value="user">Пользователь</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              onClick={handleSaveRole}
              disabled={loading}
            >
              {loading ? "Сохранение..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
