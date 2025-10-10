import { type RepairService } from "./data";

export type SaleorAttributeAssignment = {
  slug: string;
  values: string[];
};

export type SaleorProductSeed = {
  attributes: SaleorAttributeAssignment[];
  basePriceAmount: number;
  categorySlug: string;
  channelListings: Array<{
    channelSlug: string;
    isPublished: boolean;
    publicationDate: string | null;
    visibleInListings: boolean;
  }>;
  currency: string;
  description: string;
  metadata: Record<string, string>;
  name: string;
  productTypeSlug: string;
  slug: string;
};

const PRODUCT_TYPE_SLUG = "repair-service";

const baseAttributes: SaleorAttributeAssignment[] = [
  { slug: "device-type", values: [] },
  { slug: "service-group", values: [] },
  { slug: "service-category", values: [] },
  { slug: "pricing-kind", values: [] },
];

export const mapServiceToSaleorSeed = (
  service: RepairService,
  channelSlug: string,
  categorySlug: string,
): SaleorProductSeed => {
  const attributes: SaleorAttributeAssignment[] = baseAttributes.map(
    (attribute) => {
      if (attribute.slug === "device-type") {
        return { ...attribute, values: [service.deviceType] };
      }

      if (attribute.slug === "service-group") {
        return { ...attribute, values: [service.group] };
      }

      if (attribute.slug === "service-category") {
        return { ...attribute, values: [service.category] };
      }

      if (attribute.slug === "pricing-kind") {
        return { ...attribute, values: [service.price.kind] };
      }

      return attribute;
    },
  );

  const metadata: Record<string, string> = {
    "repair:min_price": String(service.price.min),
    "repair:max_price": service.price.max ? String(service.price.max) : "",
    "repair:pricing_kind": service.price.kind,
  };

  const basePrice =
    service.price.kind === "from" || service.price.max === null
      ? service.price.min
      : Math.round((service.price.min + service.price.max) / 2);

  return {
    name: service.name,
    slug: service.slug,
    description: service.shortDescription ?? "",
    productTypeSlug: PRODUCT_TYPE_SLUG,
    categorySlug,
    channelListings: [
      {
        channelSlug,
        isPublished: true,
        publicationDate: null,
        visibleInListings: true,
      },
    ],
    basePriceAmount: basePrice,
    currency: service.price.currency,
    attributes,
    metadata,
  };
};
