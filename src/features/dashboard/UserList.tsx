import { type ReactElement } from "react";
import { CardDescription } from "@/shared/ui/card";
import { AvatarImage } from "@/shared/ui/OptimizedImage";
import { IUser } from "@/entities/user/User";

export interface UserListProps {
  users: IUser[];
}

export default function UserList({ users }: UserListProps): ReactElement {
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
                <AvatarImage
                  className="aspect-square"
                  src={worker.image}
                  alt={worker.name}
                  width={54}
                  height={54}
                  priority={false}
                  sizes="54px"
                />
                <div className="space-y-1">
                  <h5 className="text-lg font-medium text-foreground m-0">
                    {worker.name}
                  </h5>
                  <p className="text-sm text-muted-foreground m-0">
                    Всего задач: {worker?.tasks?.length}
                  </p>
                </div>
              </div>
            </li>
          ))
        ) : (
          <CardDescription className="text-center">Сотрудники не найдены.</CardDescription>
        )}
      </ul>
    </div>
  );
}
