'use client'

import React from 'react'

interface TaskStats {
  total: number
  pending: number
  inProgress: number
  completed: number
}

interface TaskReportProps {
  stats: TaskStats
}

export default function TaskReport({ stats }: TaskReportProps) {
  const cards = [
    {
      title: 'Всего задач',
      value: stats.total,
      color: 'bg-blue-500',
      textColor: 'text-blue-600'
    },
    {
      title: 'В ожидании',
      value: stats.pending,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-600'
    },
    {
      title: 'В работе',
      value: stats.inProgress,
      color: 'bg-orange-500',
      textColor: 'text-orange-600'
    },
    {
      title: 'Завершено',
      value: stats.completed,
      color: 'bg-green-500',
      textColor: 'text-green-600'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`w-4 h-4 rounded-full ${card.color} mr-3`}></div>
            <div>
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className={`text-2xl font-bold ${card.textColor}`}>{card.value}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}