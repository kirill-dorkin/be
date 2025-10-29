import type * as Types from '@nimara/codegen/schema';

import type { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
export type ServiceRequestDraftOrderCreateMutation_draftOrderCreate_DraftOrderCreate_order_Order = { id: string, number: string, status: Types.OrderStatus };

export type ServiceRequestDraftOrderCreateMutation_draftOrderCreate_DraftOrderCreate_errors_OrderError = { code: Types.OrderErrorCode, field: string | null, message: string | null };

export type ServiceRequestDraftOrderCreateMutation_draftOrderCreate_DraftOrderCreate = { order: ServiceRequestDraftOrderCreateMutation_draftOrderCreate_DraftOrderCreate_order_Order | null, errors: Array<ServiceRequestDraftOrderCreateMutation_draftOrderCreate_DraftOrderCreate_errors_OrderError> };

export type ServiceRequestDraftOrderCreateMutation_Mutation = { draftOrderCreate: ServiceRequestDraftOrderCreateMutation_draftOrderCreate_DraftOrderCreate | null };


export type ServiceRequestDraftOrderCreateMutationVariables = Types.Exact<{
  input: Types.DraftOrderCreateInput;
}>;


export type ServiceRequestDraftOrderCreateMutation = ServiceRequestDraftOrderCreateMutation_Mutation;

export type ServiceRequestOrderNoteAddMutation_orderNoteAdd_OrderNoteAdd_errors_OrderNoteAddError = { code: Types.OrderNoteAddErrorCode | null, field: string | null, message: string | null };

export type ServiceRequestOrderNoteAddMutation_orderNoteAdd_OrderNoteAdd = { errors: Array<ServiceRequestOrderNoteAddMutation_orderNoteAdd_OrderNoteAdd_errors_OrderNoteAddError> };

export type ServiceRequestOrderNoteAddMutation_Mutation = { orderNoteAdd: ServiceRequestOrderNoteAddMutation_orderNoteAdd_OrderNoteAdd | null };


export type ServiceRequestOrderNoteAddMutationVariables = Types.Exact<{
  orderId: Types.Scalars['ID']['input'];
  message: Types.Scalars['String']['input'];
}>;


export type ServiceRequestOrderNoteAddMutation = ServiceRequestOrderNoteAddMutation_Mutation;

export type ServiceRequestUpdateMetadataMutation_updateMetadata_UpdateMetadata_errors_MetadataError = { code: Types.MetadataErrorCode, field: string | null, message: string | null };

export type ServiceRequestUpdateMetadataMutation_updateMetadata_UpdateMetadata = { errors: Array<ServiceRequestUpdateMetadataMutation_updateMetadata_UpdateMetadata_errors_MetadataError> };

export type ServiceRequestUpdateMetadataMutation_Mutation = { updateMetadata: ServiceRequestUpdateMetadataMutation_updateMetadata_UpdateMetadata | null };


export type ServiceRequestUpdateMetadataMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Array<Types.MetadataInput> | Types.MetadataInput;
}>;


export type ServiceRequestUpdateMetadataMutation = ServiceRequestUpdateMetadataMutation_Mutation;

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

export const ServiceRequestDraftOrderCreateMutationDocument = new TypedDocumentString(`
    mutation ServiceRequestDraftOrderCreateMutation($input: DraftOrderCreateInput!) {
  draftOrderCreate(input: $input) {
    order {
      id
      number
      status
    }
    errors {
      code
      field
      message
    }
  }
}
    `) as unknown as TypedDocumentString<ServiceRequestDraftOrderCreateMutation, ServiceRequestDraftOrderCreateMutationVariables>;
export const ServiceRequestOrderNoteAddMutationDocument = new TypedDocumentString(`
    mutation ServiceRequestOrderNoteAddMutation($orderId: ID!, $message: String!) {
  orderNoteAdd(order: $orderId, input: {message: $message}) {
    errors {
      code
      field
      message
    }
  }
}
    `) as unknown as TypedDocumentString<ServiceRequestOrderNoteAddMutation, ServiceRequestOrderNoteAddMutationVariables>;
export const ServiceRequestUpdateMetadataMutationDocument = new TypedDocumentString(`
    mutation ServiceRequestUpdateMetadataMutation($id: ID!, $input: [MetadataInput!]!) {
  updateMetadata(id: $id, input: $input) {
    errors {
      code
      field
      message
    }
  }
}
    `) as unknown as TypedDocumentString<ServiceRequestUpdateMetadataMutation, ServiceRequestUpdateMetadataMutationVariables>;