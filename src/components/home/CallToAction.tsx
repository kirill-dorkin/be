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
        <h2 className="apple-display-small text-gray-900">Готовы отремонтировать устройство?</h2>
        <p className="apple-subheadline text-gray-600 max-w-2xl mx-auto">Оставьте заявку прямо сейчас и мы свяжемся с вами в течение часа.</p>
        <Button size="lg" asChild className="apple-button bg-black text-white hover:bg-gray-800 rounded-full px-8 py-3 transition-all duration-200 border-0 shadow-sm hover:shadow-md">
          <Link href="/request">Оформить заявку</Link>
        </Button>
      </BaseContainer>
    </Section>
  )
}
