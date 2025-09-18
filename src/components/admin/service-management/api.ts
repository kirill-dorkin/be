import { IService, ICategory, ServiceStats } from './types';

export const fetchServices = async (): Promise<IService[]> => {
  const response = await fetch('/api/admin/services');
  if (!response.ok) {
    throw new Error('Failed to fetch services');
  }
  return response.json();
};

export const fetchCategories = async (): Promise<ICategory[]> => {
  const response = await fetch('/api/admin/categories');
  if (!response.ok) {
    throw new Error('Failed to fetch categories');
  }
  return response.json();
};

export const fetchServiceStats = async (): Promise<ServiceStats> => {
  const response = await fetch('/api/admin/services/stats');
  if (!response.ok) {
    throw new Error('Failed to fetch service stats');
  }
  return response.json();
};

export const createService = async (serviceData: Omit<IService, '_id' | 'createdAt' | 'updatedAt'>): Promise<IService> => {
  const response = await fetch('/api/admin/services', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(serviceData),
  });
  if (!response.ok) {
    throw new Error('Failed to create service');
  }
  return response.json();
};

export const updateService = async (id: string, serviceData: Partial<IService>): Promise<IService> => {
  const response = await fetch(`/api/admin/services/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(serviceData),
  });
  if (!response.ok) {
    throw new Error('Failed to update service');
  }
  return response.json();
};

export const deleteService = async (id: string): Promise<void> => {
  const response = await fetch(`/api/admin/services/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete service');
  }
};