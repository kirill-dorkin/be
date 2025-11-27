import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockAlgoliaSearchService = vi.fn();

vi.mock("@nimara/infrastructure/search/algolia/provider", () => ({
  algoliaSearchService: (config: unknown) => {
    mockAlgoliaSearchService(config);
    return {
      getFacets: vi.fn(),
      getSortByOptions: vi.fn(),
      search: vi.fn(),
    };
  },
}));

vi.mock("@/services/lazy-logging", () => ({
  getStorefrontLogger: async () => ({
    debug: () => {},
    error: () => {},
    info: () => {},
    warning: () => {},
  }),
}));

describe("getSearchService (ALGOLIA)", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.resetModules();
    mockAlgoliaSearchService.mockClear();
    process.env.NEXT_PUBLIC_SEARCH_SERVICE = "ALGOLIA";
    process.env.NEXT_PUBLIC_DEFAULT_CHANNEL = "default-channel";
    process.env.NEXT_PUBLIC_SALEOR_API_URL = "https://example.saleor.test/graphql/";
    process.env.NEXT_PUBLIC_STOREFRONT_URL = "https://example.store.test";
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID = "app";
    process.env.NEXT_PUBLIC_ALGOLIA_API_KEY = "key";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("creates algolia service with indices for all supported channels", async () => {
    const { getSearchService } = await import("../search");
    await getSearchService();

    expect(mockAlgoliaSearchService).toHaveBeenCalledTimes(1);
    const config = mockAlgoliaSearchService.mock.calls[0][0] as {
      settings: { indices: Array<{ channel: string }> };
    };

    const channels = config.settings.indices.map((i) => i.channel);
    expect(new Set(channels).size).toBeGreaterThanOrEqual(1);
  });
});
