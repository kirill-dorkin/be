export type BalanceTransactionType =
  | "REFERRAL_BONUS"
  | "VIP_REFERRAL_BONUS"
  | "PURCHASE_PAYMENT"
  | "WITHDRAWAL"
  | "ADMIN_ADJUSTMENT";

export type BalanceTransactionStatus = "PENDING" | "COMPLETED" | "CANCELLED";

export interface BalanceTransaction {
  amount: number;
  createdAt: string;
  description: string;
  id: string;
  relatedOrderId?: string;
  relatedUserId?: string;
  status: BalanceTransactionStatus;
  type: BalanceTransactionType;
}

export interface UserBalance {
  balance: number;
  currency: string;
  transactions: BalanceTransaction[];
}

export interface ReferralData {
  referralCode: string;
  referralCount: number;
  referredBy?: string;
  totalEarned: number;
  vipReferralCount: number;
}

export interface ReferralStats {
  availableBalance: number;
  pendingReferrals: number;
  totalEarned: number;
  totalReferrals: number;
  vipReferrals: number;
}

export const REFERRAL_BONUS_AMOUNT = 100; // 100 сом за VIP реферала
export const MIN_WITHDRAWAL_AMOUNT = 500; // Минимальная сумма для вывода
