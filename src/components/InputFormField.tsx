"use client";

import { type ReactElement, memo } from "react";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "@/components/ui/textarea";
import { TbPhotoCirclePlus } from "react-icons/tb";
import type {
  Control,
  FieldErrors,
  FieldValues,
  Path,
  ControllerRenderProps,
} from "react-hook-form";

interface InputFormFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>;
  name: Path<TFieldValues>;
  id: string;
  placeholder?: string;
  label: string;
  errors?: FieldErrors<TFieldValues>;
  type?: string;
  onChange?: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  imageSrc?: string;
  isImageField?: boolean; // To determine if it's an image field
  rows?: number; // Optional for Textarea size
  isTextarea?: boolean; // render textarea instead of input
}

const InputFormField = <TFieldValues extends FieldValues = FieldValues>({
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
  isTextarea = false,
}: InputFormFieldProps<TFieldValues>): ReactElement => {

  // Render Textarea if the field is of type "description" or if specified
  const renderTextarea = (
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>,
  ) => (
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
  const renderInput = (
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>,
  ) => (
    <Input key={id + name} id={id} placeholder={placeholder} type={type} {...field} />
  );

  // Render the image input for profile image field
  const renderImageInput = (
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>,
  ) => (
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
              if (onChange) {
                onChange(event);
              }
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
            {isTextarea ? renderTextarea(field) : renderInput(field)}
          </FormControl>
          <FormMessage className="empty:hidden mt-0">
            {errors?.[name]?.message}
          </FormMessage>
        </FormItem>
      );
    }} />
  );
};

export default memo(InputFormField);

