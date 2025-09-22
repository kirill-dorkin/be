'use client'

import React from 'react'

interface SelectShowingProps {
  value: number
  onChange: (value: number) => void
  options?: number[]
}

export default function SelectShowing({ 
  value, 
  onChange, 
  options = [10, 25, 50, 100] 
}: SelectShowingProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">Показать</span>
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="text-sm text-gray-600">записей</span>
    </div>
  )
}