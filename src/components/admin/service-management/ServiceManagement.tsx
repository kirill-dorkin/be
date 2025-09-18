'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, Edit, Eye, Trash2 } from 'lucide-react';
import { IService, ServiceFormData } from './types';
import { useServices, useCategories } from './hooks';
import { formatPrice, formatDuration, getCategoryName } from './utils';
import ServiceStats from './ServiceStats';
import ServiceForm from './ServiceForm';

const ServiceManagement: React.FC = () => {
  const { data: session } = useSession();
  const { services, loading, handleCreateService, handleUpdateService, handleDeleteService } = useServices();
  const { categories } = useCategories();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedService, setSelectedService] = useState<IService | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Проверка прав доступа
  if (!session?.user?.role || !['admin', 'manager'].includes(session.user.role)) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">У вас нет прав для просмотра этой страницы.</p>
      </div>
    );
  }

  // Фильтрация услуг
  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getCategoryName(service.category, categories).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Пагинация
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, startIndex + itemsPerPage);

  const handleCreateSubmit = async (formData: ServiceFormData) => {
    setIsSubmitting(true);
    try {
      await handleCreateService(formData);
      setIsCreateDialogOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (formData: ServiceFormData) => {
    if (!selectedService) return;
    
    setIsSubmitting(true);
    try {
      await handleUpdateService(selectedService._id, formData);
      setIsEditDialogOpen(false);
      setSelectedService(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedService) return;
    
    try {
      await handleDeleteService(selectedService._id);
      setIsDeleteDialogOpen(false);
      setSelectedService(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const openEditDialog = (service: IService) => {
    setSelectedService(service);
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (service: IService) => {
    setSelectedService(service);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (service: IService) => {
    setSelectedService(service);
    setIsDeleteDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <ServiceStats />

      {/* Заголовок и кнопка добавления */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Управление услугами</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Добавить услугу
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Добавить новую услугу</DialogTitle>
            </DialogHeader>
            <ServiceForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateDialogOpen(false)}
              isLoading={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Поиск */}
      <Card>
        <CardHeader>
          <CardTitle>Поиск услуг</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, описанию или категории..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Таблица услуг */}
      <Card>
        <CardHeader>
          <CardTitle>Список услуг ({filteredServices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Название</TableHead>
                <TableHead>Категория</TableHead>
                <TableHead>Цена</TableHead>
                <TableHead>Длительность</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Действия</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedServices.map((service) => (
                <TableRow key={service._id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{getCategoryName(service.category, categories)}</TableCell>
                  <TableCell>{formatPrice(service.price)}</TableCell>
                  <TableCell>{formatDuration(service.duration)}</TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                      {service.isActive ? 'Активна' : 'Неактивна'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openViewDialog(service)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(service)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Предыдущая
              </Button>
              <span className="flex items-center px-4">
                Страница {currentPage} из {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Следующая
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог просмотра */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Просмотр услуги</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Название</h3>
                <p>{selectedService.name}</p>
              </div>
              <div>
                <h3 className="font-semibold">Описание</h3>
                <p>{selectedService.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Цена</h3>
                  <p>{formatPrice(selectedService.price)}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Длительность</h3>
                  <p>{formatDuration(selectedService.duration)}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold">Категория</h3>
                <p>{getCategoryName(selectedService.category, categories)}</p>
              </div>
              <div>
                <h3 className="font-semibold">Статус</h3>
                <Badge variant={selectedService.isActive ? 'default' : 'secondary'}>
                  {selectedService.isActive ? 'Активна' : 'Неактивна'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Редактировать услугу</DialogTitle>
          </DialogHeader>
          {selectedService && (
            <ServiceForm
              service={selectedService}
              onSubmit={handleEditSubmit}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedService(null);
              }}
              isLoading={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог удаления */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить услугу</AlertDialogTitle>
            <AlertDialogDescription>
              Вы уверены, что хотите удалить услугу "{selectedService?.name}"?
              Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setSelectedService(null);
            }}>
              Отмена
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ServiceManagement;