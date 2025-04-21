/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onStripePaymentLinkResponse = /* GraphQL */ `subscription OnStripePaymentLinkResponse {
  onStripePaymentLinkResponse {
    data
    __typename
  }
}
` as GeneratedSubscription<
  APITypes.OnStripePaymentLinkResponseSubscriptionVariables,
  APITypes.OnStripePaymentLinkResponseSubscription
>;
