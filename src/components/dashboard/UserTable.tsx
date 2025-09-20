"use client";
import { IUser } from "@/models/User";
import Image from "next/image"
import EditButton from "@/components/dashboard/buttons/EditButton";
import DeleteButton from "@/components/dashboard/buttons/DeleteButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaginationControls from "./PaginationControls";

export default function UserTable({
  items,
  totalItemsLength,
  page,
  per_page,
  deleteAction
}: {
  items: IUser[];
  totalItemsLength: number;
  page: string | string[];
  per_page: string | string[];
  deleteAction: (id: string) => void
}) {
  const start = (Number(page) - 1) * Number(per_page);
  const totalPages = Math.ceil(totalItemsLength / Number(per_page));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[150px]">ID</TableHead>
          <TableHead className="min-w-[200px]">Имя</TableHead>
          <TableHead className="min-w-[250px]">Email</TableHead>
          <TableHead className="min-w-[150px]">Роль</TableHead>
          <TableHead className="min-w-[150px]">Фото</TableHead>
          <TableHead className="min-w-[150px] text-center">Всего задач</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.map(({ _id, name, email, role, image, tasks }) => (
          <TableRow key={_id?.toString() as string}>
            <TableCell>{_id as unknown as string}</TableCell>
            <TableCell>{name}</TableCell>
            <TableCell>{email}</TableCell>
            <TableCell
              className={
                role === "admin"
                  ? "text-blue-500"
                  : role === "worker"
                    ? "text-green-500"
                    : "text-gray-500"
              }
            >
              {{
                admin: "Администратор",
                worker: "Сотрудник",
                user: "Пользователь",
              }[role as 'admin' | 'worker' | 'user'] ?? role}
            </TableCell>
            <TableCell>
              <Image
                src={image}
                alt={name}
                width={40}
                height={40}
                className="rounded-full"
              />
            </TableCell>
            <TableCell className="text-center">{tasks?.length || 0}</TableCell>
            <TableCell className="flex justify-end text-right">
              <EditButton email={email} />
              <DeleteButton
                // @ts-ignore
                action={deleteAction}
                id={_id as string}
              />
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell
            className="bg-background text-muted-foreground pb-0"
            colSpan={5}
          >
            Всего пользователей: {totalItemsLength}
          </TableCell>
          <TableCell className="bg-background pb-0" colSpan={2}>
            <PaginationControls
              hasNextPage={Number(page) < totalPages}
              hasPrevPage={start > 0}
              totalItemsLength={totalItemsLength}
            />
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
