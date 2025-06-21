'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import InputFormField from '@/components/InputFormField'
import { Button } from '@/components/ui/button'
import addTaskAction from '@/actions/dashboard/addTaskAction'
import useCustomToast from '@/hooks/useCustomToast'
import { ITask } from '@/models/Task'
import getDevicesAction from '@/actions/dashboard/getDevicesAction'
import getServicesAction from '@/actions/dashboard/getServicesAction'
import { IDevice } from '@/models/Device'
import { IService } from '@/models/Service'

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
  const [devices, setDevices] = useState<IDevice[]>([])
  const [services, setServices] = useState<IService[]>([])

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

  useEffect(() => {
    getDevicesAction(1, 100).then((res) => {
      if (res.status === 'success') setDevices(res.items)
    })
    getServicesAction(1, 100).then((res) => {
      if (res.status === 'success') setServices(res.items)
    })
  }, [])

  const handleDeviceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const device = devices.find((d) => d._id?.toString() === e.target.value)
    if (device) {
      methods.setValue('laptopBrand', device.brand)
      methods.setValue('laptopModel', device.model || '')
    }
  }

  const handleServiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const service = services.find((s) => s._id?.toString() === e.target.value)
    if (service) {
      methods.setValue('totalCost', service.cost)
    }
  }

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

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleSubmitAction)} className="space-y-4 w-full max-w-lg">
        <InputFormField
          control={control}
          name="description"
          id="description"
          label="Problem Description"
          errors={errors}
          isTextarea
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm" htmlFor="device">Device</label>
          <select id="device" onChange={handleDeviceChange} className="border rounded px-3 py-2">
            <option value="">Select device</option>
            {devices.map((d) => (
              <option key={d._id?.toString()} value={d._id?.toString()}>
                {d.brand} {d.model}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm" htmlFor="service">Service</label>
          <select id="service" onChange={handleServiceChange} className="border rounded px-3 py-2">
            <option value="">Select service</option>
            {services.map((s) => (
              <option key={s._id?.toString()} value={s._id?.toString()}>
                {s.name} - ${s.cost}
              </option>
            ))}
          </select>
        </div>

        <InputFormField
          control={control}
          name="customerName"
          id="customerName"
          label="Customer Name"
          errors={errors}
        />

        <InputFormField
          control={control}
          name="customerPhone"
          id="customerPhone"
          label="Customer Phone"
          errors={errors}
        />

        <InputFormField
          control={control}
          name="serialNumber"
          id="serialNumber"
          label="Serial Number"
          errors={errors}
        />

        <div className="text-right font-medium">
          Estimated Cost: ${methods.watch('totalCost')}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </FormProvider>
  )
}
