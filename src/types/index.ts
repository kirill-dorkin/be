// Общие типы для приложения

export interface SearchParams {
  page?: string
  perPage?: string
  search?: string
  status?: string
  priority?: string
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PageProps {
  searchParams: Promise<SearchParams>
}

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: 'admin' | 'worker' | 'client'
  isActive: boolean
  createdAt: Date
  lastLogin?: Date
}

export interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  assignedTo: string
  createdAt: Date
  updatedAt: Date
  dueDate?: Date
  estimatedHours?: number
  actualHours?: number
  clientName?: string
  deviceType?: string
  issueDescription?: string
}

export interface PaginationProps {
  page: number
  perPage: number
  totalItems: number
  totalPages: number
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface SelectOption {
  value: string
  label: string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'tel' | 'textarea' | 'select' | 'date' | 'number'
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    message?: string
  }
}