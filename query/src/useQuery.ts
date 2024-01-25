import { useQuery as useQueryInternal } from "@tanstack/react-query"
import type { QueryKey, QueryOptions, UseQueryResult } from "@tanstack/react-query"

export function useQuery<T, E = Error, K extends QueryKey = QueryKey>(
  value: T,
  queryKey: K,
  queryOptions?: QueryOptions<T>,
): UseQueryResult<Awaited<T>, E> {
  return useQueryInternal({ queryKey, queryFn: () => value, ...queryOptions }) as UseQueryResult<Awaited<T>, E>
}
