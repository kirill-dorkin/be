'use client'

import React from 'react'

interface SummaryData {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  totalUsers: number
  totalRevenue: number
  monthlyGrowth: number
}

interface DashboardSummaryProps {
  data: SummaryData
}

export default function DashboardSummary({ data }: DashboardSummaryProps) {
  const summaryCards = [
    {
      title: 'Всего задач',
      value: data.totalTasks,
      icon: '📋',
      color: 'bg-blue-50 text-blue-600',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Выполнено',
      value: data.completedTasks,
      icon: '✅',
      color: 'bg-green-50 text-green-600',
      borderColor: 'border-green-200'
    },
    {
      title: 'В ожидании',
      value: data.pendingTasks,
      icon: '⏳',
      color: 'bg-yellow-50 text-yellow-600',
      borderColor: 'border-yellow-200'
    },
    {
      title: 'Пользователи',
      value: data.totalUsers,
      icon: '👥',
      color: 'bg-purple-50 text-purple-600',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Доход',
      value: `${data.totalRevenue.toLocaleString('ru-RU')} сом`,
      icon: '💰',
      color: 'bg-emerald-50 text-emerald-600',
      borderColor: 'border-emerald-200'
    },
    {
      title: 'Рост',
      value: `+${data.monthlyGrowth}%`,
      icon: '📈',
      color: 'bg-indigo-50 text-indigo-600',
      borderColor: 'border-indigo-200'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {summaryCards.map((card, index) => (
        <div 
          key={index} 
          className={`bg-white rounded-lg border-2 ${card.borderColor} p-6 hover:shadow-md transition-shadow`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
              <p className={`text-2xl font-bold ${card.color}`}>
                {typeof card.value === 'number' ? card.value.toLocaleString('ru-RU') : card.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}