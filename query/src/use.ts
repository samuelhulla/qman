import { useQuery } from "@tanstack/react-query"
import type { QueryKey } from "@tanstack/react-query"

export function use<T, K extends QueryKey>(value: Promise<T>, queryKey: K) {
  return useQuery({ queryKey, queryFn: () => value })
}
