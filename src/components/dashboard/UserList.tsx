'use client';

import { type ReactElement } from "react";
import { useTranslations } from 'next-intl';
import { CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { IUser } from "@/models/User";

export interface UserListProps {
  users: IUser[];
}

export default function UserList({ users }: UserListProps): ReactElement {
  const t = useTranslations();
  const workers = users.filter((user) => user.role === "worker");

  return (
    <div>
      <ul className="space-y-4 mt-2">
        {workers?.length ? (
          workers.map((worker, index) => (
            <li
              key={index}
              className="flex items-center justify-between gap-4 p-2"
            >
              <div className="flex items-center gap-4">
                <Image
                  className="aspect-square rounded-full"
                  src={worker.image}
                  alt={worker.name}
                  width={54}
                  height={54}
                />
                <div className="space-y-1">
                  <h5 className="text-lg font-medium text-foreground m-0">
                    {worker.name}
                  </h5>
                  <p className="text-sm text-muted-foreground m-0">
                    {t('dashboard.employeeList.totalTasks')}: {worker?.tasks?.length}
                  </p>
                </div>
              </div>
            </li>
          ))
        ) : (
          <CardDescription className="text-center">{t('dashboard.employeeList.noEmployeesFound')}</CardDescription>
        )}
      </ul>
    </div>
  );
}
