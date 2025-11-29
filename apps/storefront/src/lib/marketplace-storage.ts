import fs from "fs/promises";
import path from "path";

export type MarketplaceListing = {
  id: string;
  title: string;
  price: number;
  category: string;
  description: string;
  photoUrl?: string;
  contact: string;
  userId?: string;
  userName?: string | null;
  status: "pending" | "published" | "rejected";
  createdAt: string;
};

const STORAGE_DIR = path.join(process.cwd(), "apps/storefront/.data");
const STORAGE_FILE = path.join(STORAGE_DIR, "marketplace-listings.json");

const ensureStorage = async () => {
  await fs.mkdir(STORAGE_DIR, { recursive: true });
  try {
    await fs.access(STORAGE_FILE);
  } catch {
    await fs.writeFile(STORAGE_FILE, "[]", "utf-8");
  }
};

export const loadMarketplaceListings = async (): Promise<MarketplaceListing[]> => {
  await ensureStorage();
  const raw = await fs.readFile(STORAGE_FILE, "utf-8");

  try {
    const parsed = JSON.parse(raw) as MarketplaceListing[];
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch {
    // fall through
  }

  return [];
};

export const saveMarketplaceListing = async (listing: MarketplaceListing) => {
  const current = await loadMarketplaceListings();
  const next = [listing, ...current].slice(0, 200);

  await fs.writeFile(STORAGE_FILE, JSON.stringify(next, null, 2), "utf-8");

  return next;
};

export const saveMarketplaceListings = async (listings: MarketplaceListing[]) => {
  await ensureStorage();
  await fs.writeFile(
    STORAGE_FILE,
    JSON.stringify(listings.slice(0, 200), null, 2),
    "utf-8",
  );

  return listings.slice(0, 200);
};
