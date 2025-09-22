"use client";
import { IDevice } from "@/entities/device/Device";
import DeleteButton from "@/features/dashboard/buttons/DeleteButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import PaginationControls from "./PaginationControls";

export default function DeviceTable({
  items,
  totalItemsLength,
  page,
  per_page,
  deleteAction,
}: {
  items: IDevice[];
  totalItemsLength: number;
  page: string | string[];
  per_page: string | string[];
  deleteAction: (id: string) => Promise<{ message: string; status: string }>;
}) {
  const start = (Number(page) - 1) * Number(per_page);
  const totalPages = Math.ceil(totalItemsLength / Number(per_page));

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[150px]">Категория</TableHead>
          <TableHead className="min-w-[150px]">Бренд</TableHead>
          <TableHead className="min-w-[150px]">Модель</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.map(({ _id, category, brand, modelName }) => (
          <TableRow key={_id?.toString() || ''}>
            <TableCell>{typeof category === 'string' ? category : (category as unknown as { name: string })?.name}</TableCell>
            <TableCell>{brand}</TableCell>
            <TableCell>{modelName}</TableCell>
            <TableCell className="text-right">
              <DeleteButton action={deleteAction} id={_id?.toString() || ''} />
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="bg-background text-muted-foreground pb-0" colSpan={3}>
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
