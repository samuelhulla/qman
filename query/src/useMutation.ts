import type { MutationKey, MutationOptions, UseMutationResult } from "@tanstack/react-query"
import { useMutation as useMutationInternal } from "@tanstack/react-query"

export function useMutation<T, E = Error, K extends MutationKey = MutationKey>(
  value: T,
  _queryKey: K,
  queryOptions?: MutationOptions<T>,
): UseMutationResult<Awaited<T>, E> {
  return useMutationInternal({ mutationFn: () => value as Promise<T>, ...queryOptions }) as UseMutationResult<Awaited<T>, E>
}
