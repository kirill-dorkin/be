import Link from 'next/link'
import { Button } from '@/components/ui/button'
import BaseContainer from '@/components/BaseContainer'
import Glow from '@/components/launchui/Glow'
import Section from '@/components/launchui/Section'

export default function CallToAction() {
  return (
    <Section id="cta" className="relative py-20 text-center overflow-hidden">
      <Glow className="-z-10" variant="center" />
      <BaseContainer className="space-y-6">
        <h2 className="text-3xl font-bold">Готовы отремонтировать устройство?</h2>
        <p>Оставьте заявку прямо сейчас и мы свяжемся с вами в течение часа.</p>
        <Button size="lg" asChild>
          <Link href="/request">Оформить заявку</Link>
        </Button>
      </BaseContainer>
    </Section>
  )
}
