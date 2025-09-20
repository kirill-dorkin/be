import BaseContainer from '@/components/BaseContainer'
import Image from 'next/image'

export default function About() {
  return (
    <section id="about" className="py-20 bg-muted/50">
      <BaseContainer className="grid gap-10 lg:grid-cols-2 items-center">
        <div className="space-y-6 text-center lg:text-left">
          <h2 className="text-3xl font-bold">О сервисе</h2>
          <p>
            Мы помогаем быстро решать проблемы с вашей техникой. В нашей мастерской
            работают сертифицированные специалисты, которые используют современное
            оборудование и оригинальные комплектующие.
          </p>
          <p>
            Более десяти лет мы ремонтируем ноутбуки и другую электронику, постоянно
            улучшая качество обслуживания и расширяя список услуг.
          </p>
        </div>
        <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-xl">
          <Image
            src="/images/tranquil-haven.jpg"
            alt="Best Electronics Workshop"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 600px, 100vw"
          />
        </div>
      </BaseContainer>
    </section>
  )
}
