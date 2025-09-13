export const locales = ['ru', 'en', 'kg'] as const;
export type Locale = (typeof locales)[number];