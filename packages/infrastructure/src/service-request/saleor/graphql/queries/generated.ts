import type * as Types from '~@nimara/codegen/schema';

export type ServiceRequestChannelQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
}>;

export type ServiceRequestChannelQuery = {
  channel: { id: string; slug: string; name: string } | null;
};

export type ServiceRequestProductQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
  channel: Types.Scalars['String']['input'];
}>;

export type ServiceRequestProductQuery = {
  product: {
    id: string;
    name: string;
    slug: string;
    defaultVariant: { id: string; name: string | null } | null;
    variants: Array<{ id: string; name: string | null }> | null;
  } | null;
};

export type ServiceRequestWorkersQueryVariables = Types.Exact<{
  search: Types.Scalars['String']['input'];
  first: Types.Scalars['Int']['input'];
}>;

export type ServiceRequestWorkersQuery = {
  permissionGroups: {
    edges: Array<{
      node: {
        id: string;
        name: string;
        users: Array<{
          id: string;
          email: string;
          firstName: string | null;
          lastName: string | null;
          isActive: boolean;
        }> | null;
      } | null;
    }> | null;
  } | null;
};

export class TypedDocumentString<TResult, TVariables> extends String {
  constructor(private value: string, public __meta__?: Record<string, any>) {
    super(value);
  }
  toString() {
    return this.value;
  }
}

export const ServiceRequestChannelQueryDocument = new TypedDocumentString<
  ServiceRequestChannelQuery,
  ServiceRequestChannelQueryVariables
>(
  `query ServiceRequestChannelQuery($slug: String!) {\n  channel(slug: $slug) {\n    id\n    slug\n    name\n  }\n}`,
);

export const ServiceRequestProductQueryDocument = new TypedDocumentString<
  ServiceRequestProductQuery,
  ServiceRequestProductQueryVariables
>(
  `query ServiceRequestProductQuery($slug: String!, $channel: String!) {\n  product(slug: $slug, channel: $channel) {\n    id\n    name\n    slug\n    defaultVariant {\n      id\n      name\n    }\n    variants {\n      id\n      name\n    }\n  }\n}`,
);

export const ServiceRequestWorkersQueryDocument = new TypedDocumentString<
  ServiceRequestWorkersQuery,
  ServiceRequestWorkersQueryVariables
>(
  `query ServiceRequestWorkersQuery($search: String!, $first: Int!) {\n  permissionGroups(first: $first, filter: {search: $search}) {\n    edges {\n      node {\n        id\n        name\n        users {\n          id\n          email\n          firstName\n          lastName\n          isActive\n        }\n      }\n    }\n  }\n}`,
);
