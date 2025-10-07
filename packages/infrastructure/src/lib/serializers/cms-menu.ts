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
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
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

const createMenuItemUrl = (
  category?: { slug: string } | null,
  collection?: { slug: string } | null,
  page?: { slug: string } | null,
  _locale?: string,
): string => {
  const withLocalePrefix = (pathname: string) => {
    const normalizedPath = pathname.startsWith("/")
      ? pathname
      : `/${pathname}`;

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

  return withLocalePrefix(
    queryString ? `/search?${queryString}` : "/search",
  );
};

const serializeSaleorMenuItemChild = (
  child: MenuGet_menu_Menu_items_MenuItem_children_MenuItem,
  locale?: string,
): MenuItemChild => {
  const { id, name, translation, url, collection, category, page } = child;

  // INFO: Links in Saleor CMS cannot be relative links, they must be absolute URLs,
  // so to preserve locale prefixes we need to cut the domain to make them relatives
  const formattedUrl = url?.replace(
    process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "",
    "",
  );

  const sanitizedUrl = formattedUrl
    ? stripLocalePrefix(formattedUrl, locale)
    : null;

  return {
    id,
    label: translation?.name || name,
    url:
      sanitizedUrl ?? createMenuItemUrl(category, collection, page, locale),
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

  // INFO: Links in Saleor CMS cannot be relative links, they must be absolute URLs,
  // so to preserve locale prefixes we need to cut the domain to make them relatives
  const formattedUrl = url?.replace(
    process.env.NEXT_PUBLIC_STOREFRONT_URL ?? "",
    "",
  );

  const sanitizedUrl = formattedUrl
    ? stripLocalePrefix(formattedUrl, locale)
    : null;

  return {
    id,
    label: translation?.name || name,
    url:
      sanitizedUrl ?? createMenuItemUrl(category, collection, page, locale),
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
