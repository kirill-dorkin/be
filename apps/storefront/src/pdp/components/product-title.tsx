import { Skeleton } from "@nimara/ui/components/skeleton";

import { formatProductName } from "@/lib/format-product-name";

type ProductTitleProps = {
  className?: string;
  title: string;
};

export const ProductTitle = ({ title, className }: ProductTitleProps) => {
  return (
    <h1
      className={`text-foreground text-left text-2xl font-bold leading-tight tracking-tight break-words max-w-full md:text-3xl lg:text-4xl md:leading-tight ${className}`}
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
