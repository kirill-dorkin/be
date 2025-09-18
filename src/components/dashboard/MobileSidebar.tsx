'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  RiMenuLine,
  RiCloseLine,
  RiDashboardLine,
  RiUserLine,
  RiTaskLine,
  RiSettings4Line,
  RiBarChartLine,
  RiShoppingCartLine,
  RiBriefcaseLine,
  RiComputerLine,
  RiCustomerServiceLine,
  RiAppsLine,
  RiLogoutBoxLine,
  RiNotificationLine
} from 'react-icons/ri';
import { FaBoxes } from 'react-icons/fa';

interface NavigationGroup {
  id: string;
  title: string;
  items: NavigationItem[];
}

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  isActive?: boolean;
}

interface MobileSidebarProps {
  className?: string;
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({ className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();


  const navigationGroups: NavigationGroup[] = [
    {
      id: 'overview',
      title: 'Обзор',
      items: [
        {
          href: '/admin/dashboard',
          label: 'Панель управления',
          icon: <RiDashboardLine className="w-5 h-5" />,
          isActive: pathname === '/admin/dashboard'
        },
        {
          href: '/admin/analytics',
          label: 'Аналитика',
          icon: <RiBarChartLine className="w-5 h-5" />,
          isActive: pathname === '/admin/analytics'
        }
      ]
    },
    {
      id: 'management',
      title: 'Управление',
      items: [
        {
          href: '/admin/users',
          label: 'Сотрудники',
          icon: <RiUserLine className="w-5 h-5" />,
          badge: '12',
          isActive: pathname === '/admin/users'
        },
        {
          href: '/admin/tasks',
          label: 'Задачи',
          icon: <RiTaskLine className="w-5 h-5" />,
          badge: '5',
          isActive: pathname === '/admin/tasks'
        },
        {
          href: '/admin/categories',
          label: 'Категории',
          icon: <FaBoxes className="w-5 h-5" />,
          isActive: pathname === '/admin/categories'
        },
        {
          href: '/admin/prices',
          label: 'Цены',
          icon: <RiSettings4Line className="w-5 h-5" />,
          isActive: pathname === '/admin/prices'
        }
      ]
    },
    {
      id: 'commerce',
      title: 'Коммерция',
      items: [
        {
          href: '/admin/orders',
          label: 'Заказы',
          icon: <RiShoppingCartLine className="w-5 h-5" />,
          badge: '3',
          isActive: pathname === '/admin/orders'
        },
        {
          href: '/admin/devices',
          label: 'Устройства',
          icon: <RiComputerLine className="w-5 h-5" />,
          isActive: pathname === '/admin/devices'
        },
        {
          href: '/admin/services',
          label: 'Услуги',
          icon: <RiCustomerServiceLine className="w-5 h-5" />,
          isActive: pathname === '/admin/services'
        }
      ]
    },
    {
      id: 'work',
      title: 'Работа',
      items: [
        {
          href: '/admin/projects',
          label: 'Проекты',
          icon: <RiBriefcaseLine className="w-5 h-5" />,
          isActive: pathname === '/admin/projects'
        },
        {
          href: '/admin/applications',
          label: 'Приложения',
          icon: <RiAppsLine className="w-5 h-5" />,
          isActive: pathname === '/admin/applications'
        }
      ]
    }
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <div className={`md:hidden ${className}`}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 h-auto"
            aria-label="Открыть меню"
          >
            <RiMenuLine className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-80 p-0 bg-white">
          <div className="flex flex-col h-full">
            {/* Header */}
            <SheetHeader className="p-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-white font-bold text-xl">
                  Admin Panel
                </SheetTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:bg-white/20 p-1 h-auto"
                >
                  <RiCloseLine className="w-5 h-5" />
                </Button>
              </div>
              
              {/* User info */}
              <div className="flex items-center gap-3 mt-4">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <RiUserLine className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="text-white font-medium text-sm">Admin User</div>
                  <div className="text-white/80 text-xs">admin@example.com</div>
                </div>
              </div>
            </SheetHeader>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
              <nav className="space-y-6">
                {navigationGroups.map((group) => (
                  <div key={group.id} className="px-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      {group.title}
                    </h3>
                    <div className="space-y-1">
                      {group.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={handleLinkClick}
                          className={`
                            flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                            ${
                              item.isActive
                                ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                            }
                          `}
                        >
                          <span className={item.isActive ? 'text-blue-600' : 'text-gray-500'}>
                            {item.icon}
                          </span>
                          <span className="flex-1">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant={item.isActive ? 'default' : 'secondary'}
                              className="text-xs px-2 py-0.5 min-w-[20px] h-5"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </nav>
            </div>

            {/* Footer */}
            <div className="border-t p-4 space-y-2">
              <Link
                href="/admin/settings"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RiSettings4Line className="w-5 h-5 text-gray-500" />
                <span>Настройки</span>
              </Link>
              
              <Link
                href="/admin/notifications"
                onClick={handleLinkClick}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RiNotificationLine className="w-5 h-5 text-gray-500" />
                <span>Уведомления</span>
                <Badge variant="destructive" className="text-xs px-2 py-0.5 min-w-[20px] h-5">
                  3
                </Badge>
              </Link>
              
              <button
                onClick={handleLinkClick}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                <RiLogoutBoxLine className="w-5 h-5" />
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MobileSidebar;