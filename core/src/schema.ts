import type { Invocation, Methods } from "./call"

export type Key<Q> = Queries<Q>[number]["key"]
export type MethodKeys<Q, M extends Methods> = QueriesWithMethod<Q, M>[number]["key"]

export type Queries<Q> = Q extends [Invocation<infer K, infer A, infer R, infer T, infer M>, ...infer Qs]
  ? [Invocation<K, A, R, T, M>, ...Queries<Qs>]
  : []
export type QueriesWithMethod<Q, M extends Methods> = Q extends [Invocation<infer K, infer A, infer R, infer T, infer Method>, ...infer Qs]
  ? Method extends M
    ? [Invocation<K, A, R, T, M>, ...QueriesWithMethod<Qs, M>]
    : QueriesWithMethod<Qs, M>
  : []

export type QueryMap<Q> = {
  [K in Queries<Q>[number] as K["key"]]: Parameters<K["getter"]>
}
export type QueryMapWithMethod<Q, M extends Methods> = {
  [K in QueriesWithMethod<Q, M>[number] as K["key"]]: Parameters<K["getter"]>
}

export type QueryArgs<Q, K extends Key<Q>> = Q extends Queries<Q> ? (K extends Key<Q> ? QueryMap<Q>[K] : never) : never
export type QueryArgsWithMethod<Q, M extends Methods, K extends Key<Q>> = {
  [QK in QueriesWithMethod<Q, M>[number] as QK["key"]]: QK extends Invocation<QK["key"], infer A, any, any, M> ? A : never
}[K]

export type QueryReturn<Q, QK extends Key<Q>> = {
  [K in Queries<Q>[number] as K["key"]]: K extends Invocation<K["key"], any, infer R, any, any> ? Awaited<R> : never
}[QK]
export type QueryReturnWithMethod<Q, QK extends Key<Q>, M extends Methods> = {
  [K in QueriesWithMethod<Q, M>[number] as K["key"]]: K extends Invocation<K["key"], any, infer R, any, M> ? Awaited<R> : never
}[QK]

type SchemaCall<Q, M extends Methods> = <K extends MethodKeys<Q, M>>(
  queryKey: K,
  args: QueryArgsWithMethod<Q, M, K>,
) => QueryReturnWithMethod<Q, K, M>

type CommonMethods<Q> = {
  key: <K extends Key<Q>>(queryKey: K) => string
  call: <K extends Key<Q>>(queryKey: K, args: QueryArgs<Q, K>) => QueryReturn<Q, K>
  queryKeys: Key<Q>[]
}

type SchemaDefinition<Q> = {
  get: SchemaCall<Q, "GET">
  post: SchemaCall<Q, "POST">
  put: SchemaCall<Q, "PUT">
  patch: SchemaCall<Q, "PATCH">
  delete: SchemaCall<Q, "DELETE">
  options: SchemaCall<Q, "OPTIONS">
  head: SchemaCall<Q, "HEAD">
  connect: SchemaCall<Q, "CONNECT">
  trace: SchemaCall<Q, "TRACE">
}

type UnusedMethods<Q> = {
  [K in keyof SchemaDefinition<Q>]: Uppercase<K> extends Methods ? (QueriesWithMethod<Q, Uppercase<K>> extends [] ? K : never) : never
}[keyof SchemaDefinition<Q>]
export type Schema<Q> = CommonMethods<Q> & Omit<SchemaDefinition<Q>, UnusedMethods<Q>>

export function schema<const K, Q extends Invocation<any, any, any, any, any>[]>(schemaKey: K, ...queries: Q): Schema<Q> {
  const key = (queryKey: Key<Q>) => `${schemaKey}/${queryKey}`
  const call = <QK extends Key<Q>, A extends QueryArgs<Q, QK>>(queryKey: QK, args: A) => {
    const match = queries.find(q => q.key === queryKey)
    return match?.type === "query"
      ? (match?.getter(`${schemaKey}/${queryKey}`, ...args) as QueryReturn<Q, QK>)
      : (match?.getter(...args) as QueryReturn<Q, QK>)
  }
  const methodCall =
    <M extends Methods>(_method: M): SchemaCall<Q, M> =>
    <QK extends MethodKeys<Q, M>, A extends QueryArgsWithMethod<Q, M, QK>>(queryKey: QK, args: A) => {
      const match = queries.find(q => q.key === queryKey)
      return match?.type === "query"
        ? (match?.getter(`${schemaKey}/${queryKey}`, ...args) as QueryReturnWithMethod<Q, QK, M>)
        : (match?.getter(...args) as QueryReturnWithMethod<Q, QK, M>)
    }
  return {
    key,
    // @ts-expect-error TS cannot know beforehand with methods will be available
    get: methodCall("GET"),
    post: methodCall("POST"),
    put: methodCall("PUT"),
    patch: methodCall("PATCH"),
    delete: methodCall("DELETE"),
    options: methodCall("OPTIONS"),
    head: methodCall("HEAD"),
    connect: methodCall("CONNECT"),
    trace: methodCall("TRACE"),
    call,
    queryKeys: queries.map(q => q.key),
  }
}
