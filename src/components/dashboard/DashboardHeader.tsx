'use client'

import React from 'react'

interface DashboardHeaderProps {
  children: React.ReactNode
  className?: string
}

export default function DashboardHeader({ children, className }: DashboardHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6 pb-4 border-b border-gray-200 ${className || ''}`}>
      {children}
    </div>
  )
}