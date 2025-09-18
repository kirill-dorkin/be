'use client';

import { ReactNode, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, X, Home, Package, ShoppingCart, Users, Settings, BarChart3 } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import useDashboardPrefetch from '@/hooks/useDashboardPrefetch';

interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  current?: boolean;
}

interface AdaptiveLayoutProps {
  children: ReactNode;
  userRole?: 'admin' | 'worker' | 'user';
}

const getNavigationByRole = (role: string): NavigationItem[] => {
  const baseNavigation: NavigationItem[] = [
    { name: 'Главная', href: `/${role}/dashboard`, icon: Home },
  ];

  if (role === 'admin') {
    return [
      ...baseNavigation,
      { name: 'Товары', href: '/admin/products', icon: Package },
      { name: 'Заказы', href: '/admin/orders', icon: ShoppingCart },
      { name: 'Пользователи', href: '/admin/users', icon: Users },
      { name: 'Аналитика', href: '/admin/analytics', icon: BarChart3 },
      { name: 'Настройки', href: '/admin/settings', icon: Settings },
    ];
  }

  if (role === 'worker') {
    return [
      ...baseNavigation,
      { name: 'Задачи', href: '/worker/tasks', icon: Package },
      { name: 'Заказы', href: '/worker/orders', icon: ShoppingCart },
      { name: 'Устройства', href: '/worker/devices', icon: Settings },
    ];
  }

  return baseNavigation;
};

export default function AdaptiveLayout({ children, userRole }: AdaptiveLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isTV, setIsTV] = useState(false);
  const { prefetchSpecificRoute, prefetchDashboardPages } = useDashboardPrefetch();

  const role = userRole || session?.user?.role || 'user';
  const navigation = getNavigationByRole(role);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsLargeScreen(width >= 1440);
      setIsTV(width >= 1920); // TV/Large monitor detection
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Предзагрузка страниц
  useEffect(() => {
    prefetchDashboardPages();
  }, [prefetchDashboardPages]);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/auth/signin');
      return;
    }

    if (userRole && session.user?.role !== userRole) {
      router.push('/');
    }
  }, [session, status, router, userRole]);

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session || (userRole && session.user?.role !== userRole)) {
    return null;
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo/Header */}
      <div className={cn(
        "flex items-center justify-between border-b",
        isTV ? "p-8" : isLargeScreen ? "p-6" : "p-4"
      )}>
        <div className="flex items-center space-x-2">
          <BarChart3 className={cn(
            "text-blue-600",
            isTV ? "h-12 w-12" : isLargeScreen ? "h-10 w-10" : "h-8 w-8"
          )} />
          <span className={cn(
            "font-bold text-gray-900",
            isTV ? "text-3xl" : isLargeScreen ? "text-2xl" : "text-xl"
          )}>Dashboard</span>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
            className="md:hidden"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1 space-y-2",
        isTV ? "px-8 py-8 space-y-4" : isLargeScreen ? "px-6 py-8 space-y-3" : "px-4 py-6"
      )}>
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => isMobile && setSidebarOpen(false)}
              onMouseEnter={() => prefetchSpecificRoute(item.href)}
              className={cn(
                'flex items-center rounded-lg transition-colors',
                'hover:bg-gray-100 hover:text-gray-900',
                'focus:outline-none focus:ring-2 focus:ring-blue-500',
                isTV ? 'px-6 py-4 text-lg font-medium' : isLargeScreen ? 'px-4 py-3 text-base font-medium' : 'px-3 py-2 text-sm font-medium',
                item.current
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600'
              )}
            >
              <Icon className={cn(
                "mr-3",
                isTV ? "h-7 w-7" : isLargeScreen ? "h-6 w-6" : "h-5 w-5"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className={cn(
        "border-t",
        isTV ? "p-8" : isLargeScreen ? "p-6" : "p-4"
      )}>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className={cn(
              "rounded-full bg-blue-600 flex items-center justify-center",
              isTV ? "h-12 w-12" : isLargeScreen ? "h-10 w-10" : "h-8 w-8"
            )}>
              <span className={cn(
                "font-medium text-white",
                isTV ? "text-lg" : isLargeScreen ? "text-base" : "text-sm"
              )}>
                {session.user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-medium text-gray-900 truncate",
              isTV ? "text-lg" : isLargeScreen ? "text-base" : "text-sm"
            )}>
              {session.user?.name || 'Пользователь'}
            </p>
            <p className={cn(
              "text-gray-500 capitalize",
              isTV ? "text-sm" : isLargeScreen ? "text-sm" : "text-xs"
            )}>
              {role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className={cn(
          "hidden md:flex md:flex-col",
          isTV ? "md:w-80" : isLargeScreen ? "md:w-72" : "md:w-64"
        )}>
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={cn(
          "bg-white border-b border-gray-200",
          isTV ? "px-8 py-6" : isLargeScreen ? "px-6 py-5" : "px-4 lg:px-6 py-4"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Hamburger Menu Button */}
              <Button
                variant="ghost"
                size={isTV ? "default" : "sm"}
                onClick={() => setSidebarOpen(true)}
                className={cn(
                  'flex items-center justify-center',
                  isMobile ? 'md:hidden' : 'hidden'
                )}
              >
                <Menu className={cn(
                  isTV ? "h-6 w-6" : "h-5 w-5"
                )} />
              </Button>
              
              {/* Page Title */}
              <h1 className={cn(
                "font-semibold text-gray-900",
                isTV ? "text-3xl" : isLargeScreen ? "text-2xl" : "text-lg lg:text-xl"
              )}>
                {role === 'admin' && 'Панель администратора'}
                {role === 'worker' && 'Рабочая панель'}
                {role === 'user' && 'Пользовательская панель'}
              </h1>
            </div>

            {/* Header Actions */}
            <div className="flex items-center space-x-2">
              {/* Additional header content can go here */}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className={cn(
            "mx-auto",
            isTV ? "p-8 max-w-none" : isLargeScreen ? "p-6 max-w-8xl" : "p-4 lg:p-6 max-w-7xl"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}