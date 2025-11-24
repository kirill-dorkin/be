/**
 * Программа членства BestElectronics Community
 */

export const MEMBERSHIP_CONFIG = {
  /** Стоимость членства в месяц (KGS) */
  MONTHLY_PRICE: 199,

  /** Скидка на товары для членов (%) */
  PRODUCT_DISCOUNT_PERCENT: 10,

  /** Скидка на услуги ремонта для членов (%) */
  REPAIR_DISCOUNT_PERCENT: 20,

  /** Бесплатная доставка для членов */
  FREE_SHIPPING: true,

  /** Приоритетная поддержка */
  PRIORITY_SUPPORT: true,
} as const;

export const MEMBERSHIP_BENEFITS = [
  {
    id: 'product-discount',
    icon: 'tag',
    titleKey: 'membership.benefits.product-discount.title',
    descriptionKey: 'membership.benefits.product-discount.description',
  },
  {
    id: 'repair-discount',
    icon: 'wrench',
    titleKey: 'membership.benefits.repair-discount.title',
    descriptionKey: 'membership.benefits.repair-discount.description',
  },
  {
    id: 'free-shipping',
    icon: 'truck',
    titleKey: 'membership.benefits.free-shipping.title',
    descriptionKey: 'membership.benefits.free-shipping.description',
  },
  {
    id: 'priority-support',
    icon: 'headset',
    titleKey: 'membership.benefits.priority-support.title',
    descriptionKey: 'membership.benefits.priority-support.description',
  },
  {
    id: 'early-access',
    icon: 'star',
    titleKey: 'membership.benefits.early-access.title',
    descriptionKey: 'membership.benefits.early-access.description',
  },
] as const;

/** Тип членства пользователя */
export type MembershipStatus = 'guest' | 'member' | 'trial';

/** Информация о членстве */
export interface MembershipInfo {
  status: MembershipStatus;
  validUntil?: Date;
  isActive: boolean;
}
