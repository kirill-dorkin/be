'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Search, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { IService } from '@/models/Service';
import { IProduct } from '@/models/Product';
import { usePriceData, usePriceDialog } from './hooks';
import { PriceStats } from './PriceStats';
import { ServicesTable } from './ServicesTable';
import { ProductsTable } from './ProductsTable';
import { PriceDialog } from './PriceDialog';
import { PriceUpdateData } from './types';

const PriceManagement = () => {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'services' | 'products'>('services');
  
  const {
    services,
    products,
    stats,
    loading,
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    fetchServices,
    fetchProducts,
    fetchStats,
    updatePrice,
  } = usePriceData();

  const {
    isPriceDialogOpen,
    selectedItem,
    selectedItemType,
    priceFormData,
    setPriceFormData,
    openPriceDialog,
    closePriceDialog,
  } = usePriceDialog();

  // Проверка прав доступа
  useEffect(() => {
    if (session?.user && !['admin', 'manager'].includes(session.user.role || '')) {
      toast.error('У вас нет прав для управления ценами');
      return;
    }
  }, [session]);

  // Загрузка данных при монтировании
  useEffect(() => {
    if (session?.user?.id) {
      fetchStats();
      if (activeTab === 'services') {
        fetchServices();
      } else {
        fetchProducts();
      }
    }
  }, [session?.user?.id, activeTab, fetchStats, fetchServices, fetchProducts]);

  // Обновление данных при изменении поискового запроса
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (activeTab === 'services') {
        fetchServices(1);
      } else {
        fetchProducts(1);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, activeTab, fetchServices, fetchProducts]);

  const handleUpdatePrice = async () => {
    if (!selectedItem || !priceFormData.newPrice) {
      toast.error('Пожалуйста, введите новую цену');
      return;
    }

    const updateData: PriceUpdateData = {
      type: selectedItemType,
      itemId: selectedItem._id?.toString() || '',
      newPrice: priceFormData.newPrice,
      reason: priceFormData.reason,
    };

    const success = await updatePrice(updateData);
    if (success) {
      closePriceDialog();
    }
  };

  const handleServiceEditPrice = (service: IService) => {
    openPriceDialog(service, 'service');
  };

  const handleProductEditPrice = (product: IProduct) => {
    openPriceDialog(product, 'product');
  };

  const handleRefresh = () => {
    fetchStats();
    if (activeTab === 'services') {
      fetchServices(currentPage);
    } else {
      fetchProducts(currentPage);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'services' | 'products');
    setSearchTerm('');
  };

  const handlePagination = (direction: 'prev' | 'next') => {
    const newPage = direction === 'prev' ? currentPage - 1 : currentPage + 1;
    if (activeTab === 'services') {
      fetchServices(newPage);
    } else {
      fetchProducts(newPage);
    }
  };

  if (!session?.user || !['admin', 'manager'].includes(session.user.role || '')) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">У вас нет прав для просмотра этой страницы</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Статистика */}
      <PriceStats stats={stats} loading={loading} />

      {/* Основная карточка */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Управление ценами</CardTitle>
              <CardDescription>
                Управляйте ценами на услуги и товары
              </CardDescription>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Поиск */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Поиск по названию..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Вкладки */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="services">Услуги</TabsTrigger>
              <TabsTrigger value="products">Товары</TabsTrigger>
            </TabsList>

            {/* Вкладка услуг */}
            <TabsContent value="services" className="space-y-4">
              <ServicesTable 
                services={services}
                loading={loading}
                onEditPrice={handleServiceEditPrice}
              />
            </TabsContent>

            {/* Вкладка товаров */}
            <TabsContent value="products" className="space-y-4">
              <ProductsTable 
                products={products}
                loading={loading}
                onEditPrice={handleProductEditPrice}
              />
            </TabsContent>
          </Tabs>

          {/* Пагинация */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Страница {currentPage} из {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePagination('prev')}
                  disabled={currentPage === 1 || loading}
                >
                  Назад
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePagination('next')}
                  disabled={currentPage === totalPages || loading}
                >
                  Вперед
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Диалог обновления цены */}
      <PriceDialog
        isOpen={isPriceDialogOpen}
        onClose={closePriceDialog}
        selectedItem={selectedItem}
        selectedItemType={selectedItemType}
        priceFormData={priceFormData}
        setPriceFormData={setPriceFormData}
        onUpdatePrice={handleUpdatePrice}
      />
    </div>
  );
};

export default PriceManagement;