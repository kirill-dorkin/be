import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Globe, Edit, Archive, Eye } from 'lucide-react';
import { ContentStats as ContentStatsType } from '../types';

interface ContentStatsProps {
  stats: ContentStatsType;
  loading?: boolean;
}

export function ContentStats({ stats, loading = false }: ContentStatsProps) {
  const statItems = [
    {
      title: 'Всего страниц',
      value: stats.totalPages,
      icon: FileText,
      color: 'text-blue-600'
    },
    {
      title: 'Опубликовано',
      value: stats.publishedPages,
      icon: Globe,
      color: 'text-green-600'
    },
    {
      title: 'Черновики',
      value: stats.draftPages,
      icon: Edit,
      color: 'text-yellow-600'
    },
    {
      title: 'В архиве',
      value: stats.archivedPages,
      icon: Archive,
      color: 'text-red-600'
    },
    {
      title: 'Всего просмотров',
      value: stats.totalViews,
      icon: Eye,
      color: 'text-purple-600'
    }
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 bg-gray-200 rounded animate-pulse" />
              </CardTitle>
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {statItems.map((item, index) => {
        const Icon = item.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${item.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {item.value.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}