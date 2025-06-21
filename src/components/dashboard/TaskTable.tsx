"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { ITask } from "@/models/Task";
import DeleteButton from "@/components/dashboard/buttons/DeleteButton";
import ViewButton from "@/components/dashboard/buttons/ViewButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PaginationControls from "./PaginationControls";
import UpdateStatusSelect from "@/components/dashboard/buttons/UpdateStatusSelect";

export default function TaskTable({
  items,
  totalItemsLength,
  page,
  per_page,
  deleteAction
}: {
  items: ITask[];
  totalItemsLength: number;
  page: string | string[];
  per_page: string | string[];
  deleteAction?: (id: string) => void
}) {
  const start = (Number(page) - 1) * Number(per_page);
  const totalPages = Math.ceil(totalItemsLength / Number(per_page));
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = session?.user?.role;
  const hideActions = pathname === "/admin/dashboard";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="min-w-[150px]">Task Description</TableHead>
          <TableHead className="min-w-[150px]">Customer Name</TableHead>
          <TableHead className="min-w-[150px]">Customer Phone</TableHead>
          <TableHead className="min-w-[100px]">Brand</TableHead>
          <TableHead className="min-w-[150px]">Model</TableHead>
          <TableHead className="min-w-[120px]">Status</TableHead>
          <TableHead className={role === "admin" && !hideActions ? "" : "text-right"}>Cost</TableHead>
          {(role === "admin" || role === "worker") && !hideActions && (
            <TableHead className="text-right">Actions</TableHead>
          )}
        </TableRow>
      </TableHeader>
      <TableBody>
        {items?.map(
          ({
            description,
            customerName,
            customerPhone,
            status,
            laptopBrand,
            laptopModel,
            _id,
            totalCost,
          }) => (
            <TableRow key={_id?.toString() as string}>
              <TableCell>{description}</TableCell>
              <TableCell>{customerName}</TableCell>
              <TableCell>{customerPhone}</TableCell>
              <TableCell>{laptopBrand}</TableCell>
              <TableCell>{laptopModel}</TableCell>
              <TableCell
                className={
                  status === "Completed"
                    ? "text-green-500"
                    : status === "In Progress"
                      ? "text-yellow-500"
                      : "text-red-500"
                }
              >
                {status}
              </TableCell>
              <TableCell className={role === "admin" && !hideActions ? "" : "text-right"}>
                ${totalCost}
              </TableCell>
              {(role === "admin" || role === "worker") && !hideActions && (
                <TableCell className="flex gap-2 justify-end">
                  {role === "admin" ? (
                    <DeleteButton
                      // @ts-ignore
                      action={deleteAction}
                      id={_id as unknown as string}
                    />
                  ) : role === "worker" ? (
                    <UpdateStatusSelect taskId={_id as unknown as string} />
                  ) : null}
                  <ViewButton href={`/admin/tasks/${_id?.toString()}`}/>
                </TableCell>
              )}
            </TableRow>
          )
        )}
        <TableRow>
          <TableCell
            className="bg-background text-muted-foreground pb-0"
            colSpan={4}
          >
            Total Items: {totalItemsLength}
          </TableCell>
          <TableCell
            className="bg-background pb-0"
            colSpan={(role === "admin" || role === "worker") && !hideActions ? 5 : 4}
          >
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
