"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";

interface IDashboardSummaryItem {
  item: {
    icon: JSX.Element,
    label: string,
    value: number
  }
}

export default function DashboardSummaryItem({ item }: IDashboardSummaryItem) {
  return (
    <li className="text-left w-full bg-secondary rounded-lg">
      <Card className="bg-background shadow">
        <CardHeader>
          <CardTitle className="text-xl text-muted-foreground mt-0 flex gap-4 items-center">
            <span className="bg-secondary text-xl p-3 rounded-lg">
              {item.icon}
            </span>
            {item.label}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <h4 className="m-0 text-primary text-xl">{item.value}</h4>
        </CardContent>
      </Card>
    </li>
  )
}
