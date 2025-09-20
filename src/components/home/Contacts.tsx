"use client"
import { useState } from 'react'
import BaseContainer from '@/components/BaseContainer'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function Contacts() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Сообщение отправлено!')
    setForm({ name: '', email: '', message: '' })
  }

  return (
    <section id="contacts" className="py-20">
      <BaseContainer className="grid gap-12 lg:grid-cols-2 items-start">
        <div className="space-y-4 text-center lg:text-left">
          <h2 className="text-3xl font-bold">Свяжитесь с нами</h2>
          <p>Кулатова 8/1, Бишкек</p>
          <p>
            <a href="tel:+996501313114" className="underline">
              +996 501‑31‑31‑14
            </a>{' '}
            |{' '}
            <a href="tel:+996557313114" className="underline">
              +996 557‑31‑31‑14
            </a>
          </p>
          <p>Мы всегда рады ответить на ваши вопросы.</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            name="name"
            placeholder="Ваше имя"
            value={form.name}
            onChange={handleChange}
            required
          />
          <Input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <Textarea
            name="message"
            placeholder="Ваше сообщение"
            value={form.message}
            onChange={handleChange}
            required
          />
          <Button type="submit" className="w-full">
            Отправить
          </Button>
        </form>
      </BaseContainer>
    </section>
  )
}
