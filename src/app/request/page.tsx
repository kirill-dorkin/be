'use client'

import { Button } from "@/shared/ui/button"
import Link from 'next/link'
import RequestForm from '@/features/request-form/RequestForm'

export default function RequestPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
      <h1 className="text-3xl font-bold mb-4">Оформить ремонт</h1>
      <p className="mb-6 max-w-xl">
        Заполните форму ниже или свяжитесь с нами по телефону <span className="font-medium">+996 501‑31‑31‑14</span>
        &nbsp;или <span className="font-medium">+996 557‑31‑31‑14</span>. Вы также можете написать нам в WhatsApp или посетить сервисный центр по адресу
        Кулатова 8/1, Bishkek.
      </p>
      <RequestForm />
      <Button asChild size="lg" className="w-fit">
        <Link href="/">Вернуться на главную</Link>
      </Button>
    </div>
  );
}
