"use client";
import { Service } from "@/shared/types";
import DeleteButton from "@/features/dashboard/buttons/DeleteButton";
import { deleteServiceAction } from "@/shared/api/dashboard/deleteServiceAction";
import { EditServiceDialog } from "@/features/dashboard/dialogs/EditServiceDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import PaginationControls from "./PaginationControls";

export default function ServiceTable({
  items,
  totalItemsLength,
  page,
  per_page,
  deleteAction,
  onServiceUpdated,
}: {
  items: Service[];
  totalItemsLength: number;
  page: string | string[];
  per_page: string | string[];
  deleteAction: (id: string) => Promise<{ message: string; status: string }>;
  onServiceUpdated?: () => void;
}) {
  const start = (Number(page) - 1) * Number(per_page);
  const totalPages = Math.ceil(totalItemsLength / Number(per_page));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[150px]">Категория</TableHead>
          <TableHead className="min-w-[200px]">Название</TableHead>
          <TableHead className="min-w-[100px]">Стоимость</TableHead>
          <TableHead className="min-w-[150px]">Время выполнения</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.map(({ _id, category, name, cost, duration }) => (
          <TableRow key={_id?.toString() as string}>
            <TableCell>{typeof category === 'string' ? category : (category as any)?.name}</TableCell>
            <TableCell>{name}</TableCell>
            <TableCell>{cost} сом</TableCell>
            <TableCell>{duration}</TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <EditServiceDialog 
                  service={{ _id, category, name, cost, duration }} 
                  onServiceUpdated={onServiceUpdated}
                />
                <DeleteButton
                  id={_id as string}
                  action={deleteAction}
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="bg-background text-muted-foreground pb-0" colSpan={4}>
            Всего записей: {totalItemsLength}
          </TableCell>
          <TableCell className="bg-background pb-0" colSpan={1}>
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
