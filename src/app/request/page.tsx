'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import RequestForm from '@/components/RequestForm'

export default function RequestPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center space-y-6">
      <h1 className="text-3xl font-bold mb-4">Request a Laptop Repair</h1>
      <p className="mb-6 max-w-xl">
        Fill out the form below or call us at <span className="font-medium">+996 (312) 123-456</span>
        . You can also send a message via WhatsApp or visit our service center at
        Manas Avenue 1, Bishkek.
      </p>
      <RequestForm />
      <Button asChild size="lg" className="w-fit">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
