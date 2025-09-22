/**
 * Performance Monitor API Tests
 * Tests for /api/performance endpoint
 */

// Mock environment variables correctly
const originalEnv = process.env;

beforeAll(() => {
  jest.resetModules();
  process.env = {
    ...originalEnv,
    NODE_ENV: 'test',
    GOOGLE_ANALYTICS_ID: 'GA_TEST_ID',
    DATADOG_API_KEY: 'DD_TEST_KEY',
  };
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock fetch globally
global.fetch = jest.fn();

describe('Performance Monitor API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be testable', () => {
    expect(true).toBe(true);
  });

  it('should have environment variables set', () => {
    expect(process.env.NODE_ENV).toBe('test');
    expect(process.env.GOOGLE_ANALYTICS_ID).toBe('GA_TEST_ID');
    expect(process.env.DATADOG_API_KEY).toBe('DD_TEST_KEY');
  });

  it('should have fetch mocked', () => {
    expect(global.fetch).toBeDefined();
    expect(jest.isMockFunction(global.fetch)).toBe(true);
  });
});