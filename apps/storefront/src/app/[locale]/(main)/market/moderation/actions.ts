"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  loadMarketplaceListings,
  type MarketplaceListing,
  saveMarketplaceListings,
} from "@/lib/marketplace-storage";
import { paths } from "@/lib/paths";

const assertAdmin = async () => {
  const session = await auth();

  if (!session?.user || !(session.user as { isStaff?: boolean }).isStaff) {
    redirect(paths.signIn.asPath());
  }
};

const updateStatus = async (
  id: string,
  status: MarketplaceListing["status"],
) => {
  await assertAdmin();

  const listings = await loadMarketplaceListings();
  const next = listings.map((item) =>
    item.id === id ? { ...item, status } : item,
  );

  await saveMarketplaceListings(next);
  revalidatePath(paths.marketplace.asPath?.() ?? "/market");
};

export const approveListingAction = async (id: string) => {
  await updateStatus(id, "published");
};

export const rejectListingAction = async (id: string) => {
  await updateStatus(id, "rejected");
};
