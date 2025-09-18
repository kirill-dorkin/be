export interface ContentPage {
  _id: string;
  title: string;
  slug: string;
  content: string;
  metaDescription?: string;
  metaKeywords?: string;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  views: number;
  tags: string[];
  featuredImage?: string;
  template: 'default' | 'landing' | 'blog' | 'custom';
}

export interface ContentFormData {
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  metaKeywords: string;
  status: 'draft' | 'published' | 'archived';
  isPublic: boolean;
  tags: string[];
  featuredImage: string;
  template: 'default' | 'landing' | 'blog' | 'custom';
}

export interface ContentFilters {
  searchTerm: string;
  statusFilter: string;
  templateFilter: string;
}

export interface ContentStats {
  totalPages: number;
  publishedPages: number;
  draftPages: number;
  archivedPages: number;
  totalViews: number;
}

export interface ContentDialogStates {
  isCreateDialogOpen: boolean;
  isEditDialogOpen: boolean;
  isDeleteDialogOpen: boolean;
}

export interface ContentManagementProps {
  className?: string;
}

export interface ContentActions {
  createPage: (data: ContentFormData) => Promise<void>;
  updatePage: (id: string, data: ContentFormData) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
  refreshPages: () => Promise<void>;
}

export const TEMPLATES = [
  { value: 'default', label: 'Стандартная страница' },
  { value: 'landing', label: 'Лендинг' },
  { value: 'blog', label: 'Блог' },
  { value: 'custom', label: 'Пользовательская' }
] as const;

export const STATUS_OPTIONS = [
  { value: 'draft', label: 'Черновик', color: 'bg-gray-100 text-gray-800' },
  { value: 'published', label: 'Опубликовано', color: 'bg-green-100 text-green-800' },
  { value: 'archived', label: 'Архив', color: 'bg-red-100 text-red-800' }
] as const;