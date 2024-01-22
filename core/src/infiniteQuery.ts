import type { Getter, Args, Query, Methods } from "./query"
import type { HashedQueryKey } from "./query"

type PageParams<A extends Args> = Parameters<(page: number, pageSize: number, ...args: A) => any>
type Paginator<QK extends string, A extends Args, R1, R> = (arg: R1, hashKey: HashedQueryKey<string, QK, A>) => R

export type InfiniteQuery<K extends string, A extends Args, R, M extends Methods> = Query<K, PageParams<A>, R, "infiniteQuery", M>

/**
 * A query modifier that requires two special pagination params
 * @param queryKey The standard query key
 * @param fn The getter function (promise/axios/fetch)
 * @param paginator Special paginator that takes state into consideration
 * @returns An infinite query
 */
export function infiniteQuery<QK extends string, A extends Args, R1, R, M extends Methods>(
  queryKey: QK,
  fn: Getter<A, R1, M>,
  paginator: Paginator<QK, A, R1, R>,
): InfiniteQuery<QK, A, R, M> {
  const getter = <SK extends string>(schemaKey: SK, ...args: A) =>
    paginator(fn(...(args.slice(2) as unknown as A)), [`${schemaKey}/${queryKey}`, ...args])
  return { key: queryKey, getter: getter as unknown as Getter<PageParams<A>, R, M>, type: "infiniteQuery" }
}
