import type { Getter, Args, Invocation, Methods } from "./call"
import type { HashedQueryKey } from "./query"

type PageParams<A extends Args> = Parameters<(page: number, pageSize: number, ...args: A) => any>
type Paginator<QK extends string, A extends Args, R1, R> = (arg: R1, hashKey: HashedQueryKey<string, QK, A>) => R

export type InfiniteQuery<K extends string, A extends Args, R, M extends Methods> = Invocation<K, PageParams<A>, R, "infiniteQuery", M>

export function infiniteQuery<QK extends string, A extends Args, R1, R, M extends Methods>(
  queryKey: QK,
  fn: Getter<A, R1, M>,
  paginator: Paginator<QK, A, R1, R>,
): InfiniteQuery<QK, A, R, M> {
  const getter = <SK extends string>(schemaKey: SK, ...args: A) =>
    paginator(fn(...(args.slice(2) as unknown as A)), [`${schemaKey}/${queryKey}`, ...args])
  return { key: queryKey, getter: getter as unknown as Getter<PageParams<A>, R>, type: "infiniteQuery" }
}
