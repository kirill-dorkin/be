'use server'

interface DashboardMetrics {
  totalTasks: number
  completedTasks: number
  pendingTasks: number
  inProgressTasks: number
  totalUsers: number
  totalRevenue: number
  monthlyGrowth: number
  averageCompletionTime: number // в часах
  customerSatisfaction: number // в процентах
}

export async function getMetricsAction(): Promise<DashboardMetrics> {
  // Заглушка для получения метрик
  // В реальном приложении здесь будет запрос к базе данных с агрегацией
  return {
    totalTasks: 156,
    completedTasks: 98,
    pendingTasks: 34,
    inProgressTasks: 24,
    totalUsers: 1247,
    totalRevenue: 2450000, // в сомах
    monthlyGrowth: 12.5,
    averageCompletionTime: 4.2,
    customerSatisfaction: 94.8
  }
}