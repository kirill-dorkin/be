'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import RequestForm from '@/components/RequestForm'

export default function RequestPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
      <h1 className="text-3xl font-bold mb-4">Request a Repair</h1>
      <p className="mb-6 max-w-xl">
        Fill out the form below or reach us at <span className="font-medium">+996 501‑31‑31‑14</span>
        &nbsp;or <span className="font-medium">+996 557‑31‑31‑14</span>. You can also send a message via WhatsApp or visit our service center at
        <Link href="https://go.2gis.com/" className="underline" target="_blank">Кулатова 8/1, Bishkek</Link>.
      </p>
      <RequestForm />
      <Button asChild size="lg" className="w-fit">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
