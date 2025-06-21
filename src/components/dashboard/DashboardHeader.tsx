import { ReactNode, type ReactElement } from "react";

export interface DashboardHeaderProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardHeader({
  children,
  className,
}: DashboardHeaderProps): ReactElement {
  return <div className={`pt-[12px] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 sm:gap-12 ${className}`}>{children}</div>;
}

