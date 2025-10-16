import type * as Types from '~@nimara/codegen/schema';

export type ServiceRequestDraftOrderCreateMutationVariables = Types.Exact<{
  input: Types.DraftOrderCreateInput;
}>;

export type ServiceRequestDraftOrderCreateMutation = {
  draftOrderCreate: {
    order: { id: string; number: string | null; status: Types.OrderStatus } | null;
    errors: Array<{
      code: Types.OrderErrorCode;
      field: string | null;
      message: string | null;
    }>;
  } | null;
};

export type ServiceRequestUpdateMetadataMutationVariables = Types.Exact<{
  id: Types.Scalars['ID']['input'];
  input: Array<Types.MetadataInput>;
}>;

export type ServiceRequestUpdateMetadataMutation = {
  updateMetadata: {
    errors: Array<{
      code: Types.MetadataErrorCode;
      field: string | null;
      message: string | null;
    }>;
  } | null;
};

export type ServiceRequestOrderNoteAddMutationVariables = Types.Exact<{
  orderId: Types.Scalars['ID']['input'];
  message: Types.Scalars['String']['input'];
}>;

export type ServiceRequestOrderNoteAddMutation = {
  orderNoteAdd: {
    errors: Array<{
      code: Types.OrderNoteAddErrorCode | null;
      field: string | null;
      message: string | null;
    }>;
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

export const ServiceRequestDraftOrderCreateMutationDocument = new TypedDocumentString<
  ServiceRequestDraftOrderCreateMutation,
  ServiceRequestDraftOrderCreateMutationVariables
>(
  `mutation ServiceRequestDraftOrderCreateMutation($input: DraftOrderCreateInput!) {\n  draftOrderCreate(input: $input) {\n    order {\n      id\n      number\n      status\n    }\n    errors {\n      code\n      field\n      message\n    }\n  }\n}`,
);

export const ServiceRequestUpdateMetadataMutationDocument = new TypedDocumentString<
  ServiceRequestUpdateMetadataMutation,
  ServiceRequestUpdateMetadataMutationVariables
>(
  `mutation ServiceRequestUpdateMetadataMutation($id: ID!, $input: [MetadataInput!]!) {\n  updateMetadata(id: $id, input: $input) {\n    errors {\n      code\n      field\n      message\n    }\n  }\n}`,
);

export const ServiceRequestOrderNoteAddMutationDocument = new TypedDocumentString<
  ServiceRequestOrderNoteAddMutation,
  ServiceRequestOrderNoteAddMutationVariables
>(
  `mutation ServiceRequestOrderNoteAddMutation($orderId: ID!, $message: String!) {\n  orderNoteAdd(order: $orderId, input: {message: $message}) {\n    errors {\n      code\n      field\n      message\n    }\n  }\n}`,
);
