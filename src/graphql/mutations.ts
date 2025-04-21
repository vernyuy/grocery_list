/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const stripePaymentLink = /* GraphQL */ `mutation StripePaymentLink($data: String!) {
  stripePaymentLink(data: $data) {
    data
    __typename
  }
}
` as GeneratedMutation<
  APITypes.StripePaymentLinkMutationVariables,
  APITypes.StripePaymentLinkMutation
>;
export const batchUploadProducts = /* GraphQL */ `mutation BatchUploadProducts {
  batchUploadProducts
}
` as GeneratedMutation<
  APITypes.BatchUploadProductsMutationVariables,
  APITypes.BatchUploadProductsMutation
>;
export const createStripeProducts = /* GraphQL */ `mutation CreateStripeProducts {
  createStripeProducts
}
` as GeneratedMutation<
  APITypes.CreateStripeProductsMutationVariables,
  APITypes.CreateStripeProductsMutation
>;
