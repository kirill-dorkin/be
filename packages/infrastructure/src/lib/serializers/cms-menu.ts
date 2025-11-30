import type {
  ButterCMSMenuItem,
  ButterCMSMenuItemChild,
  Menu,
  MenuItem,
  MenuItemChild,
} from "@nimara/domain/objects/Menu";

import type {
  MenuGet_menu_Menu_items_MenuItem,
  MenuGet_menu_Menu_items_MenuItem_children_MenuItem,
} from "../../cms-menu/saleor/graphql/queries/generated.ts";

const normalizeLocalePrefix = (locale?: string) => {
  if (!locale) {
    return "";
  }

  return locale.startsWith("/") ? locale : `/${locale}`;
};

const stripLocalePrefix = (pathname: string, locale?: string) => {
  let normalizedPath = pathname;

  if (
    normalizedPath.startsWith("http://") ||
    normalizedPath.startsWith("https://")
  ) {
    try {
      const parsed = new URL(normalizedPath);
      normalizedPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    } catch {
      // Ignore parse errors and fallback to default normalization below
    }
  }

  normalizedPath = normalizedPath.startsWith("/")
    ? normalizedPath
    : `/${normalizedPath}`;
  const normalizedLocale = normalizeLocalePrefix(locale);

  if (!normalizedLocale) {
    return normalizedPath;
  }

  if (normalizedPath === normalizedLocale) {
    return "/";
  }

  if (normalizedPath.startsWith(`${normalizedLocale}/`)) {
    return normalizedPath.slice(normalizedLocale.length) || "/";
  }

  return normalizedPath;
};

const pickFirstNonEmpty = (...values: Array<string | null | undefined>) => {
  for (const value of values) {
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return null;
};

const createMenuItemUrl = (
  category?: { slug: string } | null,
  collection?: { slug: string } | null,
  page?: { slug: string } | null,
  _locale?: string,
): string => {
  const withLocalePrefix = (pathname: string) => {
    const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;

    // Consumers use next-intl's `LocalizedLink`, which handles prefixing.
    // Returning raw paths avoids double locale segments like `/ru/ru/...`.
    return normalizedPath;
  };

  if (page?.slug) {
    return withLocalePrefix(`/page/${page.slug}`);
  }

  if (collection?.slug) {
    return withLocalePrefix(`/collections/${collection.slug}`);
  }

  const queryParams = new URLSearchParams();

  if (category?.slug) {
    queryParams.append("category", category.slug);
  }

  const queryString = queryParams.toString();

  return withLocalePrefix(queryString ? `/search?${queryString}` : "/search");
};

const removeStorefrontOrigin = (url: string): string => {
  const storefrontUrl = process.env.NEXT_PUBLIC_STOREFRONT_URL;

  if (storefrontUrl) {
    try {
      const storefront = new URL(storefrontUrl);
      const parsed = new URL(url);

      if (parsed.origin === storefront.origin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      }
    } catch {
      if (url.startsWith(storefrontUrl)) {
        return url.slice(storefrontUrl.length) || "/";
      }
    }
  }

  return url;
};

const sanitizeMenuUrl = (
  rawUrl: string | null | undefined,
  locale?: string,
): string | null => {
  if (!rawUrl) {
    return null;
  }

  const trimmedUrl = rawUrl.trim();
  let candidate =
    trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")
      ? removeStorefrontOrigin(trimmedUrl)
      : trimmedUrl;

  if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
    try {
      const parsedCandidate = new URL(candidate);
      candidate = `${parsedCandidate.pathname}${parsedCandidate.search}${parsedCandidate.hash}`;
    } catch {
      // Ignore parse errors and let fallback logic normalize the URL
    }
  }

  candidate = candidate.startsWith("/") ? candidate : `/${candidate}`;

  return stripLocalePrefix(candidate, locale);
};

const serializeSaleorMenuItemChild = (
  child: MenuGet_menu_Menu_items_MenuItem_children_MenuItem,
  locale?: string,
): MenuItemChild => {
  const { id, name, translation, url, collection, category, page } = child;

  const sanitizedUrl = sanitizeMenuUrl(url, locale);

  return {
    id,
    label:
      pickFirstNonEmpty(
        translation?.name,
        category?.translation?.name,
        name,
        category?.name,
      ) ?? id,
    url: sanitizedUrl ?? createMenuItemUrl(category, collection, page, locale),
    description:
      collection?.translation?.description ||
      collection?.description ||
      category?.translation?.description ||
      category?.description ||
      null,

    collectionImageUrl: collection?.backgroundImage?.url || null,
  };
};

const serializeSaleorMenuItem = (
  item: MenuGet_menu_Menu_items_MenuItem,
  locale?: string,
): MenuItem => {
  const { id, name, translation, url, children, category, collection, page } =
    item;

  const sanitizedUrl = sanitizeMenuUrl(url, locale);

  return {
    id,
    label:
      pickFirstNonEmpty(
        translation?.name,
        category?.translation?.name,
        collection?.translation?.name,
        name,
        category?.name,
        collection?.name,
      ) ?? id,
    url: sanitizedUrl ?? createMenuItemUrl(category, collection, page, locale),
    children:
      children
        ?.filter((child) => child.collection || child.category || child.page)
        .map((child) => serializeSaleorMenuItemChild(child, locale)) || [],
  };
};

export const serializeSaleorMenu = (
  items: MenuGet_menu_Menu_items_MenuItem[],
  locale?: string,
): Menu => {
  return {
    items: items.map((item) => serializeSaleorMenuItem(item, locale)),
  };
};

const serializeButterCMSMenuItemChild = (
  child: ButterCMSMenuItemChild,
): MenuItemChild => {
  return {
    id: child.meta.id.toString(),
    label: child.name,
    url:
      child.url ||
      createMenuItemUrl(
        child.category_slug ? { slug: child.category_slug } : null,
        child.collection_slug ? { slug: child.collection_slug } : null,
        child.page_slug ? { slug: child.page_slug } : null,
      ),
    description: child.description || null,
    collectionImageUrl: child.image || null,
  };
};

export const serializeButterCMSMenuItem = async (
  items: ButterCMSMenuItem[],
  fetchSubMenuItems: () => Promise<ButterCMSMenuItemChild[]>,
): Promise<MenuItem[]> => {
  const submenuItems = await fetchSubMenuItems();

  const findSubMenuItemsById = (id: string): MenuItemChild[] => {
    const matchedItems = submenuItems
      .filter((submenuItem) => submenuItem.meta.id.toString() === id)
      .map(serializeButterCMSMenuItemChild);

    return matchedItems;
  };

  return items.map((item) => {
    const extractedIds = item.navigation_menu_second_level
      ?.map((navItem) => {
        const id = navItem
          .split("navigation_menu_item_second_level[_id=")[1]
          ?.split("]")[0];

        return id;
      })
      .filter(Boolean) as string[];

    const children: MenuItemChild[] | null =
      extractedIds?.flatMap((id) => findSubMenuItemsById(id)) || null;

    return {
      id: item.meta.id.toString(),
      label: item.name,
      url:
        item.url ||
        createMenuItemUrl(
          item.category.length > 0 ? { slug: item.name.toLowerCase() } : null,
          null,
          item.page
            ? {
                slug:
                  typeof item.page === "string"
                    ? item.page.split("/").filter(Boolean).pop() || ""
                    : "",
              }
            : null,
        ),
      children,
    };
  });
};
