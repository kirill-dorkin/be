import { type ReactElement } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TaskTable from "./TaskTable";
import SelectShowing from "./SelectShowing";
import { ITask } from "@/models/Task";

export interface TaskReportProps {
  items: ITask[];
  totalItemsLength: number;
  page: string | string[];
  per_page: string | string[];
}

export default function TaskReport({
  items,
  totalItemsLength,
  page,
  per_page,
}: TaskReportProps): ReactElement {
  return (
    <Card className="bg-background shadow">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <span className="flex flex-col gap-2">
          <CardTitle className="my-0">Отчет о задачах</CardTitle>
          <CardDescription className="mt-1.5 sm:mt-0">
            Сводка текущих задач и их статусов
          </CardDescription>
        </span>
        <SelectShowing />
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <TaskTable
            page={page}
            per_page={per_page}
            items={items}
            totalItemsLength={totalItemsLength}
          />
        </div>
      </CardContent>
    </Card>
  );
}
