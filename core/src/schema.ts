import type { Invocation } from "./call"

export type Key<Q> = Queries<Q>[number]["key"]
export type Queries<Q> = Q extends [Invocation<infer K, infer A, infer R, infer T>, ...infer Qs]
  ? [Invocation<K, A, R, T>, ...Queries<Qs>]
  : []
export type QueryMap<Q> = {
  [K in Queries<Q>[number] as K["key"]]: Parameters<K["getter"]>
}
export type QueryReturn<Q, QK extends Key<Q>> = {
  [K in Queries<Q>[number] as K["key"]]: K extends Invocation<K["key"], any, infer R, any> ? Awaited<R> : never
}[QK]
export type QueryArgs<Q, K extends Key<Q>> = Q extends Queries<Q> ? (K extends Key<Q> ? QueryMap<Q>[K] : never) : never

export type Schema<Q> = {
  key: <K extends Key<Q>>(queryKey: K) => string
  get: <K extends Key<Q>>(queryKey: K, args: QueryArgs<Q, K>) => QueryReturn<Q, K>
  run: <K extends Key<Q>>(queryKey: K, args: QueryArgs<Q, K>) => QueryReturn<Q, K>
  queryKeys: Key<Q>[]
}

export function schema<const K, Q extends Invocation<any, any, any, any>[]>(schemaKey: K, ...queries: Q): Schema<Q> {
  const key = (queryKey: Key<Q>) => `${schemaKey}/${queryKey}`
  const get = <QK extends Key<Q>>(queryKey: QK, args: QueryArgs<Q, QK>) => {
    const match = queries.find(q => q.key === queryKey)
    return match?.type === "query"
      ? (match?.getter(`${schemaKey}/${queryKey}`, ...args) as QueryReturn<Q, QK>)
      : (match?.getter(...args) as QueryReturn<Q, QK>)
  }
  return {
    key,
    get,
    run: get,
    queryKeys: queries.map(q => q.key),
  }
}
