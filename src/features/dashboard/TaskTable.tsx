"use client";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { memo, useMemo } from "react";
import { deleteTaskAction } from "@/shared/api/dashboard/deleteTaskAction";
import { ITask } from "@/entities/task/Task";
import DeleteButton from "@/features/dashboard/buttons/DeleteButton";
import ViewButton from "@/features/dashboard/buttons/ViewButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import PaginationControls from "./PaginationControls";
import UpdateStatusSelect from "@/features/dashboard/buttons/UpdateStatusSelect";

interface TaskTableProps {
  items: ITask[] | undefined;
  totalItemsLength: number;
  page: number;
  per_page: number;
}

// Мемоизированный компонент строки таблицы
const TaskTableRow = memo(({ 
  task, 
  role, 
  hideActions
}: { 
  task: ITask; 
  role?: string; 
  hideActions: boolean; 
}) => {
  const taskId = task._id?.toString() || '';

  return (
    <TableRow className="hover:bg-muted/50 transition-colors">
      <TableCell className="font-medium">{task.description}</TableCell>
      <TableCell>{task.customerName}</TableCell>
      <TableCell>{task.customerPhone}</TableCell>
      <TableCell>{task.laptopBrand}</TableCell>
      <TableCell>{task.laptopModel}</TableCell>
      <TableCell>
        {role === "worker" ? (
          <UpdateStatusSelect taskId={taskId} currentStatus={task.status} />
        ) : (
          <span>{task.status === 'Pending' ? 'В ожидании' : task.status === 'In Progress' ? 'В процессе' : task.status === 'Completed' ? 'Завершено' : task.status}</span>
        )}
      </TableCell>
      <TableCell className={role === "admin" && !hideActions ? "" : "text-right"}>
        {task.totalCost} ₽
      </TableCell>
      {role === "admin" && !hideActions && (
        <TableCell className="text-right">
          <div className="flex gap-2 justify-end">
            <ViewButton href={`/admin/tasks/${taskId}`} />
            <DeleteButton
              id={taskId}
              action={deleteTaskAction}
            />
          </div>
        </TableCell>
      )}
    </TableRow>
  );
});

TaskTableRow.displayName = "TaskTableRow";

const TaskTable = memo(function TaskTable({
  items,
  totalItemsLength,
  page,
  per_page
}: TaskTableProps) {
  const start = useMemo(() => (page - 1) * per_page, [page, per_page]);
  const { data: session } = useSession();
  const pathname = usePathname();

  const role = session?.user?.role;
  const hideActions = pathname === "/admin/dashboard";

  // Мемоизируем вычисления
  const tableData = useMemo(() => ({
    start,
    role,
    hideActions
  }), [start, role, hideActions]);

  // Мемоизируем отрендеренные строки
  const renderedRows = useMemo(() => {
    if (!Array.isArray(items)) {
      console.warn('TaskTable: items is not an array:', items);
      return [];
    }
    return items.map((task, index) => (
      <TaskTableRow
        key={task._id?.toString() || `task-${index}`}
        task={task}
        role={tableData.role}
        hideActions={tableData.hideActions}
      />
    ));
  }, [items, tableData.role, tableData.hideActions]);

  return (
    <div className="space-y-4">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="min-w-[150px] font-semibold">Описание</TableHead>
              <TableHead className="min-w-[150px] font-semibold">Имя клиента</TableHead>
              <TableHead className="min-w-[150px] font-semibold">Телефон клиента</TableHead>
              <TableHead className="min-w-[100px] font-semibold">Бренд</TableHead>
              <TableHead className="min-w-[150px] font-semibold">Модель</TableHead>
              <TableHead className="min-w-[120px] font-semibold">Статус</TableHead>
              <TableHead className={tableData.role === "admin" && !tableData.hideActions ? "font-semibold" : "text-right font-semibold"}>
                Стоимость
              </TableHead>
              {tableData.role === "admin" && !tableData.hideActions && (
                <TableHead className="text-right font-semibold">Действия</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {!Array.isArray(items) || items.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={tableData.role === "admin" && !tableData.hideActions ? 8 : 7} 
                  className="text-center py-8 text-muted-foreground"
                >
                  Задачи не найдены
                </TableCell>
              </TableRow>
            ) : (
              renderedRows
            )}
          </TableBody>
        </Table>
      </div>
      
      <PaginationControls
        hasNextPage={tableData.start + per_page < totalItemsLength}
        hasPrevPage={tableData.start > 0}
        totalItemsLength={totalItemsLength}
      />
    </div>
  );
});

export default TaskTable;
