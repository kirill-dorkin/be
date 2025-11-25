// Saleor config
export const IMAGE_FORMAT: "AVIF" | "ORIGINAL" | "WEBP" = "AVIF";
export const IMAGE_SIZES = {
  pdp: 1024,
  catalog: 800,
  thumbnail: 256,
};

export const IMAGE_QUALITY = {
  high: 100,     // Main product images, hero banners - максимальное качество
  medium: 95,    // Navigation, collections
  low: 90,       // Thumbnails in cart/orders
} as const;

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;

const isDevelopment = process.env.NODE_ENV === "development";
const isProduction = process.env.NODE_ENV === "production";

export const CACHE_TTL = {
  pdp: isDevelopment ? MINUTE * 2 : DAY, // 2 minutes in dev, 1 day in prod
  cart: MINUTE * 5,
  cms: isDevelopment ? MINUTE * 2 : MINUTE * 30, // 2 minutes in dev, 30 minutes in prod
  search: MINUTE * 5,
} as const;
export const DEFAULT_DEBOUNCE_TIME_IN_MS = 300; // Уменьшено с 500мс для более быстрого отклика
export const DEFAULT_SORT_BY = "price-asc";
export const DEFAULT_RESULTS_PER_PAGE = 16;

export const COOKIE_KEY = {
  checkoutId: "checkoutId",
  accessToken: "accessToken",
  refreshToken: "refreshToken",
  searchProvider: "searchProvider",
  locale: "NEXT_LOCALE",
  currency: "NEXT_CURRENCY",
} as const;

export const COOKIE_MAX_AGE = {
  checkout: 30 * DAY,
  locale: 360 * DAY,
} as const;

export const AUTH_COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax" as const,
  secure: isProduction,
};

export const MIN_PASSWORD_LENGTH = 8;

export const DEFAULT_PAGE_TITLE = "BestElectronics Storefront";

export const CHANGE_EMAIL_TOKEN_VALIDITY_IN_HOURS = 72;
