'use client'

import React from 'react'

interface DashboardGreaterProps {
  userName?: string
}

export default function DashboardGreater({ userName = 'Администратор' }: DashboardGreaterProps) {
  const currentHour = new Date().getHours()
  
  const getGreeting = () => {
    if (currentHour < 12) return 'Доброе утро'
    if (currentHour < 18) return 'Добрый день'
    return 'Добрый вечер'
  }

  const getCurrentDate = () => {
    return new Date().toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {userName}!
          </h1>
          <p className="text-blue-100 mt-1">
            {getCurrentDate()}
          </p>
          <p className="text-blue-100 mt-2">
            Добро пожаловать в панель управления
          </p>
        </div>
        <div className="hidden md:block">
          <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}