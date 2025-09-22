import { type ReactElement, ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export interface ListCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function ListCard({
  title,
  description,
  children,
}: ListCardProps): ReactElement {
  return (
    <Card className="bg-background shadow">
      <CardHeader>
        <CardTitle className="mt-0">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent
        className="max-h-[488px] overflow-y-auto [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
      >
        {children}
      </CardContent>
    </Card>
  );
}

