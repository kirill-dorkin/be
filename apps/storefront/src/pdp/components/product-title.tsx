import { Skeleton } from "@nimara/ui/components/skeleton";

import { formatProductName } from "@/lib/format-product-name";

type ProductTitleProps = {
  className?: string;
  title: string;
};

export const ProductTitle = ({ title, className }: ProductTitleProps) => {
  return (
    <h1
      className={`text-foreground max-w-full break-words text-left text-2xl font-bold leading-tight tracking-tight md:text-3xl md:leading-tight lg:text-4xl ${className}`}
      style={{
        wordBreak: "break-word",
        overflowWrap: "break-word",
        hyphens: "auto",
      }}
    >
      {formatProductName(title)}
    </h1>
  );
};

export const ProductTitleSkeleton = () => {
  return <Skeleton className="mb-4 h-8 w-3/4" />;
};
