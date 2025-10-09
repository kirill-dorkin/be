import type { DocumentTypeDecoration } from "@graphql-typed-document-node/core";

import type {
  Menu,
  MenuItem,
  MenuItemChild,
} from "@nimara/domain/objects/Menu";
import { ok } from "@nimara/domain/objects/Result";

import { saleorClient } from "@/graphql/client";
import { cmsMenuService } from "@/services/cms";
import { storefrontLogger } from "@/services/logging";

type MenuGetParams = Parameters<typeof cmsMenuService.menuGet>[0];
type NavigationMenuParams = Omit<MenuGetParams, "slug">;

type CategoryNode = {
  children?: {
    edges?: Array<{ node?: CategoryNode | null } | null>;
  } | null;
  description?: string | null;
  id: string;
  name?: string | null;
  slug: string;
  translation?: {
    description?: string | null;
    name?: string | null;
  } | null;
};

type CategoriesNavigationQuery = {
  categories?: {
    edges?: Array<{ node?: CategoryNode | null } | null>;
  } | null;
};

type CategoriesNavigationQueryVariables = Pick<
  NavigationMenuParams,
  "languageCode"
>;

const CATEGORY_NAVIGATION_QUERY_DOCUMENT = {
  toString: () => `
    query CategoryNavigationQuery($languageCode: LanguageCodeEnum!) {
      categories(first: 20, level: 0) {
        edges {
          node {
            id
            name
            slug
            description
            translation(languageCode: $languageCode) {
              name
              description
            }
            children(first: 20) {
              edges {
                node {
                  id
                  name
                  slug
                  description
                  translation(languageCode: $languageCode) {
                    name
                    description
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
} as DocumentTypeDecoration<
  CategoriesNavigationQuery,
  CategoriesNavigationQueryVariables
>;

const isDefined = <T>(value: T | null | undefined): value is T =>
  value !== null && value !== undefined;

const categorySearchUrl = (slug: string): string =>
  `/search?category=${encodeURIComponent(slug)}`;

const mapCategoryToMenuItemChild = (category: CategoryNode): MenuItemChild => ({
  id: category.id,
  label: category.translation?.name?.trim() || category.name || category.id,
  url: categorySearchUrl(category.slug),
  description:
    category.translation?.description ||
    category.description ||
    null,
  collectionImageUrl: null,
});

const mapCategoryToMenuItem = (category: CategoryNode): MenuItem => {
  const children =
    category.children?.edges
      ?.map((edge) => edge?.node)
      .filter(isDefined)
      .filter((child) => Boolean(child.slug && child.id))
      .map(mapCategoryToMenuItemChild) ?? [];

  return {
    id: category.id,
    label: category.translation?.name?.trim() || category.name || category.id,
    url: categorySearchUrl(category.slug),
    children,
  };
};

const buildMenuFromCategories = (data: CategoriesNavigationQuery): Menu => {
  const items =
    data.categories?.edges
      ?.map((edge) => edge?.node)
      .filter(isDefined)
      .filter((node) => Boolean(node.slug && node.id))
      .map(mapCategoryToMenuItem) ?? [];

  return { items };
};

export const getNavigationMenu = async ({
  channel,
  languageCode,
  locale,
  options,
}: NavigationMenuParams): ReturnType<typeof cmsMenuService.menuGet> => {
  const cmsMenuResult = await cmsMenuService.menuGet({
    channel,
    languageCode,
    locale,
    options,
    slug: "navbar",
  });

  const cmsMenuItems =
    cmsMenuResult.ok && cmsMenuResult.data?.menu?.items
      ? cmsMenuResult.data.menu.items
      : [];

  if (cmsMenuResult.ok && cmsMenuItems.length > 0) {
    return cmsMenuResult;
  }

  if (!cmsMenuResult.ok) {
    storefrontLogger.warning(
      "[Navigation] CMS menu 'navbar' unavailable, falling back to categories.",
      {
        errors: cmsMenuResult.errors,
      },
    );
  } else {
    storefrontLogger.info(
      "[Navigation] CMS menu 'navbar' empty, falling back to category tree.",
    );
  }

  const fallbackResult = await saleorClient().execute(
    CATEGORY_NAVIGATION_QUERY_DOCUMENT,
    {
      operationName: "CategoryNavigationQuery",
      variables: {
        languageCode,
      },
      options,
    },
  );

  if (!fallbackResult.ok) {
    return fallbackResult;
  }

  const menu = buildMenuFromCategories(fallbackResult.data);

  storefrontLogger.debug("[Navigation] Built menu from category fallback.", {
    topLevelCount: menu.items.length,
    labels: menu.items.map((item) => item.label),
  });

  return ok({ menu });
};
