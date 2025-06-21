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

const TaskSchema = z.object({
  description: z
    .string()
    .min(1, { message: 'Описание обязательно' })
    .max(255, { message: 'Описание не должно превышать 255 символов' }),
  customerName: z
    .string()
    .min(1, { message: 'Имя клиента обязательно' })
    .max(100, { message: 'Имя клиента не должно превышать 100 символов' }),
  customerPhone: z
    .string()
    .min(1, { message: 'Телефон клиента обязателен' })
    .refine(isValidPhoneNumber, { message: 'Некорректный номер телефона' }),
  laptopBrand: z
    .string()
    .min(1, { message: 'Марка ноутбука обязательна' })
    .max(100, { message: 'Марка ноутбука не должна превышать 100 символов' }),
  laptopModel: z
    .string()
    .min(1, { message: 'Модель ноутбука обязательна' })
    .max(100, { message: 'Модель ноутбука не должна превышать 100 символов' }),
  totalCost: z
    .string()
    .transform((value) => parseFloat(value))
    .refine((value) => !isNaN(value) && value >= 0, {
      message: 'Стоимость должна быть положительным числом',
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
          label="Описание проблемы"
          errors={errors}
          isTextarea
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm" htmlFor="device">Устройство</label>
          <Select onValueChange={handleDeviceChange}>
            <SelectTrigger id="device">
              <SelectValue placeholder="Выберите устройство" />
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
          <label className="text-sm" htmlFor="service">Услуга</label>
          <Select onValueChange={handleServiceChange}>
            <SelectTrigger id="service">
              <SelectValue placeholder="Выберите услугу" />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s._id?.toString()} value={s._id?.toString()}>
                  {s.name} - {s.cost} сом
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <InputFormField
          control={control}
          name="customerName"
          id="customerName"
          label="Имя клиента"
          errors={errors}
        />

        <PhoneInputField
          control={control}
          name="customerPhone"
          label="Телефон клиента"
          defaultCountry={country}
        />


        <div className="text-right font-medium">
          {`Примерная стоимость: ${methods.watch('totalCost')} сом`}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </Button>
      </form>
    </FormProvider>
  )
}
