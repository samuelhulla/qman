import type { SWRInfiniteConfiguration, SWRInfiniteResponse } from "swr/infinite"
import useSWRInfinite from "swr/infinite"

type Fn = (...args: any[]) => any
type Key = [string, ...unknown[]]
type Updater<T, K extends Key> = (arg: { queryKey: K; initialData: T; lastData: unknown; pageIndex: number }) => any
type UpdaterResult<U> = U extends (...args: any[]) => infer R ? (R extends Fn ? ReturnType<R> : R) : U

export const getKey =
  <T, K extends Key, U extends Updater<T, K>>(queryKey: K, query: T, pageSize: number) =>
  (pageIndex: number, lastData: UpdaterResult<U>) => {
    return {
      queryKey,
      pageIndex,
      lastData,
      pageSize,
      query,
    }
  }

export function infinite<T, K extends Key, U extends Updater<T, K>, E = Error>(
  value: T,
  queryKey: K,
  pageSize: number,
  updater: U,
  options?: SWRInfiniteConfiguration,
) {
  const res = useSWRInfinite(getKey<T, K, U>(queryKey, value, pageSize), updater, options)
  return res as SWRInfiniteResponse<UpdaterResult<U>, E>
}
