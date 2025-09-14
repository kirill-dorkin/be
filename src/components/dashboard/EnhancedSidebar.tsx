'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';

import Link from 'next/link';
import { 
  RiDashboardFill, 
  RiSearchLine, 
  RiCloseLine,
  RiMenuLine,
  RiLogoutBoxLine,
  RiSettings4Line,
  RiNotificationLine
} from 'react-icons/ri';
import { 
  FaTasks, 
  FaUsers, 
  FaBoxes, 
  FaShoppingCart, 
  FaLayerGroup,
  FaLaptop,
  FaCog
} from 'react-icons/fa';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import useAppContext from '@/hooks/useAppContext';

interface NavigationItem {
  id: string;
  href: string;
  label: string;
  icon: React.ReactElement;
  badge?: number;
  keywords: string[];
}

interface NavigationGroup {
  id: string;
  label: string;
  items: NavigationItem[];
}

const getAdminNavigation = (): NavigationGroup[] => [
  {
    id: 'overview',
    label: 'Обзор',
    items: [
      {
        id: 'dashboard',
        href: '/admin/dashboard',
        label: 'Панель управления',
        icon: <RiDashboardFill className="w-5 h-5" />,
        keywords: ['dashboard', 'панель', 'главная', 'обзор']
      }
    ]
  },
  {
    id: 'management',
    label: 'Управление',
    items: [
      {
        id: 'tasks',
        href: '/admin/tasks',
        label: 'Задачи',
        icon: <FaTasks className="w-5 h-5" />,
        badge: 5, // Можно получать из API
        keywords: ['tasks', 'задачи', 'работа', 'заявки']
      },
      {
        id: 'users',
        href: '/admin/users',
        label: 'Пользователи',
        icon: <FaUsers className="w-5 h-5" />,
        keywords: ['users', 'пользователи', 'сотрудники', 'команда']
      }
    ]
  },
  {
    id: 'commerce',
    label: 'Коммерция',
    items: [
      {
        id: 'products',
        href: '/admin/products',
        label: 'Товары',
        icon: <FaBoxes className="w-5 h-5" />,
        keywords: ['products', 'товары', 'продукты', 'каталог']
      },
      {
        id: 'orders',
        href: '/admin/orders',
        label: 'Заказы',
        icon: <FaShoppingCart className="w-5 h-5" />,
        keywords: ['orders', 'заказы', 'покупки', 'продажи']
      },
      {
        id: 'categories',
        href: '/admin/categories',
        label: 'Категории',
        icon: <FaLayerGroup className="w-5 h-5" />,
        keywords: ['categories', 'категории', 'группы', 'разделы']
      }
    ]
  },
  {
    id: 'services',
    label: 'Услуги',
    items: [
      {
        id: 'devices',
        href: '/admin/devices',
        label: 'Устройства',
        icon: <FaLaptop className="w-5 h-5" />,
        keywords: ['devices', 'устройства', 'техника', 'оборудование']
      },
      {
        id: 'services',
        href: '/admin/services',
        label: 'Услуги',
        icon: <FaCog className="w-5 h-5" />,
        keywords: ['services', 'услуги', 'сервис', 'обслуживание']
      }
    ]
  }
];

const getWorkerNavigation = (): NavigationGroup[] => [
  {
    id: 'work',
    label: 'Работа',
    items: [
      {
        id: 'my-tasks',
        href: '/worker/my-tasks',
        label: 'Мои задачи',
        icon: <FaTasks className="w-5 h-5" />,
        keywords: ['tasks', 'задачи', 'мои', 'работа']
      }
    ]
  }
];

const getNavigationByRole = (role: string): NavigationGroup[] => {
  switch (role) {
    case 'worker':
      return getWorkerNavigation();
    case 'admin':
      return getAdminNavigation();
    default:
      return [];
  }
};

const EnhancedSidebar = () => {
  const { isExpanded, toggleSidebar, setIsExpanded } = useAppContext();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const navigation = useMemo(() => {
    if (!session?.user?.role) return [];
    return getNavigationByRole(session.user.role);
  }, [session?.user?.role]);

  // Фильтрация навигации по поисковому запросу
  const filteredNavigation = useMemo(() => {
    if (!searchQuery.trim()) return navigation;
    
    return navigation.map(group => ({
      ...group,
      items: group.items.filter(item => 
        item.keywords.some(keyword => 
          keyword.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    })).filter(group => group.items.length > 0);
  }, [navigation, searchQuery]);

  const handleLogout = () => {
    signOut();
    setIsExpanded(false);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      setIsExpanded(false);
    }
  };

  // Быстрая навигация по клавишам
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setIsExpanded(true);
            setTimeout(() => {
              const searchInput = document.getElementById('sidebar-search');
              searchInput?.focus();
            }, 100);
            break;
          case 'b':
            e.preventDefault();
            toggleSidebar();
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setIsExpanded, toggleSidebar]);

  return (
    <>
      {/* Overlay для мобильных устройств */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsExpanded(false)}
        />
      )}
      
      {/* Sidebar */}
      <aside className={`
        fixed left-0 top-0 z-50 h-full bg-white border-r border-gray-200 
        transition-all duration-300 ease-in-out
        ${isExpanded ? 'w-80' : 'w-16'}
        lg:relative lg:z-auto
        ${isExpanded ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className={`flex items-center space-x-3 transition-opacity duration-200 ${
            isExpanded ? 'opacity-100' : 'opacity-0 lg:opacity-0'
          }`}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <RiDashboardFill className="w-5 h-5 text-white" />
            </div>
            {isExpanded && (
              <div>
                <h1 className="font-semibold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">v2.0</p>
              </div>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100"
          >
            {isExpanded ? (
              <RiCloseLine className="w-5 h-5" />
            ) : (
              <RiMenuLine className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Search */}
        {isExpanded && (
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                id="sidebar-search"
                type="text"
                placeholder="Поиск... (Ctrl+K)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="pl-10 pr-4 py-2 w-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 h-6 w-6"
                >
                  <RiCloseLine className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {filteredNavigation.map((group) => (
            <div key={group.id}>
              {isExpanded && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {group.label}
                </h3>
              )}
              
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                  
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`
                          flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200
                          ${isActive 
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }
                          ${!isExpanded && 'justify-center'}
                        `}
                        title={!isExpanded ? item.label : undefined}
                      >
                        <span className={`flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>
                          {item.icon}
                        </span>
                        
                        {isExpanded && (
                          <>
                            <span className="flex-1 font-medium">{item.label}</span>
                            {item.badge && (
                              <Badge variant="secondary" className="ml-auto">
                                {item.badge}
                              </Badge>
                            )}
                          </>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              
              {isExpanded && group.id !== filteredNavigation[filteredNavigation.length - 1].id && (
                <Separator className="mt-4" />
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          {/* Quick Actions */}
          {isExpanded && (
            <div className="mb-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <RiSettings4Line className="w-4 h-4 mr-2" />
                  Настройки
                </Button>
                <Button variant="outline" size="sm">
                  <RiNotificationLine className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
          
          {/* User Info & Logout */}
          <div className="flex items-center space-x-3">
            {isExpanded && session?.user && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {session.user.name || session.user.email}
                </p>
                <p className="text-xs text-gray-500 capitalize">
                  {session.user.role}
                </p>
              </div>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={`p-2 hover:bg-red-50 hover:text-red-600 ${!isExpanded && 'w-full justify-center'}`}
              title={!isExpanded ? 'Выйти' : undefined}
            >
              <RiLogoutBoxLine className="w-5 h-5" />
              {isExpanded && <span className="ml-2">Выйти</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default EnhancedSidebar;