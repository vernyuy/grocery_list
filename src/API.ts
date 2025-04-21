/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type StripePaymentLinkResponse = {
  __typename: "StripePaymentLinkResponse",
  data: string,
};

export type Product = {
  __typename: "Product",
  productId: string,
  category: string,
  createdDate: string,
  description: string,
  modifiedDate: string,
  name: string,
  package: Package,
  pictures: Array< string >,
  price: number,
  tags: Array< string >,
};

export type Package = {
  __typename: "Package",
  height: number,
  length: number,
  weight: number,
  width: number,
};

export type StripePaymentLinkMutationVariables = {
  data: string,
};

export type StripePaymentLinkMutation = {
  stripePaymentLink?:  {
    __typename: "StripePaymentLinkResponse",
    data: string,
  } | null,
};

export type BatchUploadProductsMutationVariables = {
};

export type BatchUploadProductsMutation = {
  batchUploadProducts?: string | null,
};

export type CreateStripeProductsMutationVariables = {
};

export type CreateStripeProductsMutation = {
  createStripeProducts?: string | null,
};

export type GetProductQueryVariables = {
  id: string,
};

export type GetProductQuery = {
  getProduct:  {
    __typename: "Product",
    productId: string,
    category: string,
    createdDate: string,
    description: string,
    modifiedDate: string,
    name: string,
    package:  {
      __typename: "Package",
      height: number,
      length: number,
      weight: number,
      width: number,
    },
    pictures: Array< string >,
    price: number,
    tags: Array< string >,
  },
};

export type OnStripePaymentLinkResponseSubscriptionVariables = {
};

export type OnStripePaymentLinkResponseSubscription = {
  onStripePaymentLinkResponse?:  {
    __typename: "StripePaymentLinkResponse",
    data: string,
  } | null,
};
