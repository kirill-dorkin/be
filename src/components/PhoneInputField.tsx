'use client'

import PhoneInput, { type Country } from 'react-phone-number-input'
import 'react-phone-number-input/style.css'
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
              className="border rounded px-3 py-2"
              international
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}

export default PhoneInputField
