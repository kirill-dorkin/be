import React from 'react'
import Link from 'next/link'
import { cn } from '@/shared/lib/utils'

interface SidebarProps {
  className?: string
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: '📊' },
    { href: '/admin/tasks', label: 'Tasks', icon: '📋' },
    { href: '/admin/users', label: 'Users', icon: '👥' },
    { href: '/admin/devices', label: 'Devices', icon: '💻' },
    { href: '/admin/categories', label: 'Categories', icon: '📁' },
    { href: '/admin/services', label: 'Services', icon: '🔧' },
  ]

  return (
    <aside className={cn('w-64 bg-gray-900 text-white min-h-screen', className)}>
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
        <nav>
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  )
}

export { Sidebar }