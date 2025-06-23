import { FaTools, FaLaptop, FaCheckCircle, FaMoneyBillWave } from 'react-icons/fa'
import BaseContainer from '@/components/BaseContainer'

const features = [
  {
    icon: FaTools,
    title: 'Скоростной ремонт',
    description: 'Выполняем диагностику и ремонт в кратчайшие сроки.'
  },
  {
    icon: FaLaptop,
    title: 'Современное оборудование',
    description: 'Используем профессиональные инструменты и оригинальные детали.'
  },
  {
    icon: FaCheckCircle,
    title: 'Гарантия качества',
    description: 'Предоставляем гарантию на все виды работ и запчастей.'
  },
  {
    icon: FaMoneyBillWave,
    title: 'Доступные цены',
    description: 'Честная стоимость ремонта без скрытых платежей.'
  }
]

export default function Features() {
  return (
    <section id="features" className="py-20">
      <BaseContainer>
        <h2 className="text-3xl font-bold text-center mb-12">Наши преимущества</h2>
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
