"use client"

import type { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"
import AppProvider from "@/providers/AppProvider"

export default function Providers({ session, children }: { session: Session | null, children: React.ReactNode }) {
  return (
    <SessionProvider session={session} >
      <AppProvider>
        {children}
      </AppProvider>
    </SessionProvider>
  )
}
