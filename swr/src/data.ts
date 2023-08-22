import type { SWRSubscriptionResponse } from "swr/subscription"
import type { SWRResponse } from "swr"

type DataFromSWR<R> = R extends SWRSubscriptionResponse<infer D, any> ? D : R extends SWRResponse<infer D, any> ? D : R

export function data<R extends SWRSubscriptionResponse | SWRResponse>(response: R): DataFromSWR<R> {
  return response.data
}
