import { ReactNode, type ReactElement } from "react";

export interface DashboardContentProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardContent({
  children,
  className = "",
}: DashboardContentProps): ReactElement {
  return (
    <div className={`w-full mt-12 overflow-visible ${className}`}>
      {children}
    </div>
  );
}

