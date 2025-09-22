'use client'

import React from 'react'

interface DashboardTitleProps {
  children: React.ReactNode
}

export default function DashboardTitle({ children }: DashboardTitleProps) {
  return (
    <h1 className="text-2xl font-bold text-gray-900">
      {children}
    </h1>
  )
}