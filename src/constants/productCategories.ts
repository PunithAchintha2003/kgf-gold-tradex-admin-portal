/**
 * Fixed product categories (merchant catalog). Keep in sync with backend `constants/productCategories.js`.
 */
export const PRODUCT_CATEGORIES = [
  'Rings',
  'Necklaces',
  'Earrings',
  'Bracelets',
  'Pendants',
  'Biscuits',
  'Coins',
  'Bars',
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export const DEFAULT_PRODUCT_CATEGORY: ProductCategory = 'Rings';

export function normalizeProductCategory(value: string | undefined | null): ProductCategory {
  const v = (value || '').trim();
  return (PRODUCT_CATEGORIES as readonly string[]).includes(v) ? (v as ProductCategory) : DEFAULT_PRODUCT_CATEGORY;
}
