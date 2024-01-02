import type { Getter, Args, Invocation } from "./call"
import type { HashedQueryKey } from "./query"

type PageParams<A extends Args> = Parameters<(page: number, pageSize: number, ...args: A) => any>
type Paginator<QK extends string, A extends Args, R1, R> = (arg: R1, hashKey: HashedQueryKey<string, QK, A>) => R

export type InfiniteQuery<K extends string, A extends Args, R> = Invocation<K, PageParams<A>, R, "infiniteQuery">

export function infiniteQuery<QK extends string, A extends Args, R1, R>(
  queryKey: QK,
  fn: Getter<A, R1>,
  paginator: Paginator<QK, A, R1, R>,
): InfiniteQuery<QK, A, R> {
  const getter = <SK extends string>(schemaKey: SK, ...args: A) =>
    paginator(fn(...(args.slice(2) as unknown as A)), [`${schemaKey}/${queryKey}`, ...args])
  return { key: queryKey, getter: getter as unknown as Getter<PageParams<A>, R>, type: "infiniteQuery" }
}
