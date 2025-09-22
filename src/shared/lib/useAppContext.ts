"use client";

import { useContextSelector } from "use-context-selector";
import { AppContext } from "@/providers/AppProvider";

export default function useAppContext() {
  const context = useContextSelector(AppContext, (state) => state);

  if (!context) {
    throw new Error("useAppContext must be used within an AppProvider");
  }

  return context;
}

