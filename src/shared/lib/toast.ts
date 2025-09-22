import toast from "react-hot-toast";

export const showToast = {
  success: (message: string) => {
    toast.success(message);
  },
  
  error: (message: string) => {
    toast.error(message);
  },
  
  loading: (message: string) => {
    return toast.loading(message);
  },
  
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, messages);
  },
  
  dismiss: (toastId?: string) => {
    toast.dismiss(toastId);
  },
  
  // Специальные методы для частых случаев
  validation: (message: string) => {
    toast.error(`Ошибка валидации: ${message}`);
  },
  
  network: (message?: string) => {
    toast.error(message || "Ошибка сети. Проверьте подключение к интернету.");
  },
  
  server: (message?: string) => {
    toast.error(message || "Ошибка сервера. Попробуйте позже.");
  },
  
  unauthorized: () => {
    toast.error("Недостаточно прав для выполнения операции.");
  },
  
  notFound: (resource?: string) => {
    toast.error(`${resource || "Ресурс"} не найден.`);
  },
  
  saved: (resource?: string) => {
    toast.success(`${resource || "Данные"} успешно сохранены.`);
  },
  
  deleted: (resource?: string) => {
    toast.success(`${resource || "Элемент"} успешно удален.`);
  },
  
  updated: (resource?: string) => {
    toast.success(`${resource || "Данные"} успешно обновлены.`);
  },
  
  created: (resource?: string) => {
    toast.success(`${resource || "Элемент"} успешно создан.`);
  }
};

// Экспорт оригинального toast для продвинутого использования
export { toast };
export default showToast;