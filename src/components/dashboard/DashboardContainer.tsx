import { ReactNode, type ReactElement } from "react";

export interface DashboardContainerProps {
  children: ReactNode;
  className?: string;
}

export default function DashboardContainer({
  children,
  className = "",
}: DashboardContainerProps): ReactElement {
  return (
    <section
      className={`w-full max-h-[calc(100vh-80px)] py-12 px-10 overflow-y-auto sm:px-6 md:px-8 lg:px-10 xl:px-12 ${className}`}
    >
      {children}
    </section>
  );
}
