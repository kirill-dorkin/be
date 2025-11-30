import { type PropsWithChildren } from "react";

export const Pricing = ({ children }: PropsWithChildren) => (
  <div className="bg-muted/30 flex flex-col gap-3 rounded-lg p-4 sm:gap-4">
    {children}
  </div>
);
