import { Inter, JetBrains_Mono } from "next/font/google";
import localFont from "next/font/local";

// Основной шрифт с оптимизацией
export const inter = Inter({
  subsets: ["latin", "cyrillic"],
  display: "swap", // Улучшает CLS и предотвращает FOIT
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system", 
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif"
  ],
  variable: "--font-inter",
  adjustFontFallback: true, // Автоматическая настройка fallback метрик
  weight: ["400", "500", "600", "700"], // Только нужные веса
});

// Моноширинный шрифт для кода
export const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "cyrillic"],
  display: "optional", // Более агрессивная оптимизация для некритичного шрифта
  preload: false, // Загружается только при необходимости
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace"
  ],
  variable: "--font-jetbrains-mono",
  adjustFontFallback: true,
  weight: ["400", "500"], // Только базовые веса
});

// Локальный шрифт для заголовков (если есть)
export const headingFont = localFont({
  src: [
    {
      path: "../assets/fonts/heading-regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../assets/fonts/heading-medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../assets/fonts/heading-semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../assets/fonts/heading-bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  display: "swap",
  preload: true,
  fallback: [
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif"
  ],
  variable: "--font-heading",
  adjustFontFallback: false,
});

// CSS переменные для использования в Tailwind
export const fontVariables = `
  ${inter.variable}
  ${jetbrainsMono.variable}
  ${headingFont.variable}
`;

// Preload критических шрифтов
export const fontPreloadLinks = [
  {
    rel: "preload",
    href: "/_next/static/media/inter-latin.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
  {
    rel: "preload", 
    href: "/_next/static/media/inter-cyrillic.woff2",
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  },
] as const;

// Функция для оптимизации загрузки шрифтов
export function optimizeFontLoading() {
  if (typeof window !== "undefined") {
    // Предзагрузка критических шрифтов
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "font";
    link.type = "font/woff2";
    link.crossOrigin = "anonymous";
    
    // Добавляем font-display: swap через CSS
    const style = document.createElement("style");
    style.textContent = `
      @font-face {
        font-family: 'Inter';
        font-display: swap;
      }
      @font-face {
        font-family: 'JetBrains Mono';
        font-display: swap;
      }
    `;
    document.head.appendChild(style);
  }
}