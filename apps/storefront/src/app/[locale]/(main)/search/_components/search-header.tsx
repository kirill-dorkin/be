"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { type ViewMode, ViewToggle } from "@/components/view-toggle";
import { getStoredViewMode, setStoredViewMode } from "@/lib/view-mode-storage";

type ViewModeContextType = {
  setViewMode: (mode: ViewMode) => void;
  viewMode: ViewMode;
};

const ViewModeContext = createContext<ViewModeContextType | null>(null);

type ViewModeProviderProps = {
  children: React.ReactNode;
  defaultView?: ViewMode;
};

export function ViewModeProvider({
  children,
  defaultView = "compact",
}: ViewModeProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(defaultView);
  const [isInitialized, setIsInitialized] = useState(false);

  // Инициализация из localStorage после монтирования
  useEffect(() => {
    const saved = getStoredViewMode();

    setViewMode(saved);
    setIsInitialized(true);
  }, []);

  // Сохранение в localStorage при изменении
  useEffect(() => {
    if (isInitialized) {
      setStoredViewMode(viewMode);
    }
  }, [viewMode, isInitialized]);

  return (
    <ViewModeContext.Provider value={{ setViewMode, viewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);

  if (!context) {
    throw new Error("useViewMode must be used within ViewModeProvider");
  }

  return context;
}

export function ViewToggleControl() {
  const { setViewMode, viewMode } = useViewMode();

  return <ViewToggle currentView={viewMode} onViewChange={setViewMode} />;
}
