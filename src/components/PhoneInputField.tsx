'use client'

import PhoneInput, { type Country } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
import { Input } from '@/components/ui/input'
import React from 'react'
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import { Control, FieldValues, Path } from 'react-hook-form'

interface PhoneInputFieldProps<TFieldValues extends FieldValues = FieldValues> {
  control: Control<TFieldValues>
  name: Path<TFieldValues>
  label: string
  defaultCountry?: string
}

const PhoneInputField = <TFieldValues extends FieldValues = FieldValues>({
  control,
  name,
  label,
  defaultCountry,
}: PhoneInputFieldProps<TFieldValues>) => {
  const InputComponent = React.forwardRef<HTMLInputElement, any>((props, ref) => (
    <Input ref={ref} {...props} className="flex-1 bg-transparent outline-none" />
  ))
  InputComponent.displayName = 'PhoneInputCustomInput'
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <PhoneInput
              {...field}
              defaultCountry={defaultCountry as Country | undefined}
              onChange={field.onChange}
              className="phone-input"
              inputComponent={InputComponent}
              limitMaxLength
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default PhoneInputField
