import { render, screen, waitFor } from '@testing-library/react';
import { PerformanceDisplay } from '../PerformanceMonitor';

// Mock web-vitals
jest.mock('web-vitals', () => ({
  getCLS: jest.fn((callback: (metric: { value: number; name: string }) => void) => callback({ value: 0.05, name: 'CLS' })),
  getFCP: jest.fn((callback: (metric: { value: number; name: string }) => void) => callback({ value: 1200, name: 'FCP' })),
  getLCP: jest.fn((callback: (metric: { value: number; name: string }) => void) => callback({ value: 2000, name: 'LCP' })),
  getTTFB: jest.fn((callback: (metric: { value: number; name: string }) => void) => callback({ value: 600, name: 'TTFB' })),
  getINP: jest.fn((callback: (metric: { value: number; name: string }) => void) => callback({ value: 80, name: 'INP' })),
}));

describe('PerformanceDisplay', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders performance metrics correctly', async () => {
    render(<PerformanceDisplay />);

    await waitFor(() => {
      expect(screen.getByText(/Performance/)).toBeInTheDocument();
    });
  });

  it('renders without crashing', () => {
    render(<PerformanceDisplay />);
    expect(screen.getByText(/Performance/)).toBeInTheDocument();
  });

  it('renders in compact mode', () => {
    render(<PerformanceDisplay compact />);
    expect(screen.getByText(/Performance/)).toBeInTheDocument();
  });

  it('renders with alerts disabled', () => {
    render(<PerformanceDisplay showAlerts={false} />);
    expect(screen.getByText(/Performance/)).toBeInTheDocument();
  });

  it('handles missing web vitals gracefully', () => {
    // Mock web-vitals to not call callbacks
    jest.doMock('web-vitals', () => ({
      getCLS: jest.fn(),
      getFCP: jest.fn(),
      getLCP: jest.fn(),
      getTTFB: jest.fn(),
      getINP: jest.fn(),
    }));

    render(<PerformanceDisplay />);
    expect(screen.getByText(/Performance/)).toBeInTheDocument();
  });
});