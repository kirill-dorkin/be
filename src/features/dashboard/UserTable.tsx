"use client";
import { memo, useMemo } from "react";
import { type IUser } from "@/entities/user/User";
import { AvatarImage } from "@/shared/ui/OptimizedImage";
import { deleteUserAction } from "@/shared/api/dashboard/deleteUserAction";
import DeleteButton from "./buttons/DeleteButton";
import EditButton from "./buttons/EditButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import PaginationControls from "./PaginationControls";

interface UserTableProps {
  items: IUser[] | undefined;
  totalItemsLength: number;
  page: number;
  per_page: number;
}

const UserTableRow = memo(({ user }: { user: IUser }) => (
  <TableRow>
    <TableCell className="font-medium">{user._id?.toString()}</TableCell>
    <TableCell>{user.name}</TableCell>
    <TableCell>{user.email}</TableCell>
    <TableCell>{user.role}</TableCell>
    <TableCell>
      <AvatarImage
        src={user.image || "/default-avatar.svg"}
        alt={`${user.name} avatar`}
        width={40}
        height={40}
        priority={false}
        sizes="40px"
      />
    </TableCell>
    <TableCell>{user.tasks?.length || 0}</TableCell>
    <TableCell className="flex gap-2">
      <EditButton email={user.email} />
      <DeleteButton id={user._id?.toString() || ""} action={deleteUserAction} />
    </TableCell>
  </TableRow>
));

UserTableRow.displayName = "UserTableRow";

const UserTable = memo(({ items, totalItemsLength, page, per_page }: UserTableProps) => {
  const start = useMemo(() => (page - 1) * per_page, [page, per_page]);

  const memoizedRows = useMemo(
    () => {
      if (!Array.isArray(items)) {
        console.warn('UserTable: items is not an array:', items);
        return [];
      }
      return items.map((user, index) => (
        <UserTableRow key={user._id?.toString() || `user-${index}`} user={user} />
      ));
    },
    [items]
  );

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Имя</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Роль</TableHead>
            <TableHead>Фото</TableHead>
            <TableHead>Количество задач</TableHead>
            <TableHead>Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {memoizedRows}
        </TableBody>
      </Table>
      <PaginationControls
        hasNextPage={start + per_page < totalItemsLength}
        hasPrevPage={start > 0}
        totalItemsLength={totalItemsLength}
      />
    </div>
  );
});

UserTable.displayName = "UserTable";

export default UserTable;
