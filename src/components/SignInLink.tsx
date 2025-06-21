'use client';

import { signIn } from 'next-auth/react';
import { Button } from "@/components/ui/button"

export default function SignInLink() {
  return (
    <Button variant="default" size="sm" onClick={() => signIn('google')}>
      Login
    </Button>
  );
}
