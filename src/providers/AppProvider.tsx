"use client";

import { ReactNode, ReactElement, useState, createContext } from "react";
import { AppContextTypes } from "@/types/AppContextTypes"

export const AppContext = createContext<AppContextTypes | null>(null);

export interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({
  children,
}: AppProviderProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
  };

  const contextValues: AppContextTypes = {
    isExpanded, setIsExpanded, toggleSidebar
  };

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
}

