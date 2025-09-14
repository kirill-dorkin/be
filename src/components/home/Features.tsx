import { FaTools, FaLaptop, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa'
import BaseContainer from '@/components/BaseContainer'
import { useTranslations } from 'next-intl'

const getFeatures = (t: any) => [
  {
    icon: FaTools,
    title: t('features.items.fastRepair.title'),
    description: t('features.items.fastRepair.description')
  },
  {
    icon: FaLaptop,
    title: t('features.items.modernEquipment.title'),
    description: t('features.items.modernEquipment.description')
  },
  {
    icon: FaCheckCircle,
    title: t('features.items.qualityGuarantee.title'),
    description: t('features.items.qualityGuarantee.description')
  },
  {
    icon: FaMoneyBillWave,
    title: t('features.items.affordablePrices.title'),
    description: t('features.items.affordablePrices.description')
  }
]

export default function Features() {
  const t = useTranslations()
  const features = getFeatures(t)
  
  return (
    <section id="features" className="py-20">
      <BaseContainer>
        <h2 className="text-3xl font-bold text-center mb-12">{t('features.title')}</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg bg-background shadow p-6 flex flex-col items-center text-center space-y-4"
            >
              <Icon className="size-12 text-primary" />
              <h3 className="text-xl font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </BaseContainer>
    </section>
  )
}
