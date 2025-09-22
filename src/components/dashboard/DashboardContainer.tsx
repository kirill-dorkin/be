'use client'

import React from 'react'
import { Sidebar } from '@/features/dashboard'

interface DashboardContainerProps {
  children: React.ReactNode
  title?: string
  className?: string
}

export default function DashboardContainer({ 
  children, 
  title = "Dashboard",
  className = ""
}: DashboardContainerProps) {
  return (
    <div className={`flex min-h-screen bg-gray-50 ${className}`}>
      <Sidebar className="w-64 bg-white shadow-sm" />
      <main className="flex-1 p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6">
          {children}
        </div>
      </main>
    </div>
  )
}