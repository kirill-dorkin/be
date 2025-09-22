import React from 'react';
import '@testing-library/jest-dom';

// Mock Next.js environment
Object.defineProperty(process.env, 'NODE_ENV', { value: 'test' });
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock fetch
global.fetch = jest.fn();

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  warn: jest.fn(),
  error: jest.fn(),
};

// Setup test environment
beforeAll(() => {
  // Mock window.location
  delete (window as any).location;
  window.location = {
    href: 'http://localhost:3000',
    origin: 'http://localhost:3000',
    pathname: '/',
    search: '',
    hash: '',
  } as any;
});

afterAll(() => {
  // Cleanup
});

afterEach(() => {
  jest.clearAllMocks();
  (fetch as jest.Mock).mockClear();
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock Next.js image
jest.mock('next/image', () => ({
  __esModule: true,
  default: ({ src, alt, ...props }: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return React.createElement('img', { src, alt, ...props });
  },
}));

// Mock web-vitals
jest.mock('web-vitals', () => ({
  onCLS: jest.fn(),
  onFCP: jest.fn(),
  onLCP: jest.fn(),
  onTTFB: jest.fn(),
}));

// Helper functions for tests
export const mockFetchSuccess = (data: any) => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    status: 200,
    json: async () => data,
    text: async () => JSON.stringify(data),
    headers: new Headers(),
    statusText: 'OK',
  });
};

export const mockFetchError = (status: number, message: string) => {
  (fetch as jest.Mock).mockResolvedValueOnce({
    ok: false,
    status,
    statusText: message,
    json: async () => ({ error: message }),
    text: async () => JSON.stringify({ error: message }),
    headers: new Headers(),
  });
};

export const mockFetchNetworkError = (message: string) => {
  (fetch as jest.Mock).mockRejectedValueOnce(new Error(message));
};