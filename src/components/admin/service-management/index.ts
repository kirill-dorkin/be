// Main component
export { default } from './ServiceManagement';
export { default as ServiceManagement } from './ServiceManagement';

// Sub-components
export { default as ServiceStatsComponent } from './ServiceStats';
export { default as ServiceFormComponent } from './ServiceForm';

// Hooks
export { useServices, useCategories, useServiceStats } from './hooks';

// API functions
export {
  fetchServices,
  fetchCategories,
  fetchServiceStats,
  createService,
  updateService,
  deleteService,
} from './api';

// Utilities
export {
  formatPrice,
  formatDuration,
  getCategoryName,
  validateServiceForm,
} from './utils';

// Types
export type {
  IService as ServiceType,
  ICategory as CategoryType,
  ServiceStats as ServiceStatsType,
  ServiceFormData as ServiceFormDataType,
} from './types';