'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';
import { IService } from '@/models/Service';
import { IProduct } from '@/models/Product';
import { PriceStats, PriceUpdateData } from './types';

export const usePriceData = () => {
  const { data: session } = useSession();
  const [services, setServices] = useState<IService[]>([]);
  const [products, setProducts] = useState<IProduct[]>([]);
  const [stats, setStats] = useState<PriceStats>({
    totalServices: 0,
    totalProducts: 0,
    avgServicePrice: 0,
    avgProductPrice: 0,
    recentUpdates: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchServices = useCallback(async (page = 1) => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `/api/services?page=${page}&limit=10&search=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки услуг');
      }
      
      const data = await response.json();
      setServices(data.services || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Ошибка загрузки услуг:', error);
      toast.error('Ошибка загрузки услуг');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, searchTerm]);

  const fetchProducts = useCallback(async (page = 1) => {
    if (!session?.user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(
        `/api/products?page=${page}&limit=10&search=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки товаров');
      }
      
      const data = await response.json();
      setProducts(data.products || []);
      setCurrentPage(data.currentPage || 1);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error('Ошибка загрузки товаров:', error);
      toast.error('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id, searchTerm]);

  const fetchStats = useCallback(async () => {
    if (!session?.user?.id) return;
    
    try {
      const response = await fetch('/api/admin/price-stats');
      
      if (!response.ok) {
        throw new Error('Ошибка загрузки статистики');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      toast.error('Ошибка загрузки статистики');
    }
  }, [session?.user?.id]);

  const updatePrice = useCallback(async (updateData: PriceUpdateData) => {
    if (!session?.user?.id) return false;
    
    try {
      const response = await fetch('/api/admin/update-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error('Ошибка обновления цены');
      }
      
      toast.success('Цена успешно обновлена');
      
      // Обновляем данные
      if (updateData.type === 'service') {
        fetchServices(currentPage);
      } else {
        fetchProducts(currentPage);
      }
      fetchStats();
      
      return true;
    } catch (error) {
      console.error('Ошибка обновления цены:', error);
      toast.error('Ошибка обновления цены');
      return false;
    }
  }, [session?.user?.id, currentPage, fetchServices, fetchProducts, fetchStats]);

  return {
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
  };
};

export const usePriceDialog = () => {
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IService | IProduct | null>(null);
  const [selectedItemType, setSelectedItemType] = useState<'service' | 'product'>('service');
  const [priceFormData, setPriceFormData] = useState<{
    newPrice: number;
    reason: string;
  }>({
    newPrice: 0,
    reason: '',
  });

  const openPriceDialog = useCallback((item: IService | IProduct, type: 'service' | 'product') => {
    setSelectedItem(item);
    setSelectedItemType(type);
    const currentPrice = type === 'service' ? (item as IService).cost : (item as IProduct).price;
    setPriceFormData({
      newPrice: currentPrice || 0,
      reason: '',
    });
    setIsPriceDialogOpen(true);
  }, []);

  const closePriceDialog = useCallback(() => {
    setIsPriceDialogOpen(false);
    setSelectedItem(null);
    setPriceFormData({
      newPrice: 0,
      reason: '',
    });
  }, []);

  return {
    isPriceDialogOpen,
    selectedItem,
    selectedItemType,
    priceFormData,
    setPriceFormData,
    openPriceDialog,
    closePriceDialog,
  };
};