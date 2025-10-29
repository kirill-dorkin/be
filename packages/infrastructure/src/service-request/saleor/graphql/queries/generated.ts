import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ServiceRequestChannelQuery_channel_Channel = { id: string, slug: string, name: string };

export type ServiceRequestChannelQuery_Query = { channel: ServiceRequestChannelQuery_channel_Channel | null };


export type ServiceRequestChannelQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
}>;


export type ServiceRequestChannelQuery = ServiceRequestChannelQuery_Query;

export type ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_metadata_MetadataItem = { key: string, value: string };

export type ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_user_User = { id: string, email: string, firstName: string, lastName: string };

export type ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_billingAddress_Address = { firstName: string, lastName: string, phone: string | null };

export type ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney_gross_Money = { amount: number, currency: string };

export type ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney = { gross: ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney_gross_Money };

export type ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order = { id: string, number: string, created: string, status: Types.OrderStatus, metadata: Array<ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_metadata_MetadataItem>, user: ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_user_User | null, billingAddress: ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_billingAddress_Address | null, total: ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order_total_TaxedMoney };

export type ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge = { node: ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge_node_Order };

export type ServiceRequestOrdersQuery_orders_OrderCountableConnection_pageInfo_PageInfo = { hasNextPage: boolean, endCursor: string | null };

export type ServiceRequestOrdersQuery_orders_OrderCountableConnection = { edges: Array<ServiceRequestOrdersQuery_orders_OrderCountableConnection_edges_OrderCountableEdge>, pageInfo: ServiceRequestOrdersQuery_orders_OrderCountableConnection_pageInfo_PageInfo };

export type ServiceRequestOrdersQuery_Query = { orders: ServiceRequestOrdersQuery_orders_OrderCountableConnection | null };


export type ServiceRequestOrdersQueryVariables = Types.Exact<{
  first: Types.Scalars['Int']['input'];
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  filter?: Types.InputMaybe<Types.OrderFilterInput>;
  sortBy?: Types.InputMaybe<Types.OrderSortingInput>;
}>;


export type ServiceRequestOrdersQuery = ServiceRequestOrdersQuery_Query;

export type ServiceRequestProductQuery_product_Product_defaultVariant_ProductVariant = { id: string, name: string };

export type ServiceRequestProductQuery_product_Product_variants_ProductVariant = { id: string, name: string };

export type ServiceRequestProductQuery_product_Product = { id: string, name: string, slug: string, defaultVariant: ServiceRequestProductQuery_product_Product_defaultVariant_ProductVariant | null, variants: Array<ServiceRequestProductQuery_product_Product_variants_ProductVariant> | null };

export type ServiceRequestProductQuery_Query = { product: ServiceRequestProductQuery_product_Product | null };


export type ServiceRequestProductQueryVariables = Types.Exact<{
  slug: Types.Scalars['String']['input'];
  channel: Types.Scalars['String']['input'];
}>;


export type ServiceRequestProductQuery = ServiceRequestProductQuery_Query;

export type ServiceRequestWorkersQuery_permissionGroups_GroupCountableConnection_edges_GroupCountableEdge_node_Group_users_User = { id: string, email: string, firstName: string, lastName: string, isActive: boolean };

export type ServiceRequestWorkersQuery_permissionGroups_GroupCountableConnection_edges_GroupCountableEdge_node_Group = { id: string, name: string, users: Array<ServiceRequestWorkersQuery_permissionGroups_GroupCountableConnection_edges_GroupCountableEdge_node_Group_users_User> | null };

export type ServiceRequestWorkersQuery_permissionGroups_GroupCountableConnection_edges_GroupCountableEdge = { node: ServiceRequestWorkersQuery_permissionGroups_GroupCountableConnection_edges_GroupCountableEdge_node_Group };

export type ServiceRequestWorkersQuery_permissionGroups_GroupCountableConnection = { edges: Array<ServiceRequestWorkersQuery_permissionGroups_GroupCountableConnection_edges_GroupCountableEdge> };

export type ServiceRequestWorkersQuery_Query = { permissionGroups: ServiceRequestWorkersQuery_permissionGroups_GroupCountableConnection | null };


export type ServiceRequestWorkersQueryVariables = Types.Exact<{
  search: Types.Scalars['String']['input'];
  first: Types.Scalars['Int']['input'];
}>;


export type ServiceRequestWorkersQuery = ServiceRequestWorkersQuery_Query;

export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const ServiceRequestChannelQueryDocument = new TypedDocumentString(`
    query ServiceRequestChannelQuery($slug: String!) {
  channel(slug: $slug) {
    id
    slug
    name
  }
}
    `) as unknown as TypedDocumentString<ServiceRequestChannelQuery, ServiceRequestChannelQueryVariables>;
export const ServiceRequestOrdersQueryDocument = new TypedDocumentString(`
    query ServiceRequestOrdersQuery($first: Int!, $after: String, $filter: OrderFilterInput, $sortBy: OrderSortingInput) {
  orders(first: $first, after: $after, filter: $filter, sortBy: $sortBy) {
    edges {
      node {
        id
        number
        created
        status
        metadata {
          key
          value
        }
        user {
          id
          email
          firstName
          lastName
        }
        billingAddress {
          firstName
          lastName
          phone
        }
        total {
          gross {
            amount
            currency
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
    `) as unknown as TypedDocumentString<ServiceRequestOrdersQuery, ServiceRequestOrdersQueryVariables>;
export const ServiceRequestProductQueryDocument = new TypedDocumentString(`
    query ServiceRequestProductQuery($slug: String!, $channel: String!) {
  product(slug: $slug, channel: $channel) {
    id
    name
    slug
    defaultVariant {
      id
      name
    }
    variants {
      id
      name
    }
  }
}
    `) as unknown as TypedDocumentString<ServiceRequestProductQuery, ServiceRequestProductQueryVariables>;
export const ServiceRequestWorkersQueryDocument = new TypedDocumentString(`
    query ServiceRequestWorkersQuery($search: String!, $first: Int!) {
  permissionGroups(first: $first, filter: {search: $search}) {
    edges {
      node {
        id
        name
        users {
          id
          email
          firstName
          lastName
          isActive
        }
      }
    }
  }
}
    `) as unknown as TypedDocumentString<ServiceRequestWorkersQuery, ServiceRequestWorkersQueryVariables>;