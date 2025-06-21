"use client";

import { type ReactElement, memo } from "react";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/ui/textarea";
import { TbPhotoCirclePlus } from "react-icons/tb";

interface InputFormFieldProps {
  control: any;
  name: string;
  id: string;
  placeholder?: string;
  label: string;
  errors: any;
  type?: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  imageSrc?: string;
  isImageField?: boolean; // To determine if it's an image field
  rows?: number; // Optional for Textarea size
}

const InputFormField = ({
  control,
  name,
  id,
  placeholder,
  label,
  errors,
  type = "text",
  onChange,
  imageSrc,
  isImageField = false, // Default is false, meaning it's a regular field
  rows = 4, // Default textarea size
}: InputFormFieldProps): ReactElement => {

  // Render Textarea if the field is of type "description" or if specified
  const renderTextarea = (field: any) => (
    <Textarea
      key={id + name}
      id={id}
      placeholder={placeholder}
      className="resize-none"
      rows={rows}
      {...field}
    />
  );

  // Render regular Input field
  const renderInput = (field: any) => (
    <Input key={id + name} id={id} placeholder={placeholder} type={type} {...field} />
  );

  // Render the image input for profile image field
  const renderImageInput = (field: any) => (
    <FormItem className="col-span-2">
      <Label
        htmlFor={id}
        className="flex cursor-pointer items-center justify-center mx-auto size-36 shadow rounded-full bg-secondary"
      >
        {!imageSrc ? (
          <TbPhotoCirclePlus className="size-full p-6 text-secondary-foreground" />
        ) : (
          <Avatar className="size-full">
            <AvatarImage src={imageSrc} />
          </Avatar>
        )}
      </Label>
      <FormControl>
        <Input
          key={id + name}
          id={id}
          placeholder={placeholder}
          type="file"
          className="opacity-0 size-0 absolute"
          accept="image/*"
          onChange={(event) => {
            field.onChange(event?.target?.files ? event.target.files[0] : null);
            onChange && onChange(event);
          }}
          onBlur={field.onBlur}
          name={field.name}
          ref={field.ref}
        />
      </FormControl>
    </FormItem>
  );

  // Render the correct form element based on the field type (image, textarea, or regular input)
  return (
    <FormField control={control} name={name} render={({ field }) => {
      if (isImageField) {
        return renderImageInput(field); // If it's an image field
      }

      // Otherwise, render as regular text input or textarea
      return (
        <FormItem>
          <Label htmlFor={id}>{label}</Label>
          <FormControl>
            {field.name === "description1" ? renderTextarea(field) : renderInput(field)}
          </FormControl>
          <FormMessage className="empty:hidden mt-0">
            {errors[name]?.message}
          </FormMessage>
        </FormItem>
      );
    }} />
  );
};

export default memo(InputFormField);

