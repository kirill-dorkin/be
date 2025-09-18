"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
  className?: string
  id?: string
}

const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ className, checked = false, onCheckedChange, disabled = false, id, ...props }, ref) => {
    const handleClick = () => {
      if (!disabled && onCheckedChange) {
        onCheckedChange(!checked)
      }
    }

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === ' ' || event.key === 'Enter') {
        event.preventDefault()
        handleClick()
      }
    }

    return (
      <button
        ref={ref}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        id={id}
        className={cn(
          "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          checked
            ? "bg-primary text-primary-foreground"
            : "bg-background hover:bg-accent hover:text-accent-foreground",
          className
        )}
        {...props}
      >
        {checked && (
          <Check className="h-4 w-4" />
        )}
      </button>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }