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
import { useTranslations } from "next-intl";

export interface EditButtonProps {
  email: string;
}

export default function EditButton({
  email
}: EditButtonProps): ReactElement {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const { showSuccessToast, showErrorToast } = useCustomToast();
  const t = useTranslations();

  const handleSaveRole = async () => {
    if (!role) {
      showErrorToast({
        title: t("common.error"),
        description: t("worker.selectRole"),
      });
      return;
    }

    setLoading(true)

    const result = await setUserRoleAction({ email, role });

    setLoading(false);

    if (result.status === "success") {
      showSuccessToast({
        title: t("common.success"),
        description: result.message as string,
      });
    } else {
      showErrorToast({
        title: t("common.error"),
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
            <DialogTitle>{t("worker.changeRole")}</DialogTitle>
            <DialogDescription>
              {t("worker.changeRoleDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                {t("worker.role")}
              </Label>
              <Select
                value={role}
                onValueChange={setRole}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder={t("worker.selectRole")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>{t("worker.roles")}</SelectLabel>
                    <SelectItem value="admin">{t("worker.admin")}</SelectItem>
                    <SelectItem value="worker">{t("worker.worker")}</SelectItem>
                    <SelectItem value="user">{t("worker.user")}</SelectItem>
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
              {loading ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
