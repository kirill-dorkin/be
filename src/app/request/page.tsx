'use client'

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RequestPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
      <h1 className="text-3xl font-bold mb-4">Request a Laptop Repair</h1>
      <p className="mb-6 max-w-xl">
        To book a repair, please call us at <span className="font-medium">+996 (312) 123-456</span>
        or send a message via WhatsApp. You can also visit our service center at
        Manas Avenue 1, Bishkek. Online request forms will be available soon.
      </p>
      <Button asChild size="lg" className="w-fit">
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
