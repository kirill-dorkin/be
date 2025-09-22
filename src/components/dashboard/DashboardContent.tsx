'use client'

import React from 'react'

interface DashboardContentProps {
  children: React.ReactNode
}

export default function DashboardContent({ children }: DashboardContentProps) {
  return (
    <div className="space-y-6">
      {children}
    </div>
  )
}