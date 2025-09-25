'use client'

import Link from 'next/link'

import ClientHeader from '@/widgets/header/ClientHeader'
import RequestForm from '@/features/request-form/RequestForm'
import { Button } from '@/shared/ui/button'
import { Section } from '@/shared/ui/launchui'

export default function RequestPage() {
  return (
    <>
      <ClientHeader />
      <Section
        className="relative isolate overflow-hidden bg-white px-6 py-24 sm:px-12 md:py-32 lg:px-24"
      >
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.92)_0%,_rgba(244,243,241,0)_70%)]" />

        <div className="mx-auto grid max-w-6xl gap-16 lg:grid-cols-[minmax(0,0.56fr)_minmax(0,0.44fr)] lg:items-start">
          <div className="flex flex-col gap-10 text-left">
            <span className="animate-fade-up text-xs font-semibold uppercase tracking-[0.55em] text-neutral-500">
              Оформление
            </span>
            <h1 className="animate-fade-up delay-2 text-[clamp(3rem,6vw,4.6rem)] font-light tracking-tight text-neutral-900">
              Расскажите о задаче — мы подготовим сервисный сценарий
            </h1>
            <p className="animate-fade-up delay-4 max-w-xl text-lg leading-8 text-neutral-500">
              Заполните форму или свяжитесь с консьерж-командой: предложим сроки, уточним нюансы и организуем передачу устройства.
            </p>

            <dl className="animate-fade-up delay-6 grid gap-6 text-sm uppercase tracking-[0.45em] text-neutral-500 sm:grid-cols-2">
              <div className="space-y-1">
                <dt>Телефон</dt>
                <dd className="text-neutral-900"><Link href="tel:+996501313114">+996 501‑31‑31‑14</Link></dd>
                <dd className="text-neutral-900"><Link href="tel:+996557313114">+996 557‑31‑31‑14</Link></dd>
              </div>
              <div className="space-y-1">
                <dt>Адрес</dt>
                <dd className="text-neutral-900">Кулатова 8/1, Бишкек</dd>
                <dd className="text-neutral-500 normal-case">Ежедневно с 09:00 до 19:00</dd>
              </div>
            </dl>

            <div className="animate-fade-up delay-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button asChild size="lg" variant="ghost" className="rounded-full border border-neutral-300/80 bg-white/70 px-10 text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-neutral-500 transition-colors hover:text-neutral-900">
                <Link href="https://wa.me/996501313114" target="_blank" rel="noreferrer">Написать в WhatsApp</Link>
              </Button>
              <Button asChild size="lg" className="rounded-full px-10 text-[0.7rem] font-semibold uppercase tracking-[0.45em] text-neutral-100 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-[0_25px_60px_-40px_rgba(15,15,15,0.45)]">
                <Link href="/">На главную</Link>
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="animate-fade-up delay-4 absolute -inset-x-12 -inset-y-14 -z-10 rounded-[60px] bg-white/70 blur-3xl" />
            <div className="animate-fade-up delay-6 relative rounded-[48px] border border-neutral-200/70 bg-white px-10 py-12 shadow-[0_60px_160px_-90px_rgba(15,15,15,0.5)] backdrop-blur-sm">
              <RequestForm />
            </div>
            <div className="animate-fade-up delay-8 absolute -right-16 bottom-[-64px] hidden rounded-[44px] border border-white/60 bg-white/80 p-6 text-left shadow-[0_35px_110px_-90px_rgba(15,15,15,0.4)] md:block">
              <p className="text-xs font-semibold uppercase tracking-[0.45em] text-neutral-400">Signature care</p>
              <p className="mt-3 text-sm leading-7 text-neutral-500">
                Участники Signature получают бесплатного курьера по городу и персонального консьержа.
              </p>
            </div>
          </div>
        </div>
      </Section>
    </>
  )
}
