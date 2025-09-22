'use client'

import React from 'react'

interface User {
  id: string
  name: string
  email: string
  role: string
  lastActive: string
}

interface UserListProps {
  users: User[]
  onUserClick?: (user: User) => void
}

export default function UserList({ users, onUserClick }: UserListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Пользователи</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {users.map((user) => (
          <div
            key={user.id}
            className={`px-6 py-4 hover:bg-gray-50 ${
              onUserClick ? 'cursor-pointer' : ''
            }`}
            onClick={() => onUserClick?.(user)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-900">{user.role}</p>
                <p className="text-sm text-gray-500">
                  {new Date(user.lastActive).toLocaleDateString('ru-RU')}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      {users.length === 0 && (
        <div className="px-6 py-8 text-center text-gray-500">
          Пользователи не найдены
        </div>
      )}
    </div>
  )
}