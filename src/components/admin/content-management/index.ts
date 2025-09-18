// Main component
export { default as ContentManagement } from './ContentManagement';

// Types
export type {
  ContentPage,
  ContentFormData,
  ContentFilters,
  ContentStats,
  ContentDialogStates,
  ContentManagementProps,
  ContentActions
} from './types';
export { TEMPLATES, STATUS_OPTIONS } from './types';

// Hooks
export { useContentData } from './hooks/useContentData';
export { useContentDialogs } from './hooks/useContentDialogs';

// Components
export { ContentStats as ContentStatsComponent } from './components/ContentStats';
export { ContentFilters as ContentFiltersComponent } from './components/ContentFilters';
export { ContentTable } from './components/ContentTable';
export { ContentDialog } from './components/ContentDialog';
export { DeleteDialog } from './components/DeleteDialog';