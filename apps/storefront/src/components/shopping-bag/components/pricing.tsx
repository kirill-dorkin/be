import { type PropsWithChildren } from "react";

export const Pricing = ({ children }: PropsWithChildren) => (
  <div className="flex flex-col gap-3 rounded-lg bg-muted/30 p-4 sm:gap-4">{children}</div>
);
