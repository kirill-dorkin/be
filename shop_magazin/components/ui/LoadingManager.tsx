"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Spinner from './spinner';

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, isLoading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

// Провайдер для управления состояниями загрузки
export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});
  
  const setLoading = useCallback((key: string, isLoading: boolean) => {
    setLoadingStates(prev => {
      if (isLoading) {
        return { ...prev, [key]: true };
      } else {
        const newState = { ...prev };
        delete newState[key];
        return newState;
      }
    });
  }, []);
  
  const isLoading = useCallback((key: string) => {
    return loadingStates[key] || false;
  }, [loadingStates]);
  
  const isAnyLoading = useCallback(() => {
    return Object.keys(loadingStates).length > 0;
  }, [loadingStates]);
  
  return (
    <LoadingContext.Provider value={{ loadingStates, setLoading, isLoading, isAnyLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

// Хук для использования контекста загрузки
export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

// Компонент глобального индикатора загрузки
export const GlobalLoadingIndicator: React.FC = () => {
  const { isAnyLoading } = useLoading();
  
  if (!isAnyLoading()) return null;
  
  return (
    <div className="fixed top-0 left-0 w-full h-1 z-50">
      <div className="h-full bg-blue-500 animate-pulse" />
    </div>
  );
};

// HOC для автоматического управления загрузкой
export function withLoading<T extends object>(
  Component: React.ComponentType<T>,
  loadingKey: string
) {
  return function LoadingWrapper(props: T) {
    const { setLoading } = useLoading();
    const [mounted, setMounted] = useState(false);
    
    useEffect(() => {
      setLoading(loadingKey, true);
      setMounted(true);
      
      return () => {
        setLoading(loadingKey, false);
      };
    }, [setLoading]);
    
    useEffect(() => {
      if (mounted) {
        // Имитируем завершение загрузки компонента
        const timer = setTimeout(() => {
          setLoading(loadingKey, false);
        }, 100);
        
        return () => clearTimeout(timer);
      }
    }, [mounted, setLoading]);
    
    return <Component {...props} />;
  };
}

// Компонент для отображения состояния загрузки
export const LoadingOverlay: React.FC<{
  isLoading: boolean;
  children: React.ReactNode;
  loadingText?: string;
}> = ({ isLoading, children, loadingText = 'Загрузка...' }) => {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="flex flex-col items-center space-y-2">
            <Spinner className="w-6 h-6" />
            <span className="text-sm text-gray-600">{loadingText}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// Хук для асинхронных операций с автоматическим управлением загрузкой
export const useAsyncOperation = (key: string) => {
  const { setLoading } = useLoading();
  
  const execute = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      try {
        setLoading(key, true);
        const result = await operation();
        return result;
      } finally {
        setLoading(key, false);
      }
    },
    [key, setLoading]
  );
  
  return { execute };
};

// Компонент для скелетона загрузки
export const LoadingSkeleton: React.FC<{
  lines?: number;
  className?: string;
}> = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="h-4 bg-gray-200 rounded animate-pulse"
          style={{ width: `${Math.random() * 40 + 60}%` }}
        />
      ))}
    </div>
  );
};

// Компонент для прогрессивной загрузки изображений
export const ProgressiveImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
  placeholder?: string;
}> = ({ src, alt, className = '', placeholder }) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!loaded && !error && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {placeholder && !loaded && !error && (
        <img
          src={placeholder}
          alt={alt}
          className="absolute inset-0 w-full h-full object-cover filter blur-sm"
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500 text-sm">Ошибка загрузки</span>
        </div>
      )}
    </div>
  );
};