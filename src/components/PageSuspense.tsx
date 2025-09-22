import React, { Suspense } from 'react'
import Spinner from "@/shared/ui/spinner"

interface PageSuspenseProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function PageSuspense({ children, fallback }: PageSuspenseProps) {
  const defaultFallback = (
    <div className="min-h-screen flex items-center justify-center">
      <Spinner />
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  )
}