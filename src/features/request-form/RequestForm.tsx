'use client'

import { useEffect, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { isValidPhoneNumber } from 'react-phone-number-input'

import InputFormField from '@/shared/ui/InputFormField'
import PhoneInputField from '@/shared/ui/PhoneInputField'
import { Button } from '@/shared/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/select'

import useGeoCountry from '@/shared/lib/useGeoCountry'
import { showToast } from '@/shared/lib/toast'
import { addTaskAction } from '@/shared/api/dashboard/addTaskAction'
import { getDevicesAction } from '@/shared/api/dashboard/getDevicesAction'
import { getServicesAction } from '@/shared/api/dashboard/getServicesAction'
import { IDevice } from '@/entities/device'
import { IService } from '@/entities/service'

const TaskSchema = z.object({
  description: z
    .string()
    .min(1, { message: 'Описание обязательно' })
    .max(255, { message: 'Описание не должно превышать 255 символов' }),
  customerName: z
    .string()
    .min(1, { message: 'Имя клиента обязательно' })
    .max(100, { message: 'Имя клиента не должно превышать 100 символов' })
    .regex(/^[A-Za-zА-Яа-яЁё]+$/, {
      message: 'Имя должно содержать только буквы',
    }),
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
    .number()
    .min(0, { message: 'Стоимость должна быть положительным числом' }),
})

type TaskForm = z.infer<typeof TaskSchema>

export default function RequestForm() {
  const [loading, setLoading] = useState(false)
  const [devices, setDevices] = useState<IDevice[]>([])
  const [services, setServices] = useState<IService[]>([])
  const country = useGeoCountry()

  const methods = useForm<TaskForm>({
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

  const { control, handleSubmit, formState: { errors }, reset, setValue } = methods

  useEffect(() => {
    getDevicesAction(1, 100).then((res: any) => {
      if (res.status === 'success') setDevices(res.items as unknown as IDevice[])
    })
    getServicesAction(1, 100).then((res: any) => {
      if (res.status === 'success') setServices(res.items as unknown as IService[])
    })
  }, [])

  const handleDeviceChange = (value: string) => {
    const device = devices.find((d) => d._id?.toString() === value)
    if (device) {
      methods.setValue('laptopBrand', device.brand)
      methods.setValue('laptopModel', device.modelName || '')
    }
  }

  const handleServiceChange = (value: string) => {
    const service = services.find((s) => s._id?.toString() === value)
    if (service) {
      methods.setValue('totalCost', service.cost)
    }
  }

  const handleSubmitAction = async (data: TaskForm) => {
    setLoading(true)
    try {
      const response = await addTaskAction(data)
      if (response.status === 'error') {
        showToast.error(response.message)
      } else {
        showToast.success(response.message)
        reset()
      }
    } catch (error) {
      showToast.error(error instanceof Error ? error.message : 'Произошла неизвестная ошибка.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(handleSubmitAction)}
        className="flex flex-col gap-8"
      >
        <InputFormField
          control={control}
          name="description"
          id="description"
          label="Что с устройством"
          placeholder="Опишите симптомы и предысторию"
          errors={errors}
          isTextarea
          rows={4}
        />

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
              Устройство
            </span>
            <Select onValueChange={handleDeviceChange}>
              <SelectTrigger className="h-12 rounded-full border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-600">
                <SelectValue placeholder="Выберите устройство" />
              </SelectTrigger>
              <SelectContent className="rounded-3xl border-neutral-200 bg-white shadow-xl">
                {devices.map((d) => (
                  <SelectItem key={d._id?.toString()} value={d._id?.toString() || ''}>
                    {d.brand} {d.modelName || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
              Услуга
            </span>
            <Select onValueChange={handleServiceChange}>
              <SelectTrigger className="h-12 rounded-full border-neutral-200 bg-white px-6 text-sm font-medium text-neutral-600">
                <SelectValue placeholder="Выберите услугу" />
              </SelectTrigger>
              <SelectContent className="rounded-3xl border-neutral-200 bg-white shadow-xl">
                {services.map((s) => (
                  <SelectItem key={s._id?.toString()} value={s._id?.toString() || ''}>
                    {s.name} — {s.cost} сом
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <InputFormField
            control={control}
            name="customerName"
            id="customerName"
            label="Имя клиента"
            placeholder="Как к вам обращаться"
            errors={errors}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
              const filteredValue = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ]+/g, '')
              setValue('customerName', filteredValue)
            }}
          />

          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-400">
              Контактный номер
            </span>
            <PhoneInputField
              control={control}
              name="customerPhone"
              label=""
              defaultCountry={country}
            />
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <InputFormField
            control={control}
            name="laptopBrand"
            id="laptopBrand"
            label="Марка"
            placeholder="Apple, Lenovo и т.д."
            errors={errors}
          />
          <InputFormField
            control={control}
            name="laptopModel"
            id="laptopModel"
            label="Модель"
            placeholder="Например, MacBook Pro 14"
            errors={errors}
          />
        </div>

        <div className="flex items-center justify-between rounded-[32px] border border-neutral-200/70 bg-white px-6 py-4 text-sm uppercase tracking-[0.35em] text-neutral-500">
          <span>Примерная стоимость</span>
          <span className="text-neutral-900">{methods.watch('totalCost')} сом</span>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="h-14 rounded-full px-10 text-xs font-semibold uppercase tracking-[0.45em] text-neutral-100"
        >
          {loading ? 'Отправка...' : 'Отправить заявку'}
        </Button>
      </form>
    </FormProvider>
  )
}
