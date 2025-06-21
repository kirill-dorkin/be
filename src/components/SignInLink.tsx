'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"

export default function SignInLink() {
  const router = useRouter();
  return (
    <Button variant="default" size="sm" onClick={() => router.push('/login')}>
      Login
    </Button>
  );
}
