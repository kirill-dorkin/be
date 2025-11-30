import { RichText } from "@nimara/ui/components/rich-text/rich-text";

export const ProductDescription = ({
  description,
}: {
  description: string;
}) => {
  return (
    <div>
      <h2 className="dark:text-primary mb-4 text-xl text-slate-700">
        Description
      </h2>
      <RichText className="text-foreground" contentData={description} />
    </div>
  );
};
