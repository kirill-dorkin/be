'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import InputFormField from '@/components/InputFormField'
import PhoneInputField from '@/components/PhoneInputField'
import useGeoCountry from '@/hooks/useGeoCountry'
import { isValidPhoneNumber } from 'react-phone-number-input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import addTaskAction from '@/actions/dashboard/addTaskAction'
import useCustomToast from '@/hooks/useCustomToast'
import { ITask } from '@/models/Task'
import getDevicesAction from '@/actions/dashboard/getDevicesAction'
import getServicesAction from '@/actions/dashboard/getServicesAction'
import { IDevice } from '@/models/Device'
import { IService } from '@/models/Service'

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
    .refine(isValidPhoneNumber, { message: 'Invalid phone number' }),
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
  const country = useGeoCountry()

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

  const handleDeviceChange = (value: string) => {
    const device = devices.find((d) => d._id?.toString() === value)
    if (device) {
      methods.setValue('laptopBrand', device.brand)
      methods.setValue('laptopModel', device.model || '')
    }
  }

  const handleServiceChange = (value: string) => {
    const service = services.find((s) => s._id?.toString() === value)
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
          <Select onValueChange={handleDeviceChange}>
            <SelectTrigger id="device">
              <SelectValue placeholder="Select device" />
            </SelectTrigger>
            <SelectContent>
              {devices.map((d) => (
                <SelectItem key={d._id?.toString()} value={d._id?.toString()}>
                  {d.brand} {d.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm" htmlFor="service">Service</label>
          <Select onValueChange={handleServiceChange}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s._id?.toString()} value={s._id?.toString()}>
                  {s.name} - ${s.cost}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <InputFormField
          control={control}
          name="customerName"
          id="customerName"
          label="Customer Name"
          errors={errors}
        />

        <PhoneInputField
          control={control}
          name="customerPhone"
          label="Customer Phone"
          defaultCountry={country}
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
