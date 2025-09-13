'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useTranslations } from 'next-intl'
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

import getDevicesAction from '@/actions/dashboard/getDevicesAction'
import getServicesAction from '@/actions/dashboard/getServicesAction'
import { IDevice } from '@/models/Device'
import { IService } from '@/models/Service'

const createTaskSchema = (t: (key: string) => string) => z.object({
  description: z
    .string()
    .min(1, { message: t('validation.descriptionRequired') })
    .max(255, { message: t('validation.descriptionMaxLength') }),
  customerName: z
    .string()
    .min(1, { message: t('validation.customerNameRequired') })
    .max(100, { message: t('validation.customerNameMaxLength') })
    .regex(/^[A-Za-zА-Яа-яЁё]+$/, {
      message: t('validation.customerNameLettersOnly'),
    }),
  customerPhone: z
    .string()
    .min(1, { message: t('validation.customerPhoneRequired') })
    .refine(isValidPhoneNumber, { message: t('validation.phoneInvalid') }),
  laptopBrand: z
    .string()
    .min(1, { message: t('validation.laptopBrandRequired') })
    .max(100, { message: t('validation.laptopBrandMaxLength') }),
  laptopModel: z
    .string()
    .min(1, { message: t('validation.laptopModelRequired') })
    .max(100, { message: t('validation.laptopModelMaxLength') }),
  totalCost: z
    .number()
    .min(0, { message: t('validation.totalCostPositive') }),
})

export default function RequestForm() {
  const t = useTranslations('requestForm')
  const [loading, setLoading] = useState(false)
  const { showSuccessToast, showErrorToast } = useCustomToast()
  const [devices, setDevices] = useState<IDevice[]>([])
  const [services, setServices] = useState<IService[]>([])
  const country = useGeoCountry()

  const TaskSchema = createTaskSchema(t)
  type TaskFormData = z.infer<typeof TaskSchema>

  const methods = useForm<TaskFormData>({
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
      if (res.status === 'success') setDevices(res.items as unknown as IDevice[])
    })
    getServicesAction(1, 100).then((res) => {
      if (res.status === 'success') setServices(res.items as unknown as IService[])
    })
  }, [])

  const handleDeviceChange = (value: string) => {
    const device = devices.find((d) => d._id?.toString() === value)
    if (device) {
      methods.setValue('laptopBrand', device.brand)
      methods.setValue('laptopModel', device.deviceModel || '')
    }
  }

  const handleServiceChange = (value: string) => {
    const service = services.find((s) => s._id?.toString() === value)
    if (service) {
      methods.setValue('totalCost', service.cost)
    }
  }

  const handleSubmitAction = async (data: TaskFormData) => {
    setLoading(true)
    try {
      const response = await addTaskAction(data)

      if (response.status === 'error') {
        showErrorToast({ title: t('error'), description: response.message })
      } else {
        showSuccessToast({
          title: t('success'),
          description: response.message,
        })
        reset()
      }
    } catch (error) {
      showErrorToast({
        title: t('error'),
        description: error instanceof Error ? error.message : t('unknownError'),
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
          label={t('problemDescription')}
          errors={errors}
          isTextarea
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm" htmlFor="device">{t('device')}</label>
          <Select onValueChange={handleDeviceChange}>
            <SelectTrigger id="device">
              <SelectValue placeholder={t('selectDevice')} />
            </SelectTrigger>
            <SelectContent>
              {devices.map((d) => (
                <SelectItem key={d._id?.toString()} value={d._id?.toString() || ''}>
                  {d.brand} {d.deviceModel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm" htmlFor="service">{t('service')}</label>
          <Select onValueChange={handleServiceChange}>
            <SelectTrigger id="service">
              <SelectValue placeholder={t('selectService')} />
            </SelectTrigger>
            <SelectContent>
              {services.map((s) => (
                <SelectItem key={s._id?.toString()} value={s._id?.toString() || ''}>
                  {s.name} - {s.cost} {t('currency')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <InputFormField
          control={control}
          name="customerName"
          id="customerName"
          label={t('customerName')}
          errors={errors}
          onChange={(e) => {
            e.target.value = e.target.value.replace(/[^a-zA-Zа-яА-ЯёЁ]+/g, '')
          }}
        />

        <PhoneInputField
          control={control}
          name="customerPhone"
          label={t('customerPhone')}
          defaultCountry={country}
        />


        <div className="text-right font-medium">
          {t('estimatedCost', { cost: methods.watch('totalCost') })}
        </div>

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? t('submitting') : t('submitRequest')}
        </Button>
      </form>
    </FormProvider>
  )
}
