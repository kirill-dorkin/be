import { describe, expect, it } from "vitest";

import { ALGOLIA_SEARCH_SERVICE_CONFIG } from "../search";

const mockLogger = {
  debug: () => {},
  error: () => {},
  info: () => {},
  warning: () => {},
} as const;

describe("ALGOLIA_SEARCH_SERVICE_CONFIG", () => {
  it("includes indices for GB, RU and KG channels", () => {
    const config = ALGOLIA_SEARCH_SERVICE_CONFIG(mockLogger);
    const keys = config.settings.indices.map(
      (i) => `${i.channel}:${i.indexName}`,
    );

    // Должны быть индексы для всех валют рынков
    expect(keys.some((k) => k.includes("GBP"))).toBe(true);
    expect(keys.some((k) => k.includes("RUB"))).toBe(true);
    expect(keys.some((k) => k.includes("KGS"))).toBe(true);
  });

  it("generates replicas for sorting per index", () => {
    const config = ALGOLIA_SEARCH_SERVICE_CONFIG(mockLogger);

    config.settings.indices.forEach((index) => {
      const replicaParams = index.virtualReplicas.map((r) => r.queryParamValue);
      expect(replicaParams).toEqual(
        expect.arrayContaining(["alpha-asc", "price-asc", "price-desc"]),
      );
    });
  });
});
