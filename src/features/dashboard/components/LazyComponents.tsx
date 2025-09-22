import { createLazyComponent } from "@/shared/lib/withLazyLoading";
import { 
  TableFallback, 
  DashboardFallback, 
  ListFallback, 
  CardFallback 
} from "@/shared/ui/fallbacks/OptimizedFallbacks";

// Lazy загрузка тяжелых компонентов dashboard с оптимизированными fallback
export const LazyTaskTable = createLazyComponent(
  () => import("@/features/dashboard/TaskTable"),
  <TableFallback rows={5} columns={4} />
);

export const LazyUserTable = createLazyComponent(
  () => import("@/features/dashboard/UserTable"),
  <TableFallback rows={8} columns={5} />
);

export const LazyTaskReport = createLazyComponent(
  () => import("@/features/dashboard/TaskReport"),
  <DashboardFallback />
);

export const LazyUserList = createLazyComponent(
  () => import("@/features/dashboard/UserList"),
  <ListFallback items={6} />
);

// Дополнительные компоненты для dashboard
export const LazyListCard = createLazyComponent(
  () => import("@/features/dashboard/ListCard"),
  <CardFallback />
);

// Альтернативные компоненты из components/dashboard
export const LazyDashboardTaskTable = createLazyComponent(
  () => import("@/components/dashboard/TaskTable"),
  <TableFallback rows={5} columns={4} />
);

export const LazyDashboardUserTable = createLazyComponent(
  () => import("@/components/dashboard/UserTable"),
  <TableFallback rows={8} columns={5} />
);