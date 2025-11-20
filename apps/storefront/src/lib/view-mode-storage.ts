import { type ViewMode } from "@/components/view-toggle";

const STORAGE_KEY = "product-view-mode";
const DEFAULT_VIEW: ViewMode = "compact";

export function getStoredViewMode(): ViewMode {
  if (typeof window === "undefined") {
    return DEFAULT_VIEW;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "grid" || saved === "compact" || saved === "list") {
      return saved as ViewMode;
    }
  } catch {
    // localStorage может быть недоступен
  }

  return DEFAULT_VIEW;
}

export function setStoredViewMode(mode: ViewMode): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // localStorage может быть недоступен
  }
}

// Синхронное чтение для использования в рендере
export function getViewModeSync(): ViewMode {
  if (typeof window === "undefined") {
    return DEFAULT_VIEW;
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved === "grid" || saved === "compact" || saved === "list") {
      return saved as ViewMode;
    }
  } catch {
    // Игнорируем ошибки
  }

  return DEFAULT_VIEW;
}
