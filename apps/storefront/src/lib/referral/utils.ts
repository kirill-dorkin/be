import { randomBytes } from "crypto";

import type {
  BalanceTransaction,
  ReferralData,
  UserBalance,
} from "./types";

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

/**
 * Parse user metadata to extract referral data
 */
export function parseReferralData(
  metadata: Record<string, string> | Array<{ key: string; value: string }> | null | undefined,
): ReferralData | null {
  if (!metadata) {
    return null;
  }

  // Convert array format to object format if needed
  const metadataObj = Array.isArray(metadata)
    ? metadata.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {} as Record<string, string>)
    : metadata;

  const referralCode = metadataObj.referralCode || "";
  const referredBy = metadataObj.referredBy;
  const referralCount = parseInt(metadataObj.referralCount || "0", 10);
  const vipReferralCount = parseInt(metadataObj.vipReferralCount || "0", 10);
  const totalEarned = parseFloat(metadataObj.totalEarned || "0");

  if (!referralCode) {
    return null;
  }

  return {
    referralCode,
    referredBy,
    referralCount,
    vipReferralCount,
    totalEarned,
  };
}

/**
 * Parse user metadata to extract balance data
 */
export function parseBalanceData(
  metadata: Record<string, string> | Array<{ key: string; value: string }> | null | undefined,
): UserBalance {
  if (!metadata) {
    return {
      balance: 0,
      currency: "KGS",
      transactions: [],
    };
  }

  // Convert array format to object format if needed
  const metadataObj = Array.isArray(metadata)
    ? metadata.reduce((acc, item) => ({ ...acc, [item.key]: item.value }), {} as Record<string, string>)
    : metadata;

  const balance = parseFloat(metadataObj.balance || "0");
  const transactionsJson = metadataObj.balanceTransactions || "[]";

  let transactions: BalanceTransaction[] = [];

  try {
    const parsedTransactions = JSON.parse(transactionsJson);

    if (Array.isArray(parsedTransactions)) {
      transactions = parsedTransactions.filter(isBalanceTransaction);
    }
  } catch {
    transactions = [];
  }

  return {
    balance,
    currency: "KGS",
    transactions,
  };
}

/**
 * Format balance transactions as JSON string for metadata
 */
export function serializeTransactions(
  transactions: BalanceTransaction[],
): string {
  return JSON.stringify(transactions);
}

/**
 * Create a new balance transaction
 */
export function createTransaction(
  transaction: Omit<BalanceTransaction, "id" | "createdAt">,
): BalanceTransaction {
  return {
    ...transaction,
    id: randomBytes(8).toString("hex"),
    createdAt: new Date().toISOString(),
  };
}

/**
 * Calculate total balance from transactions
 */
export function calculateBalance(transactions: BalanceTransaction[]): number {
  return transactions
    .filter((t) => t.status === "COMPLETED")
    .reduce((sum, t) => {
      if (t.type === "WITHDRAWAL" || t.type === "PURCHASE_PAYMENT") {
        return sum - t.amount;
      }

      return sum + t.amount;
    }, 0);
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  return /^[A-F0-9]{8}$/.test(code);
}

function isBalanceTransaction(value: unknown): value is BalanceTransaction {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.amount === "number" &&
    typeof record.createdAt === "string" &&
    typeof record.description === "string" &&
    typeof record.id === "string" &&
    typeof record.status === "string" &&
    typeof record.type === "string"
  );
}
