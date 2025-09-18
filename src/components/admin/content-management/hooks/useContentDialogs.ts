import { useState, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import { ContentPage, ContentFormData, ContentDialogStates } from '../types';

export const useContentDialogs = () => {
  const [dialogStates, setDialogStates] = useState<ContentDialogStates>({
    isCreateDialogOpen: false,
    isEditDialogOpen: false,
    isDeleteDialogOpen: false
  });
  
  const [currentPage, setCurrentPage] = useState<ContentPage | null>(null);
  const [pageToDelete, setPageToDelete] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('content');
  
  const [formData, setFormData] = useState<ContentFormData>({
    title: '',
    slug: '',
    content: '',
    metaDescription: '',
    metaKeywords: '',
    status: 'draft',
    isPublic: true,
    tags: [],
    featuredImage: '',
    template: 'default'
  });

  const resetForm = useCallback(() => {
    setFormData({
      title: '',
      slug: '',
      content: '',
      metaDescription: '',
      metaKeywords: '',
      status: 'draft',
      isPublic: true,
      tags: [],
      featuredImage: '',
      template: 'default'
    });
    setActiveTab('content');
  }, []);

  const openCreateDialog = useCallback(() => {
    resetForm();
    setCurrentPage(null);
    setDialogStates(prev => ({ ...prev, isCreateDialogOpen: true }));
  }, [resetForm]);

  const closeCreateDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, isCreateDialogOpen: false }));
    resetForm();
  }, [resetForm]);

  const openEditDialog = useCallback((page: ContentPage) => {
    setCurrentPage(page);
    setFormData({
      title: page.title,
      slug: page.slug,
      content: page.content,
      metaDescription: page.metaDescription || '',
      metaKeywords: page.metaKeywords || '',
      status: page.status,
      isPublic: page.isPublic,
      tags: page.tags,
      featuredImage: page.featuredImage || '',
      template: page.template
    });
    setDialogStates(prev => ({ ...prev, isEditDialogOpen: true }));
  }, []);

  const closeEditDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, isEditDialogOpen: false }));
    setCurrentPage(null);
    resetForm();
  }, [resetForm]);

  const openDeleteDialog = useCallback((pageId: string) => {
    setPageToDelete(pageId);
    setDialogStates(prev => ({ ...prev, isDeleteDialogOpen: true }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDialogStates(prev => ({ ...prev, isDeleteDialogOpen: false }));
    setPageToDelete(null);
  }, []);

  const updateFormData = useCallback((updates: Partial<ContentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  }, []);

  const generateSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9а-я]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }, []);

  const handleTitleChange = useCallback((title: string) => {
    updateFormData({ title });
    if (!formData.slug || formData.slug === generateSlug(formData.title)) {
      updateFormData({ slug: generateSlug(title) });
    }
  }, [formData.slug, formData.title, generateSlug, updateFormData]);

  const addTag = useCallback((tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      updateFormData({ tags: [...formData.tags, tag] });
    }
  }, [formData.tags, updateFormData]);

  const removeTag = useCallback((tagToRemove: string) => {
    updateFormData({ tags: formData.tags.filter(tag => tag !== tagToRemove) });
  }, [formData.tags, updateFormData]);

  const createPage = useCallback(async (refreshPages: () => Promise<void>) => {
    try {
      const response = await fetch('/api/admin/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Ошибка создания страницы');
      
      toast({
        title: 'Успех',
        description: 'Страница успешно создана'
      });
      
      closeCreateDialog();
      await refreshPages();
    } catch (error) {
      console.error('Ошибка создания страницы:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать страницу',
        variant: 'destructive'
      });
    }
  }, [formData, closeCreateDialog]);

  const updatePage = useCallback(async (refreshPages: () => Promise<void>) => {
    if (!currentPage) return;
    
    try {
      const response = await fetch(`/api/admin/content/${currentPage._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) throw new Error('Ошибка обновления страницы');
      
      toast({
        title: 'Успех',
        description: 'Страница успешно обновлена'
      });
      
      closeEditDialog();
      await refreshPages();
    } catch (error) {
      console.error('Ошибка обновления страницы:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось обновить страницу',
        variant: 'destructive'
      });
    }
  }, [currentPage, formData, closeEditDialog]);

  const deletePage = useCallback(async (refreshPages: () => Promise<void>) => {
    if (!pageToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/content/${pageToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Ошибка удаления страницы');
      
      toast({
        title: 'Успех',
        description: 'Страница успешно удалена'
      });
      
      closeDeleteDialog();
      await refreshPages();
    } catch (error) {
      console.error('Ошибка удаления страницы:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось удалить страницу',
        variant: 'destructive'
      });
    }
  }, [pageToDelete, closeDeleteDialog]);

  return {
    dialogStates,
    currentPage,
    pageToDelete,
    activeTab,
    formData,
    setActiveTab,
    updateFormData,
    handleTitleChange,
    addTag,
    removeTag,
    openCreateDialog,
    closeCreateDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    createPage,
    updatePage,
    deletePage,
    resetForm
  };
};