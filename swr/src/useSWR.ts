import useSWRInternal from "swr"
import type { PublicConfiguration, BareFetcher, SWRResponse } from "swr/_internal"

type Key = Parameters<typeof useSWRInternal>[0]
type Options<T> = Partial<PublicConfiguration<T, any, BareFetcher<T>>>

export function useSWR<T, E = Error, K extends Key = Key>(
  value: T,
  queryKey: K,
  queryOptions?: Options<T>,
): SWRResponse<Awaited<T>, E, Options<T>> {
  return useSWRInternal(queryKey, () => value, queryOptions) as SWRResponse<Awaited<T>, E, Options<T>>
}
