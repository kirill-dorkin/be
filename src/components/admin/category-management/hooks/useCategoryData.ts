'use client';

import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { ICategory } from '@/models/Category';
import { CategoryStats } from '../types';

export const useCategoryData = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState<CategoryStats>({
    totalCategories: 0,
    activeCategories: 0,
    servicesCount: 0,
    productsCount: 0
  });

  const fetchCategories = useCallback(async (page = 1, searchTerm = '') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm })
      });

      const response = await fetch(`/api/categories?${params}`);
      const data = await response.json();

      if (data.success) {
        setCategories(data.categories || []);
        setCurrentPage(data.pagination?.currentPage || 1);
        setTotalPages(data.pagination?.totalPages || 1);
        
        if (data.stats) {
          setStats({
            totalCategories: data.stats.totalCategories || 0,
            activeCategories: data.stats.activeCategories || 0,
            servicesCount: data.stats.servicesCount || 0,
            productsCount: data.stats.productsCount || 0
          });
        }
      } else {
        toast.error(data.error || 'Ошибка при загрузке категорий');
      }
    } catch (error) {
      console.error('Ошибка при загрузке категорий:', error);
      toast.error('Ошибка при загрузке категорий');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    currentPage,
    totalPages,
    stats,
    fetchCategories,
    setCurrentPage
  };
};