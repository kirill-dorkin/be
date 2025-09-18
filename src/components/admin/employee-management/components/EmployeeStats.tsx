import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  UserCheck,
  Shield,
  Activity
} from 'lucide-react';
import { EmployeeStats as EmployeeStatsType } from '../types';

interface EmployeeStatsProps {
  stats: EmployeeStatsType;
  loading?: boolean;
}

export const EmployeeStats: React.FC<EmployeeStatsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
                <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Всего сотрудников</p>
              <p className="text-2xl font-bold">{stats.totalEmployees}</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Активные</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeEmployees}</p>
            </div>
            <UserCheck className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Администраторы</p>
              <p className="text-2xl font-bold text-red-600">{stats.adminCount}</p>
            </div>
            <Shield className="h-8 w-8 text-red-600" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Сотрудники</p>
              <p className="text-2xl font-bold text-blue-600">{stats.workerCount}</p>
            </div>
            <Activity className="h-8 w-8 text-blue-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};