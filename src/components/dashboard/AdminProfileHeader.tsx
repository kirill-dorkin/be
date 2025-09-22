'use client'

import React from 'react'
import { AvatarImage } from '@/shared/ui/OptimizedImage'

interface AdminProfileHeaderProps {
  adminName?: string
  adminEmail?: string
  avatarUrl?: string
}

export default function AdminProfileHeader({ 
  adminName = 'Администратор',
  adminEmail = 'admin@be.kg',
  avatarUrl 
}: AdminProfileHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center overflow-hidden">
          {avatarUrl ? (
            <AvatarImage 
              src={avatarUrl} 
              alt={adminName}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-xl font-bold text-gray-700">
              {adminName.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900">{adminName}</h2>
          <p className="text-gray-600">{adminEmail}</p>
          <div className="flex items-center mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-500">Онлайн</span>
          </div>
        </div>
        <div className="text-right">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
            Редактировать профиль
          </button>
        </div>
      </div>
    </div>
  )
}