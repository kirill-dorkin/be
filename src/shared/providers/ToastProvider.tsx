"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Настройки по умолчанию для всех тостов
        duration: 4000,
        style: {
          background: "#363636",
          color: "#fff",
          fontSize: "14px",
          borderRadius: "8px",
          padding: "12px 16px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        },
        // Настройки для успешных тостов
        success: {
          duration: 3000,
          style: {
            background: "#10b981",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#10b981",
          },
        },
        // Настройки для ошибок
        error: {
          duration: 5000,
          style: {
            background: "#ef4444",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#ef4444",
          },
        },
        // Настройки для загрузки
        loading: {
          style: {
            background: "#3b82f6",
            color: "#fff",
          },
          iconTheme: {
            primary: "#fff",
            secondary: "#3b82f6",
          },
        },
      }}
    />
  );
}