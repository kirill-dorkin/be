'use client'

import React from 'react'

interface ListItem {
  id: string
  title: string
  subtitle?: string
  status?: string
  date?: string
}

interface ListCardProps {
  title: string
  items: ListItem[]
  onItemClick?: (item: ListItem) => void
  onViewAll?: () => void
  emptyMessage?: string
}

export default function ListCard({ 
  title, 
  items, 
  onItemClick, 
  onViewAll,
  emptyMessage = 'Нет данных для отображения'
}: ListCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'завершено':
        return 'bg-green-100 text-green-800'
      case 'pending':
      case 'в ожидании':
        return 'bg-yellow-100 text-yellow-800'
      case 'in_progress':
      case 'в работе':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
      case 'отменено':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{title}</h3>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Показать все
          </button>
        )}
      </div>
      
      <div className="divide-y divide-gray-200">
        {items.length > 0 ? (
          items.map((item) => (
            <div
              key={item.id}
              className={`px-6 py-4 hover:bg-gray-50 ${
                onItemClick ? 'cursor-pointer' : ''
              }`}
              onClick={() => onItemClick?.(item)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {item.title}
                  </p>
                  {item.subtitle && (
                    <p className="text-sm text-gray-500 truncate">
                      {item.subtitle}
                    </p>
                  )}
                </div>
                <div className="flex items-center space-x-2 ml-4">
                  {item.status && (
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  )}
                  {item.date && (
                    <span className="text-xs text-gray-500">
                      {new Date(item.date).toLocaleDateString('ru-RU')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center text-gray-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </div>
  )
}