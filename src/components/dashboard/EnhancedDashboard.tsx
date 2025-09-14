'use client';

import { useState, useEffect, useMemo, useCallback, lazy, Suspense } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import QuickActions from './QuickActions';
import MetricsWidget from './MetricsWidget';
import { useDashboardCache } from '@/hooks/useDashboardCache';

// Lazy loading для тяжелых компонентов
const OptimizedUserTable = lazy(() => import('./OptimizedUserTable'));
const OptimizedTaskTable = lazy(() => import('./OptimizedTaskTable'));
import { 
  RiDashboardLine,
  RiTaskLine,
  RiPieChartLine,
  RiRefreshLine,
  RiAddLine,
  RiEyeLine,
  RiUserLine,
  RiBarChartLine,
  RiSettings4Line
} from 'react-icons/ri';

import Link from 'next/link';
import { ITask } from '@/models/Task';
import { IUser } from '@/models/User';



interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
}

interface TaskMetrics {
  metrics?: {
    totalActiveTasks?: number;
    totalPendingTasks?: number;
    totalInProgressTasks?: number;
    totalCompletedTasks?: number;
    completedToday?: number;
    overallProgress?: number;
  };
}

interface EnhancedDashboardProps {
  page: string;
  perPage: string;
  items: ITask[];
  totalItemsLength: number;
  users: IUser[];
  metrics: TaskMetrics;
}



