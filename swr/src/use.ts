import useSWR from "swr"
import type { PublicConfiguration, BareFetcher } from "swr/_internal"

type Key = Parameters<typeof useSWR>[0]
type Options<T> = Partial<PublicConfiguration<T, any, BareFetcher<T>>>

export function use<T, K extends Key>(value: T, queryKey: K, queryOptions?: Options<T>) {
  return useSWR(queryKey, () => value, queryOptions)
}
