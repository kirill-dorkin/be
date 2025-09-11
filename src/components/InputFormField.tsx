"use client";

import { type ReactElement, memo } from "react";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
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
  errors: _errors,
  type = "text",
  onChange,
  imageSrc,
  isImageField = false, // Default is false, meaning it's a regular field
  rows = 4, // Default textarea size
  isTextarea = false,
}: InputFormFieldProps<TFieldValues>): ReactElement => {
  void _errors;

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
      onChange={(event) => {
        if (onChange) {
          onChange(event)
        }
        field.onChange(event)
      }}
    />
  );

  // Render regular Input field
  const renderInput = (
    field: ControllerRenderProps<TFieldValues, Path<TFieldValues>>,
  ) => (
    <Input
      key={id + name}
      id={id}
      placeholder={placeholder}
      type={type}
      {...field}
      onChange={(event) => {
        if (onChange) {
          onChange(event)
        }
        field.onChange(event)
      }}
    />
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
              if (onChange) {
                onChange(event);
              }
              field.onChange(event?.target?.files ? event.target.files[0] : null);
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
        </FormItem>
      );
    }} />
  );
};

export default memo(InputFormField) as typeof InputFormField;

