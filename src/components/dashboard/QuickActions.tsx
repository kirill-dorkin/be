'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  RiAddLine,
  RiUserAddLine,
  RiTaskLine,
  RiSearchLine,
  RiSettingsLine,
  RiFileTextLine,
  RiNotificationLine,
  RiKeyboardLine
} from 'react-icons/ri';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  shortcut: string;
  color: string;
}

const QuickActions: React.FC = () => {

  const [showShortcuts, setShowShortcuts] = useState(false);

  const quickActions: QuickAction[] = [
    {
      id: 'new-task',
      title: 'Новая задача',
      description: 'Создать новую задачу для сотрудника',
      icon: <RiAddLine className="w-5 h-5" />,
      href: '/admin/tasks/new',
      shortcut: 'Ctrl+N',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'add-user',
      title: 'Добавить пользователя',
      description: 'Добавить нового пользователя в систему',
      icon: <RiUserAddLine className="w-5 h-5" />,
      href: '/admin/users/new',
      shortcut: 'Ctrl+U',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'view-tasks',
      title: 'Просмотр задач',
      description: 'Просмотреть все задачи и их статусы',
      icon: <RiTaskLine className="w-5 h-5" />,
      href: '/admin/tasks',
      shortcut: 'Ctrl+T',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'search',
      title: 'Поиск',
      description: 'Поиск по задачам и пользователям',
      icon: <RiSearchLine className="w-5 h-5" />,
      href: '/admin/search',
      shortcut: 'Ctrl+K',
      color: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'settings',
      title: 'Настройки',
      description: 'Настройки системы и профиля',
      icon: <RiSettingsLine className="w-5 h-5" />,
      href: '/admin/settings',
      shortcut: 'Ctrl+,',
      color: 'bg-gray-500 hover:bg-gray-600'
    },
    {
      id: 'reports',
      title: 'Отчеты',
      description: 'Просмотр отчетов и аналитики',
      icon: <RiFileTextLine className="w-5 h-5" />,
      href: '/admin/reports',
      shortcut: 'Ctrl+R',
      color: 'bg-indigo-500 hover:bg-indigo-600'
    }
  ];

  // Обработка горячих клавиш
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault();
            window.location.href = '/admin/tasks/new';
            break;
          case 'u':
            event.preventDefault();
            window.location.href = '/admin/users/new';
            break;
          case 't':
            event.preventDefault();
            window.location.href = '/admin/tasks';
            break;
          case 'k':
            event.preventDefault();
            window.location.href = '/admin/search';
            break;
          case ',':
            event.preventDefault();
            window.location.href = '/admin/settings';
            break;
          case 'r':
            event.preventDefault();
            window.location.href = '/admin/reports';
            break;
          case '?':
            event.preventDefault();
            setShowShortcuts(!showShortcuts);
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts]);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg font-semibold">Быстрые действия</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="flex items-center gap-2"
          >
            <RiKeyboardLine className="w-4 h-4" />
            Горячие клавиши
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {quickActions.map((action) => (
              <Link key={action.id} href={action.href}>
                <div className="group relative">
                  <Button
                    className={`w-full h-20 flex flex-col items-center justify-center gap-2 text-white transition-all duration-200 ${action.color} group-hover:scale-105 group-hover:shadow-lg`}
                  >
                    {action.icon}
                    <span className="text-xs font-medium text-center leading-tight">
                      {action.title}
                    </span>
                  </Button>
                  
                  {/* Tooltip с описанием и горячей клавишей */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                    <div className="font-medium">{action.description}</div>
                    <div className="text-gray-300 mt-1">{action.shortcut}</div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Модальное окно с горячими клавишами */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RiKeyboardLine className="w-5 h-5" />
                Горячие клавиши
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quickActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg text-white ${action.color.split(' ')[0]}`}>
                        {action.icon}
                      </div>
                      <span className="font-medium">{action.title}</span>
                    </div>
                    <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm font-mono">
                      {action.shortcut}
                    </kbd>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2 border-t border-gray-200 mt-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-500 text-white">
                      <RiNotificationLine className="w-5 h-5" />
                    </div>
                    <span className="font-medium">Показать горячие клавиши</span>
                  </div>
                  <kbd className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm font-mono">
                    Ctrl+?
                  </kbd>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Button 
                  onClick={() => setShowShortcuts(false)}
                  className="w-full"
                >
                  Закрыть
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default QuickActions;