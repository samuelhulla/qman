import type { Fn, HashedQueryKey } from "./query"

type PageParams<F extends Fn> = Parameters<(page: number, pageSize: number, ...args: Parameters<F>) => ReturnType<F>>

type Paginator<QK extends string, F extends Fn, R = ReturnType<F>> = (
  arg: ReturnType<F>,
  hashKey: HashedQueryKey<string, QK, PageParams<F>>,
) => R
export type QueryCallback<F extends Fn, R = ReturnType<F>> = <const SK extends string>(schemaKey: SK, ...args: PageParams<F>) => R
type InfiniteQuery<F extends Fn, R> = (...args: PageParams<F>) => R
export type InfiniteQueryResult<K extends string, F extends Fn, R = ReturnType<F>> = [K, InfiniteQuery<F, R>, "infiniteQuery"]

export function infiniteQuery<QK extends string, F extends Fn, R>(
  queryKey: QK,
  fn: F,
  paginator: Paginator<QK, F, R>,
): InfiniteQueryResult<QK, F, R> {
  const exec = <SK extends string>(schemaKey: SK, ...args: PageParams<F>) =>
    paginator(fn(...args.slice(2)), [`${schemaKey}/${queryKey}`, ...args] as HashedQueryKey<SK, QK, PageParams<F>>)
  return [queryKey, exec as unknown as InfiniteQuery<F, R>, "infiniteQuery"]
}
