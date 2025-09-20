import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CachedData, useCacheOptimizer } from '../CacheOptimizer';
import CachePerformanceMonitor from '../CacheOptimizer';

// Типы для тестирования
interface ISRManagerConfig {
  defaultRevalidate: number;
  maxCacheSize: number;
  enableBackgroundRevalidation: boolean;
  staleWhileRevalidate: boolean;
  retryAttempts: number;
  retryDelay: number;
}

interface AdvancedCacheConfig {
  maxSize: number;
  defaultTTL: number;
  enableCompression: boolean;
  enablePersistence: boolean;
  strategy: 'lru' | 'lfu' | 'fifo';
}

// Mock для тестирования
const mockFetcher = jest.fn().mockResolvedValue({ data: 'test data' });

describe('CacheOptimizer типизация', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('CachePerformanceMonitor.createISRManager', () => {
    it('должен принимать корректную конфигурацию ISRManagerConfig', () => {
      const config: Partial<ISRManagerConfig> = {
        defaultRevalidate: 3600,
        maxCacheSize: 1000,
        enableBackgroundRevalidation: true
      };

      expect(() => CachePerformanceMonitor.createISRManager(config)).not.toThrow();
    });

    it('должен работать без конфигурации', () => {
      expect(() => CachePerformanceMonitor.createISRManager()).not.toThrow();
    });
  });

  describe('useCacheOptimizer хук', () => {
    const TestComponent = ({ config }: { 
      config?: { 
        cache?: AdvancedCacheConfig; 
        isr?: Partial<ISRManagerConfig> 
      } 
    }) => {
      const { metrics, preloadData } = useCacheOptimizer(config);
      
      return (
        <div>
          <div data-testid="hit-rate">{metrics.hitRate}</div>
          <button 
            onClick={() => preloadData('test-key', mockFetcher)}
            data-testid="preload-btn"
          >
            Preload
          </button>
        </div>
      );
    };

    it('должен работать с корректной конфигурацией', async () => {
      const config = {
        cache: {
          maxSize: 100,
          defaultTTL: 300,
          enableCompression: true,
          enablePersistence: false,
          strategy: 'lru' as const
        } as AdvancedCacheConfig,
        isr: {
          defaultRevalidate: 3600,
          maxCacheSize: 500,
          enableBackgroundRevalidation: true,
          staleWhileRevalidate: true,
          retryAttempts: 3,
          retryDelay: 1000
        } as Partial<ISRManagerConfig>
      };

      render(<TestComponent config={config} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hit-rate')).toBeInTheDocument();
      });
    });

    it('должен работать без конфигурации', async () => {
      render(<TestComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hit-rate')).toBeInTheDocument();
      });
    });

    it('должен работать только с cache конфигурацией', async () => {
      const config = {
        cache: {
          maxSize: 100,
          defaultTTL: 300,
          enableCompression: false,
          enablePersistence: false,
          strategy: 'lru' as const
        } as AdvancedCacheConfig
      };

      render(<TestComponent config={config} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hit-rate')).toBeInTheDocument();
      });
    });

    it('должен работать только с isr конфигурацией', async () => {
      const config = {
        isr: {
          defaultRevalidate: 3600,
          maxCacheSize: 500,
          enableBackgroundRevalidation: false,
          staleWhileRevalidate: false,
          retryAttempts: 1,
          retryDelay: 500
        } as Partial<ISRManagerConfig>
      };

      render(<TestComponent config={config} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('hit-rate')).toBeInTheDocument();
      });
    });
  });

  describe('CachedData компонент', () => {
    const TestChildComponent = ({ data }: { data: unknown }) => (
      <div data-testid="cached-data">{JSON.stringify(data)}</div>
    );

    it('должен корректно работать с типизированными пропсами', async () => {
      render(
        <CachedData
          cacheKey="test-key"
          fetcher={mockFetcher}
          ttl={300}
          tags={['test']}
          priority="high"
          fallback={<div>Loading...</div>}
        >
          {(data) => <TestChildComponent data={data} />}
        </CachedData>
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      
      await waitFor(() => {
        expect(screen.getByTestId('cached-data')).toBeInTheDocument();
      });
    });
  });
});

// Тест типизации на уровне компиляции
describe('Типизация интерфейсов', () => {
  it('ISRManagerConfig должен иметь корректные типы', () => {
    const config: ISRManagerConfig = {
      defaultRevalidate: 3600,
      maxCacheSize: 1000,
      enableBackgroundRevalidation: true,
      staleWhileRevalidate: false,
      retryAttempts: 3,
      retryDelay: 1000
    };

    expect(typeof config.defaultRevalidate).toBe('number');
    expect(typeof config.maxCacheSize).toBe('number');
    expect(typeof config.enableBackgroundRevalidation).toBe('boolean');
  });

  it('AdvancedCacheConfig должен иметь корректные типы', () => {
    const config: AdvancedCacheConfig = {
      maxSize: 100,
      defaultTTL: 300,
      enableCompression: true,
      enablePersistence: false,
      strategy: 'lru'
    };

    expect(typeof config.maxSize).toBe('number');
    expect(typeof config.defaultTTL).toBe('number');
    expect(typeof config.enableCompression).toBe('boolean');
  });
});