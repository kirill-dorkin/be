import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  UserCheck,
  Mail,
  ShieldCheck
} from 'lucide-react';
import { UserStats as IUserStats } from '../types';

interface UserStatsProps {
  stats: IUserStats;
}

export const UserStats = ({ stats }: UserStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Всего пользователей</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
          <p className="text-xs text-muted-foreground">
            Новых за месяц: {stats.newUsersThisMonth}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Активные</CardTitle>
          <UserCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
          <p className="text-xs text-muted-foreground">
            Заблокированных: {stats.inactiveUsers}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Подтвержденные</CardTitle>
          <Mail className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.verifiedUsers}</div>
          <p className="text-xs text-muted-foreground">
            Неподтвержденных: {stats.unverifiedUsers}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Администраторы</CardTitle>
          <ShieldCheck className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.adminUsers}</div>
          <p className="text-xs text-muted-foreground">
            Модераторов: {stats.moderatorUsers}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};