const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  items,
  users,
  metrics
}) => {

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Инициализация кэша dashboard
  const {
    getCachedTasks,
    getCachedUsers,
    getCachedMetrics,
    setCachedTasks,
    setCachedUsers,
    setCachedMetrics,
    invalidateCache,
    isLoading: cacheLoading
  } = useDashboardCache({ cacheTimeout: 3 * 60 * 1000 }); // 3 минуты кэш

  const refreshData = async () => {
    setIsLoading(true);
    
    try {
      // Инвалидируем кэш для получения свежих данных
      invalidateCache();
      
      // Обновляем кэш новыми данными
      setCachedTasks(items);
      setCachedUsers(users);
      
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setIsLoading(false);
    }
  };
  
  // Эффект для первоначального кэширования данных
  useEffect(() => {
    if (items.length > 0 && !getCachedTasks()) {
      setCachedTasks(items);
    }
    if (users.length > 0 && !getCachedUsers()) {
      setCachedUsers(users);
    }
  }, [items, users, getCachedTasks, getCachedUsers, setCachedTasks, setCachedUsers]);

  // Мемоизированный TabButton для предотвращения лишних ререндеров
  const TabButton = useMemo(() => {
    const Component = ({ value, active, onClick, children }: {
      value: string;
      active: boolean;
      onClick: (value: string) => void;
      children: React.ReactNode;
    }) => (
      <button
        onClick={() => onClick(value)}
        className={`px-3 md:px-4 py-2 rounded-lg font-medium transition-colors duration-200 flex items-center gap-1 md:gap-2 whitespace-nowrap text-sm md:text-base ${
          active 
            ? 'bg-blue-600 text-white' 
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
      >
        {children}
      </button>
    );
    Component.displayName = 'TabButton';
    return Component;
  }, []);

  // Оптимизированный обработчик переключения вкладок
  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  // Мемоизированный StatCard компонент
  const StatCard = useMemo(() => {
    const Component = ({ title, value, change, icon, trend }: StatCardProps) => (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 md:p-6 hover:shadow-md transition-shadow duration-200">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs md:text-sm font-medium text-gray-600 truncate">{title}</p>
            <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{value}</p>
          </div>
          <div className={`p-2 md:p-3 rounded-lg flex-shrink-0 ${
            trend === 'up' ? 'bg-green-100 text-green-600' :
            trend === 'down' ? 'bg-red-100 text-red-600' :
            'bg-blue-100 text-blue-600'
          }`}>
            <div className="w-4 h-4 md:w-5 md:h-5">
              {icon}
            </div>
          </div>
        </div>
        {change && (
          <div className="flex items-center mt-2 md:mt-4">
            <span className={`text-xs md:text-sm font-medium ${
              trend === 'up' ? 'text-green-600' :
              trend === 'down' ? 'text-red-600' :
              'text-gray-600'
            }`}>
              {change}
            </span>
            <span className="text-xs md:text-sm text-gray-500 ml-1 md:ml-2 truncate">по сравнению с прошлым месяцем</span>
          </div>
        )}
      </div>
    );
    Component.displayName = 'StatCard';
    return Component;
  }, []);

  // Получение данных из кэша или использование переданных данных
  const cachedTasks = getCachedTasks();
  const cachedUsers = getCachedUsers();
  const cachedMetrics = getCachedMetrics();
  
  // Использование кэшированных данных если доступны, иначе переданных
  const effectiveTasks = cachedTasks || items;
  const effectiveUsers = cachedUsers || users;
  
  // Мемоизированные данные для таблиц
  const memoizedTaskData = useMemo(() => {
    return effectiveTasks?.slice(0, 5).map((task: ITask) => ({
      id: task._id?.toString() || '',
      title: task.description || 'Без названия',
      description: task.description || '',
      status: (task.status === 'Completed' ? 'completed' : 
              task.status === 'In Progress' ? 'in_progress' : 
              task.status === 'Pending' ? 'pending' : 'cancelled') as 'pending' | 'in_progress' | 'completed' | 'cancelled',
      priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
      assignee: task.workerId ? {
        id: task.workerId.toString(),
        name: 'Worker ' + task.workerId.toString().slice(-4),
        avatar: '/default-avatar.png'
      } : undefined,
      progress: 0,
      dueDate: new Date(task.createdAt).toLocaleDateString(),
      createdAt: new Date(task.createdAt).toLocaleDateString(),
      updatedAt: new Date(task.createdAt).toLocaleDateString()
    })) || [];
  }, [effectiveTasks]);

  const memoizedUserData = useMemo(() => {
    return effectiveUsers?.slice(0, 4).map((user: IUser) => ({
      id: user._id?.toString() || '',
      name: user.name || user.email || 'Unknown',
      email: user.email || '',
      role: user.role || 'user',
      status: 'active' as 'active' | 'inactive',
      avatar: user.image || '/default-avatar.png',
      lastLogin: new Date().toISOString(),
      createdAt: new Date().toISOString()
    })) || [];
  }, [effectiveUsers]);
  
  // Мемоизированные метрики с кэшированием
  const memoizedMetrics = useMemo(() => {
    if (cachedMetrics) return cachedMetrics;
    
    const computedMetrics = {
      totalTasks: effectiveTasks?.length || 0,
      completedTasks: effectiveTasks?.filter(task => task.status === 'Completed').length || 0,
      activeUsers: effectiveUsers?.filter(user => user.role === 'user').length || 0,
      pendingTasks: effectiveTasks?.filter(task => task.status === 'Pending').length || 0
    };
    
    // Кэшируем вычисленные метрики
    setCachedMetrics(computedMetrics);
    return computedMetrics;
  }, [effectiveTasks, effectiveUsers, cachedMetrics, setCachedMetrics]);



  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center gap-2 md:gap-3">
            <RiDashboardLine className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
            Панель управления
          </h1>
          <p className="text-gray-600 mt-1 text-sm md:text-base">
            Добро пожаловать в панель управления
          </p>
        </div>
        
        <div className="flex items-center gap-2 md:gap-3">
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 flex-1 sm:flex-none"
          >
            <RiRefreshLine className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Обновить</span>
            <span className="sm:hidden">Обновить</span>
          </Button>
          
          <Button className="flex items-center gap-2 flex-1 sm:flex-none">
            <RiAddLine className="w-4 h-4" />
            <span className="hidden sm:inline">Быстрое действие</span>
            <span className="sm:hidden">Добавить</span>
          </Button>
        </div>
      </div>

      {/* Metrics Widget */}
      <MetricsWidget />

      {/* Main Content Tabs */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex space-x-1 md:space-x-2 overflow-x-auto pb-2">
          <TabButton value="overview" active={activeTab === 'overview'} onClick={handleTabChange}>
            <RiDashboardLine className="w-4 h-4" />
            Обзор
          </TabButton>
          <TabButton value="tasks" active={activeTab === 'tasks'} onClick={handleTabChange}>
            <RiTaskLine className="w-4 h-4" />
            Задачи
          </TabButton>
          <TabButton value="analytics" active={activeTab === 'analytics'} onClick={handleTabChange}>
            <RiPieChartLine className="w-4 h-4" />
            Аналитика
          </TabButton>
        </div>

        {/* Overview Tab */}
         {activeTab === 'overview' && (
           <div className="space-y-4 md:space-y-6">
           {/* Stats Grid */}
           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
             <StatCard
               title="Всего пользователей"
               value={memoizedMetrics.activeUsers}
               change="+12%"
               icon={<RiUserLine className="w-full h-full" />}
               trend="up"
             />
             <StatCard
               title="Активные задачи"
               value={memoizedMetrics.totalTasks}
               change="+5%"
               icon={<RiTaskLine className="w-full h-full" />}
               trend="up"
             />
             <StatCard
               title="Выполнено сегодня"
               value={memoizedMetrics.completedTasks}
               change="+8%"
               icon={<RiBarChartLine className="w-full h-full" />}
               trend="up"
             />
             <StatCard
               title="Ожидающие задачи"
               value={memoizedMetrics.pendingTasks}
               change="+3%"
               icon={<RiSettings4Line className="w-full h-full" />}
               trend="up"
             />
           </div>
           
           {/* Quick Actions */}
           <QuickActions />

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Оптимизированная таблица задач с Suspense */}
            <div className="col-span-full">
              <Suspense fallback={
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }>
                <OptimizedTaskTable
                  tasks={memoizedTaskData}
                  onView={(task) => console.log('View task:', task)}
                  onEdit={(task) => console.log('Edit task:', task)}
                  loading={false}
                />
              </Suspense>
            </div>

            {/* Оптимизированная таблица пользователей с Suspense */}
            <div className="col-span-full">
              <Suspense fallback={
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              }>
                <OptimizedUserTable
                  users={memoizedUserData}
                  onView={(user) => console.log('View user:', user)}
                  onEdit={(user) => console.log('Edit user:', user)}
                  loading={false}
                />
              </Suspense>
            </div>
          </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <Card>
            <CardHeader>
              <CardTitle>Управление задачами</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <RiTaskLine className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Детальное управление задачами</p>
                <p className="mb-4">Здесь вы можете управлять всеми задачами в системе</p>
                <Link href="/admin/tasks">
                  <Button>
                    Перейти к задачам
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle>Аналитика</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <RiPieChartLine className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">Панель аналитики</p>
                <p className="mb-4">Подробная аналитика и отчеты будут доступны в ближайшее время</p>
                <Button disabled>
                  Скоро будет доступно
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default EnhancedDashboard;