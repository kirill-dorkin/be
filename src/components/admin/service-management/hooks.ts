import { useState, useEffect, useCallback } from 'react';
import { IService, ICategory, ServiceStats, ServiceFormData } from './types';
import { fetchServices, fetchCategories, fetchServiceStats, createService, updateService, deleteService } from './api';
import { useToast } from '@/hooks/use-toast';

export const useServices = () => {
  const [services, setServices] = useState<IService[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadServices = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchServices();
      setServices(data);
    } catch (error) {
      console.error('Error loading services:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить услуги',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleCreateService = useCallback(async (serviceData: ServiceFormData) => {
    try {
      const newService = await createService(serviceData);
      setServices(prev => [...prev, newService]);
      toast({
        title: 'Успех',
        description: 'Услуга успешно создана',
      });
      return newService;
    } catch (error) {
      console.error('Error creating service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать услугу',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const handleUpdateService = useCallback(async (id: string, serviceData: Partial<IService>) => {
    try {
      const updatedService = await updateService(id, serviceData);
      setServices(prev => prev.map(service => 
        service._id === id ? updatedService : service
      ));
      toast({
        title: 'Успех',
        description: 'Услуга успешно обновлена',
      });
      return updatedService;
    } catch (error) {
      console.error('Error updating service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить услугу',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  const handleDeleteService = useCallback(async (id: string) => {
    try {
      await deleteService(id);
      setServices(prev => prev.filter(service => service._id !== id));
      toast({
        title: 'Успех',
        description: 'Услуга успешно удалена',
      });
    } catch (error) {
      console.error('Error deleting service:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить услугу',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  return {
    services,
    loading,
    loadServices,
    handleCreateService,
    handleUpdateService,
    handleDeleteService,
  };
};

export const useCategories = () => {
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить категории',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  return {
    categories,
    loading,
    loadCategories,
  };
};

export const useServiceStats = () => {
  const [stats, setStats] = useState<ServiceStats>({
    totalServices: 0,
    activeServices: 0,
    totalRevenue: 0,
    averagePrice: 0,
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchServiceStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading service stats:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить статистику',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    loadStats,
  };
};