import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ContentPage, ContentStats, ContentFilters } from '../types';

export const useContentData = () => {
  const [pages, setPages] = useState<ContentPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ContentStats>({
    totalPages: 0,
    publishedPages: 0,
    draftPages: 0,
    archivedPages: 0,
    totalViews: 0
  });
  
  const [filters, setFilters] = useState<ContentFilters>({
    searchTerm: '',
    statusFilter: 'all',
    templateFilter: 'all'
  });
  
  const [selectedPages, setSelectedPages] = useState<string[]>([]);

  const fetchPages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/content');
      if (!response.ok) throw new Error('Ошибка загрузки страниц');
      
      const data = await response.json();
      setPages(data.pages || []);
      setStats(data.stats || {
        totalPages: 0,
        publishedPages: 0,
        draftPages: 0,
        archivedPages: 0,
        totalViews: 0
      });
    } catch (error) {
      console.error('Ошибка загрузки страниц:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить страницы',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  // Фильтрация страниц
  const filteredPages = pages.filter(page => {
    const matchesSearch = page.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         page.slug.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         page.content.toLowerCase().includes(filters.searchTerm.toLowerCase());
    const matchesStatus = filters.statusFilter === 'all' || page.status === filters.statusFilter;
    const matchesTemplate = filters.templateFilter === 'all' || page.template === filters.templateFilter;
    
    return matchesSearch && matchesStatus && matchesTemplate;
  });

  const updateFilters = useCallback((newFilters: Partial<ContentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const togglePageSelection = useCallback((pageId: string) => {
    setSelectedPages(prev => 
      prev.includes(pageId) 
        ? prev.filter(id => id !== pageId)
        : [...prev, pageId]
    );
  }, []);

  const selectAllPages = useCallback(() => {
    setSelectedPages(filteredPages.map(page => page._id));
  }, [filteredPages]);

  const clearSelection = useCallback(() => {
    setSelectedPages([]);
  }, []);

  return {
    pages,
    filteredPages,
    loading,
    stats,
    filters,
    selectedPages,
    updateFilters,
    togglePageSelection,
    selectAllPages,
    clearSelection,
    refreshPages: fetchPages
  };
};