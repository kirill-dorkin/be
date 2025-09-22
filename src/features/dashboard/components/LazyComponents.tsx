'use client';

import { lazy } from 'react';

// Lazy-loaded dashboard components
export const DashboardOverview = lazy(() => import('../DashboardSummary').then(module => ({ default: module.default })));

export const UserManagement = lazy(() => import('../UserTable').then(module => ({ default: module.default })));

export const SystemSettings = lazy(() => import('../DashboardContainer').then(module => ({ default: module.default })));

export const ReportsSection = lazy(() => import('../TaskReport').then(module => ({ default: module.default })));

export const AnalyticsPanel = lazy(() => import('../DashboardContent').then(module => ({ default: module.default })));

// Default export
export default DashboardOverview;