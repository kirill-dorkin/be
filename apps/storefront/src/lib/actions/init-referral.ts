"use server";

import { ok } from "@nimara/domain/objects/Result";

import { getAccessToken } from "@/auth";
import { generateReferralCode, serializeTransactions } from "@/lib/referral/utils";
import { storefrontLogger } from "@/services/logging";
import { getUserService } from "@/services/user";

/**
 * Initialize referral data for a newly registered user
 */
export async function initializeReferralData(referredByCode?: string) {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    storefrontLogger.error("[InitReferral] No access token available");

    return ok({ success: false });
  }

  const userService = await getUserService();

  // Generate unique referral code for this user
  const referralCode = generateReferralCode();

  const metadata: Array<{ key: string; value: string }> = [
    { key: "referralCode", value: referralCode },
    { key: "referralCount", value: "0" },
    { key: "vipReferralCount", value: "0" },
    { key: "totalEarned", value: "0" },
    { key: "balance", value: "0" },
    { key: "balanceTransactions", value: serializeTransactions([]) },
  ];

  // If referred by someone, save the referrer code
  if (referredByCode) {
    metadata.push({ key: "referredBy", value: referredByCode });
    storefrontLogger.info("[InitReferral] User was referred", {
      referredByCode,
    });
  }

  storefrontLogger.info("[InitReferral] Initializing referral data", {
    referralCode,
    hasReferrer: !!referredByCode,
  });

  const updateResult = await userService.accountUpdate({
    accessToken,
    accountInput: {
      metadata,
    },
  });

  if (!updateResult.ok) {
    storefrontLogger.error("[InitReferral] Failed to update user metadata", {
      errors: updateResult.errors,
    });

    return ok({ success: false });
  }

  storefrontLogger.info("[InitReferral] Successfully initialized referral data");

  return ok({ success: true, referralCode });
}
