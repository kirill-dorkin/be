"use client";

import { ReactNode, ReactElement, useState, useCallback, useMemo } from "react";
import { createContext } from "use-context-selector";
import { AppContextTypes } from "@/types/AppContextTypes"

export const AppContext = createContext<AppContextTypes | null>(null);

export interface AppProviderProps {
  children: ReactNode;
}

export default function AppProvider({
  children,
}: AppProviderProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const contextValues: AppContextTypes = useMemo(() => ({
    isExpanded, 
    setIsExpanded, 
    toggleSidebar
  }), [isExpanded, toggleSidebar]);

  return (
    <AppContext.Provider value={contextValues}>{children}</AppContext.Provider>
  );
}

