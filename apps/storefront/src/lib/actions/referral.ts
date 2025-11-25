"use server";

import { revalidatePath } from "next/cache";

import { err, ok } from "@nimara/domain/objects/Result";

import { getAccessToken } from "@/auth";
import { initializeReferralData } from "@/lib/actions/init-referral";
import { paths } from "@/lib/paths";
import {
  calculateBalance,
  createTransaction,
  parseBalanceData,
  parseReferralData,
  serializeTransactions,
} from "@/lib/referral/utils";
import { getUserService } from "@/services/user";

import { REFERRAL_BONUS_AMOUNT } from "../referral/types";

/**
 * Get current user's referral data
 */
export async function getReferralData() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return err([
      {
        code: "ACCESS_TOKEN_NOT_FOUND_ERROR" as const,
        message: "User not authenticated",
      },
    ]);
  }

  const userService = await getUserService();
  const resultUserGet = await userService.userGet(accessToken);

  if (!resultUserGet.ok) {
    return resultUserGet;
  }

  const user = resultUserGet.data;

  if (!user) {
    return err([
      {
        code: "ACCOUNT_UPDATE_ERROR" as const,
        message: "User not found",
      },
    ]);
  }

  let referralData = parseReferralData(user.metadata);
  let balanceData = parseBalanceData(user.metadata);

  if (!referralData) {
    const initResult = await initializeReferralData();

    if (initResult.ok && initResult.data?.success) {
      const refreshedUser = await userService.userGet(accessToken);

      if (refreshedUser.ok && refreshedUser.data) {
        referralData = parseReferralData(refreshedUser.data.metadata);
        balanceData = parseBalanceData(refreshedUser.data.metadata);
      }
    }
  }

  return ok({
    referralData,
    balance: balanceData,
    userEmail: user.email,
  });
}

/**
 * Get user balance
 */
export async function getUserBalance() {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return err([
      {
        code: "ACCESS_TOKEN_NOT_FOUND_ERROR" as const,
        message: "User not authenticated",
      },
    ]);
  }

  const userService = await getUserService();
  const resultUserGet = await userService.userGet(accessToken);

  if (!resultUserGet.ok) {
    return resultUserGet;
  }

  const user = resultUserGet.data;

  if (!user) {
    return err([
      {
        code: "ACCOUNT_UPDATE_ERROR" as const,
        message: "User not found",
      },
    ]);
  }

  const balanceData = parseBalanceData(user.metadata);

  return ok(balanceData);
}

/**
 * Request withdrawal
 */
export async function requestWithdrawal(amount: number, method: string) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return err([
      {
        code: "ACCESS_TOKEN_NOT_FOUND_ERROR" as const,
        message: "User not authenticated",
      },
    ]);
  }

  const userService = await getUserService();
  const resultUserGet = await userService.userGet(accessToken);

  if (!resultUserGet.ok) {
    return resultUserGet;
  }

  const user = resultUserGet.data;

  if (!user) {
    return err([
      {
        code: "ACCOUNT_UPDATE_ERROR" as const,
        message: "User not found",
      },
    ]);
  }

  const balanceData = parseBalanceData(user.metadata);
  const currentBalance = calculateBalance(balanceData.transactions);

  if (currentBalance < amount) {
    return err([
      {
        code: "INSUFFICIENT_STOCK_ERROR" as const,
        message: "Insufficient balance",
      },
    ]);
  }

  // Create withdrawal transaction
  const transaction = createTransaction({
    type: "WITHDRAWAL",
    amount,
    status: "PENDING",
    description: `Withdrawal request via ${method}`,
  });

  const updatedTransactions = [...balanceData.transactions, transaction];

  // Update user metadata
  const updateResult = await userService.userUpdate({
    accessToken,
    input: {
      metadata: [
        {
          key: "balanceTransactions",
          value: serializeTransactions(updatedTransactions),
        },
      ],
    },
  });

  if (!updateResult.ok) {
    return updateResult;
  }

  revalidatePath(paths.account.profile.asPath());

  return ok({
    transactionId: transaction.id,
    message: "Withdrawal request submitted successfully",
  });
}

/**
 * Apply balance to order (internal function, to be called during checkout)
 */
export async function applyBalanceToOrder(
  orderId: string,
  amount: number,
): Promise<boolean> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return false;
  }

  const userService = await getUserService();
  const resultUserGet = await userService.userGet(accessToken);

  if (!resultUserGet.ok || !resultUserGet.data) {
    return false;
  }

  const user = resultUserGet.data;
  const balanceData = parseBalanceData(user.metadata);
  const currentBalance = calculateBalance(balanceData.transactions);

  if (currentBalance < amount) {
    return false;
  }

  // Create payment transaction
  const transaction = createTransaction({
    type: "PURCHASE_PAYMENT",
    amount,
    status: "COMPLETED",
    description: `Payment for order ${orderId}`,
    relatedOrderId: orderId,
  });

  const updatedTransactions = [...balanceData.transactions, transaction];

  // Update user metadata
  const updateResult = await userService.userUpdate({
    accessToken,
    input: {
      metadata: [
        {
          key: "balanceTransactions",
          value: serializeTransactions(updatedTransactions),
        },
        {
          key: "balance",
          value: String(calculateBalance(updatedTransactions)),
        },
      ],
    },
  });

  return updateResult.ok;
}

/**
 * Award referral bonus (to be called when referred user becomes VIP)
 */
export async function awardReferralBonus(
  _referrerEmail: string,
  _referredUserEmail: string,
) {
  // This would typically be called from an admin function or webhook
  // when a user upgrades to VIP

  // For now, just a placeholder
  return ok({
    message: `Referral bonus of ${REFERRAL_BONUS_AMOUNT} awarded to ${referrerEmail}`,
  });
}
