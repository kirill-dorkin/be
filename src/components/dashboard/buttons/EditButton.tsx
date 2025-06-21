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
        title: "Error",
        description: "Please select a role.",
      });
      return;
    }

    setLoading(true)

    const result = await setUserRoleAction({ email, role });

    setLoading(false);

    if (result.status === "success") {
      showSuccessToast({
        title: "Success",
        description: result.message as string,
      });
    } else {
      showErrorToast({
        title: "Error",
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
            <DialogTitle>Edit Role</DialogTitle>
            <DialogDescription>
              Update the role of the user here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Select
                value={role}
                onValueChange={setRole}
              >
                <SelectTrigger className="col-span-3 w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                    <SelectItem value="user">User</SelectItem>
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
              {loading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
