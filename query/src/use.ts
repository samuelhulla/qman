import { useQuery } from "@tanstack/react-query"
import type { QueryKey, QueryOptions } from "@tanstack/react-query"

export function use<T, K extends QueryKey>(value: T, queryKey: K, queryOptions?: QueryOptions<T>): ReturnType<typeof useQuery> {
  return useQuery({ queryKey, queryFn: () => value, ...queryOptions })
}
