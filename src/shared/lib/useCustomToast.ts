import { useToast } from "@/shared/lib/use-toast";

type ToastOptions = {
  title: string;
  description: string;
};

const useCustomToast = () => {
  const { toast } = useToast();

  const showSuccessToast = ({ title, description }: ToastOptions) => {
    toast({
      title,
      description,
    });
  };

  const showErrorToast = ({ title, description }: ToastOptions) => {
    toast({
      title,
      description,
      variant: "destructive"
    });
  };

  return { showSuccessToast, showErrorToast };
};

export default useCustomToast;
