'use client'

import { useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import InputFormField from '@/components/InputFormField'
import { Button } from '@/components/ui/button'
import addTaskAction from '@/actions/dashboard/addTaskAction'
import useCustomToast from '@/hooks/useCustomToast'
import { ITask } from '@/models/Task'

const phoneValidation = new RegExp(/^(?:\+62|62|0)[2-9]\d{7,11}$/)
const serialNumberValidation = new RegExp(/^[A-Z0-9]{2,}-?[A-Z0-9]{2,}$/i)

const TaskSchema = z.object({
  description: z
    .string()
    .min(1, { message: 'Description is required' })
    .max(255, { message: 'Description cannot exceed 255 characters' }),
  customerName: z
    .string()
    .min(1, { message: 'Customer name is required' })
    .max(100, { message: 'Customer name cannot exceed 100 characters' }),
  customerPhone: z
    .string()
    .min(1, { message: 'Customer phone is required' })
    .regex(phoneValidation, { message: 'Invalid phone number' }),
  serialNumber: z
    .string()
    .min(1, { message: 'Serial number is required' })
    .regex(serialNumberValidation, { message: 'Invalid serial number format' }),
  laptopBrand: z
    .string()
    .min(1, { message: 'Laptop brand is required' })
    .max(100, { message: 'Laptop brand cannot exceed 100 characters' }),
  laptopModel: z
    .string()
    .min(1, { message: 'Laptop model is required' })
    .max(100, { message: 'Laptop model cannot exceed 100 characters' }),
  totalCost: z
    .string()
    .transform((value) => parseFloat(value))
    .refine((value) => !isNaN(value) && value >= 0, {
      message: 'Total cost must be a positive number',
    }),
})

export default function RequestForm() {
  const [loading, setLoading] = useState(false)
  const { showSuccessToast, showErrorToast } = useCustomToast()

  const methods = useForm<ITask>({
    resolver: zodResolver(TaskSchema),
    defaultValues: {
      description: '',
      customerName: '',
      customerPhone: '',
      serialNumber: '',
      laptopBrand: '',
      laptopModel: '',
      totalCost: 0,
    },
    mode: 'onChange',
  })

  const { control, handleSubmit, formState: { errors }, reset } = methods

  const handleSubmitAction = async (data: ITask) => {
    setLoading(true)
    try {
      const response = await addTaskAction(data)

      if (response.status === 'error') {
        showErrorToast({ title: 'Error', description: response.message })
      } else {
        showSuccessToast({
          title: 'Success',
          description: response.message,
        })
        reset()
      }
    } catch (error) {
      showErrorToast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      })
    } finally {
      setLoading(false)
    }
  }

  const taskFields = [
    { name: 'description', label: 'Description', type: 'text' },
    { name: 'customerName', label: 'Customer Name', type: 'text' },
    { name: 'customerPhone', label: 'Customer Phone', type: 'text' },
    { name: 'serialNumber', label: 'Serial Number', type: 'text' },
    { name: 'laptopBrand', label: 'Laptop Brand', type: 'text' },
    { name: 'laptopModel', label: 'Laptop Model', type: 'text' },
    { name: 'totalCost', label: 'Estimated Cost', type: 'number' },
  ]

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSubmitAction)} className='space-y-4 w-full max-w-lg'>
        {taskFields.map((field) => (
          <InputFormField
            key={field.name}
            control={control}
            name={field.name as keyof ITask}
            id={field.name}
            label={field.label}
            errors={errors}
            type={field.type}
          />
        ))}
        <Button type='submit' disabled={loading} className='w-full'>
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </FormProvider>
  )
}
