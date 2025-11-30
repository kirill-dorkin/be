"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown, ChevronUp } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

const Select = SelectPrimitive.Root;

const SelectGroup = SelectPrimitive.Group;

const SelectValue = SelectPrimitive.Value;

const SelectTrigger = ({
  className,
  children,
  error = false,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  error?: boolean;
}) => {
  return (
    <SelectPrimitive.Trigger
      className={cn(
        "border-input bg-background hover:border-border/80 flex h-10 w-full items-center justify-center rounded-md border px-3 py-2 text-sm outline-none transition-all duration-500 ease-in-out disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        error &&
          "border-red-500 bg-red-50 has-[input:focus-visible]:ring-red-300 dark:border-red-500 dark:bg-red-900/30 dark:has-[input:focus-visible]:ring-red-500",
        className,
      )}
      {...props}
    >
      {children}
    </SelectPrimitive.Trigger>
  );
};

SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;

const SelectScrollUpButton = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) => (
  <SelectPrimitive.ScrollUpButton
    className={cn(
      "text-muted-foreground flex cursor-default items-center justify-center py-1 transition-opacity duration-150 hover:opacity-70",
      className,
    )}
    {...props}
  >
    <ChevronUp className="h-3.5 w-3.5" />
  </SelectPrimitive.ScrollUpButton>
);

SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;

const SelectScrollDownButton = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) => (
  <SelectPrimitive.ScrollDownButton
    className={cn(
      "text-muted-foreground flex cursor-default items-center justify-center py-1 transition-opacity duration-150 hover:opacity-70",
      className,
    )}
    {...props}
  >
    <ChevronDown className="h-3.5 w-3.5" />
  </SelectPrimitive.ScrollDownButton>
);

SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName;

const SelectContent = ({
  className,
  children,
  position = "popper",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      className={cn(
        "bg-popover text-popover-foreground border-border/60 relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border shadow-xl dark:border-white/10 dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)]",
        "data-[state=open]:animate-in data-[state=closed]:animate-out",
        "data-[side=bottom]:data-[state=open]:animate-[select-slide-down_0.25s_ease-out]",
        "data-[side=bottom]:data-[state=closed]:animate-[select-slide-down-close_0.25s_ease-out]",
        "data-[side=top]:data-[state=open]:animate-[select-slide-up_0.25s_ease-out]",
        "data-[side=top]:data-[state=closed]:animate-[select-slide-up-close_0.25s_ease-out]",
        position === "popper" &&
          "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className,
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]",
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
);

SelectContent.displayName = SelectPrimitive.Content.displayName;

const SelectLabel = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) => (
  <SelectPrimitive.Label
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)}
    {...props}
  />
);

SelectLabel.displayName = SelectPrimitive.Label.displayName;

const SelectItem = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) => (
  <SelectPrimitive.Item
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-2 text-sm outline-none transition-colors duration-150",
      "hover:bg-muted/60 dark:hover:bg-muted/40",
      "data-[state=checked]:bg-transparent",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "focus:bg-transparent",
      className,
    )}
    {...props}
  >
    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <Check className="text-primary h-3.5 w-3.5" />
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText className="font-medium">
      {children}
    </SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
);

SelectItem.displayName = SelectPrimitive.Item.displayName;

const SelectSeparator = ({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) => (
  <SelectPrimitive.Separator
    className={cn("bg-muted -mx-1 my-1 h-px", className)}
    {...props}
  />
);

SelectSeparator.displayName = SelectPrimitive.Separator.displayName;

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
};
