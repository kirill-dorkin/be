"use client";

import { lazy } from "react";
import { withLazy } from "@/components/ui/LazyComponent";

// Lazy loading для тяжелых компонентов
export const LazyCartDropdown = withLazy(
  () => import("@/components/CartDropdown"),
  <div className="w-8 h-8 animate-pulse bg-gray-200 rounded" />
);

export const LazyFavoritesDropdown = withLazy(
  () => import("@/components/FavoritesDropdown"),
  <div className="w-8 h-8 animate-pulse bg-gray-200 rounded" />
);

export const LazyFavoritesSheet = withLazy(
  () => import("@/components/FavoritesSheet"),
  <div className="w-full h-32 animate-pulse bg-gray-200 rounded" />
);

// Lazy loading для аналитики
export const LazyAnalyticsFilters = withLazy(
  () => import("@/components/analytics/AnalyticsFilters"),
  <div className="w-full h-64 animate-pulse bg-gray-200 rounded" />
);

export const LazyDataTable = withLazy(
  () => import("@/components/analytics/DataTable"),
  <div className="w-full h-48 animate-pulse bg-gray-200 rounded" />
);

// Lazy loading для чартов
export const LazyBarChart = withLazy(
  () => import("@/components/charts/BarChart"),
  <div className="w-full h-48 animate-pulse bg-gray-200 rounded" />
);

export const LazyLineChart = withLazy(
  () => import("@/components/charts/LineChart"),
  <div className="w-full h-48 animate-pulse bg-gray-200 rounded" />
);

export const LazyPieChart = withLazy(
  () => import("@/components/charts/PieChart"),
  <div className="w-full h-48 animate-pulse bg-gray-200 rounded" />
);

// Lazy loading для админ компонентов
export const LazyAdminDashboard = withLazy(
  () => import("@/components/admin/AdminDashboard"),
  <div className="w-full h-screen animate-pulse bg-gray-200 rounded" />
);

export const LazyUserManagement = withLazy(
  () => import("@/components/admin/UserManagement"),
  <div className="w-full h-96 animate-pulse bg-gray-200 rounded" />
);

// Lazy loading для магазина
export const LazyProductCatalog = withLazy(
  () => import("@/components/shop/ProductCatalog"),
  <div className="w-full h-96 animate-pulse bg-gray-200 rounded" />
);

export const LazyShoppingCart = withLazy(
  () => import("@/components/shop/ShoppingCart"),
  <div className="w-full h-64 animate-pulse bg-gray-200 rounded" />
);

// Lazy loading для PWA компонентов
export const LazyPWAInstaller = withLazy(
  () => import("@/components/pwa/PWAInstaller"),
  <div className="w-8 h-8 animate-pulse bg-gray-200 rounded" />
);

export const LazyCacheManager = withLazy(
  () => import("@/components/pwa/CacheManager"),
  <div className="w-full h-32 animate-pulse bg-gray-200 rounded" />
);

// Lazy loading для форм
export const LazyRequestForm = withLazy(
  () => import("@/components/RequestForm"),
  <div className="w-full h-64 animate-pulse bg-gray-200 rounded" />
);

export const LazyPhoneInputField = withLazy(
  () => import("@/components/PhoneInputField"),
  <div className="w-full h-10 animate-pulse bg-gray-200 rounded" />
);

// Lazy loading для UI компонентов
export const LazyLoadingScreen = withLazy(
  () => import("@/components/LoadingScreen"),
  <div className="w-full h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
  </div>
);