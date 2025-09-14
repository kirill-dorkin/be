"use client";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();
  const start = (Number(page) - 1) * Number(per_page);
  const totalPages = Math.ceil(totalItemsLength / Number(per_page));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[150px]">ID</TableHead>
          <TableHead className="min-w-[200px]">{t('users.table.name')}</TableHead>
          <TableHead className="min-w-[250px]">{t('users.table.email')}</TableHead>
          <TableHead className="min-w-[150px]">{t('users.table.role')}</TableHead>
          <TableHead className="min-w-[150px]">{t('users.table.photo')}</TableHead>
          <TableHead className="min-w-[150px] text-center">{t('users.table.totalTasks')}</TableHead>
          <TableHead className="text-right">{t('common.actions.title')}</TableHead>
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
                admin: t('users.roles.admin'),
                worker: t('users.roles.worker'),
                user: t('users.roles.user'),
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
                // @ts-expect-error - deleteAction prop type mismatch with DeleteButton component
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
