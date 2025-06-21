"use client";
import { IService } from "@/models/Service";
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

export default function ServiceTable({
  items,
  totalItemsLength,
  page,
  per_page,
  deleteAction,
}: {
  items: IService[];
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
          <TableHead className="min-w-[150px]">Category</TableHead>
          <TableHead className="min-w-[200px]">Name</TableHead>
          <TableHead className="min-w-[100px]">Cost</TableHead>
          <TableHead className="min-w-[150px]">Duration</TableHead>
          <TableHead className="text-right">Actions</TableHead>
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
              <DeleteButton action={deleteAction} id={_id as string} />
            </TableCell>
          </TableRow>
        ))}
        <TableRow>
          <TableCell className="bg-background text-muted-foreground pb-0" colSpan={4}>
            Total Items: {totalItemsLength}
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
