import type { CMSMenuService } from "@nimara/infrastructure/use-cases/cms-menu/types";
import type { CMSPageService } from "@nimara/infrastructure/use-cases/cms-page/types";

import { clientEnvs } from "@/envs/client";
import { storefrontLogger } from "@/services/logging";

const wantsButterCMS = clientEnvs.NEXT_PUBLIC_CMS_SERVICE === "BUTTER_CMS";
const butterCMSApiKey = clientEnvs.NEXT_PUBLIC_BUTTER_CMS_API_KEY;
const hasButterCMSKey = Boolean(butterCMSApiKey);
const isSaleorCMS = !wantsButterCMS || !hasButterCMSKey;

if (wantsButterCMS && !hasButterCMSKey) {
  storefrontLogger.warning(
    "ButterCMS selected but NEXT_PUBLIC_BUTTER_CMS_API_KEY is missing. Falling back to Saleor CMS.",
  );
}

/**
 * Lazy loads the CMS service responsible for fetching CMS pages.
 * @returns A promise that resolves to the CMSPageService instance.
 * This service is used to fetch CMS pages from either Saleor or ButterCMS based on the
 */
const getCMSPageService = async (): Promise<CMSPageService> => {
  if (isSaleorCMS) {
    const { saleorCMSPageService } = await import(
      "@nimara/infrastructure/cms-page/providers"
    );

    return saleorCMSPageService({
      logger: storefrontLogger,
      apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    });
  } else {
    const { butterCMSPageService } = await import(
      "@nimara/infrastructure/cms-page/providers"
    );

    if (!butterCMSApiKey) {
      throw new Error("ButterCMS API key is required to use ButterCMS.");
    }

    return butterCMSPageService({
      logger: storefrontLogger,
      token: butterCMSApiKey,
    });
  }
};

/**
 * Lazy loads the CMS service responsible for fetching CMS menus.
 * @returns A promise that resolves to the CMSMenuService instance.
 * This service is used to fetch CMS menus from either Saleor or ButterCMS based on the
 */
const getCMSMenuService = async (): Promise<CMSMenuService> => {
  if (isSaleorCMS) {
    const { saleorCMSMenuService } = await import(
      "@nimara/infrastructure/cms-menu/providers"
    );

    return saleorCMSMenuService({
      logger: storefrontLogger,
      apiURL: clientEnvs.NEXT_PUBLIC_SALEOR_API_URL,
    });
  } else {
    const { butterCMSMenuService } = await import(
      "@nimara/infrastructure/cms-menu/providers"
    );

    if (!butterCMSApiKey) {
      throw new Error("ButterCMS API key is required to use ButterCMS.");
    }

    return butterCMSMenuService({
      logger: storefrontLogger,
      token: butterCMSApiKey,
    });
  }
};

export const cmsPageService: CMSPageService = await getCMSPageService();
export const cmsMenuService: CMSMenuService = await getCMSMenuService();
