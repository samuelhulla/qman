import type { Query, Fn } from "./query"

type KeyFnPair = [string, Fn, "infiniteQuery" | "query"]

type SchemaMap<Q> = Q extends KeyFnPair[] ? { [T in Q[number] as T[0]]: T[1] } : never

type QueryArgs<Q, K> = Q extends KeyFnPair[] ? (K extends keyof SchemaMap<Q> ? Parameters<SchemaMap<Q>[K]> : never) : never

type QueryResult<Q, K> = Q extends KeyFnPair[]
  ? K extends keyof SchemaMap<Q>
    ? SchemaMap<Q>[K] extends Query<Fn, infer R>
      ? R
      : never
    : never
  : never

type Schema<S, G> = {
  schema: S
  get: G
}

/**
 * Creates a new schema object with the specified key and query map.
 * @param key - The key for the schema.
 * @param queryMap - An object that maps query keys to query functions.
 * @returns A new schema object that maps flattened query keys to query functions.
 * @template K - The type of the schema key.
 * @template T - The type of the query map.
 * @example
 * ```ts
 * const user = schema('user',
 *   query('get', (id: string) => ({ id, name, picture })),
 *   query('picture', (id: string) => ({ id, name, picture }), ({ picture }) => picture),
 * )
 * ```
 */
export function schema<SK extends string, Q extends KeyFnPair[]>(schemaKey: SK, ...queries: Q) {
  const schemaMap = queries.reduce(
    (acc, [queryKey, queryFn, type]) => ({
      ...acc,
      [queryKey]: type === "infiniteQuery" ? (...args) => queryFn(...args.slice(1)) : queryFn,
    }),
    {} as SchemaMap<Q>,
  )
  /**
   * Retrieves a query function from the specified schema.
   * @param key - The key of the query function to retrieve.
   * @param queryArgs - The arguments to pass to the query function.
   * @returns An object containing the query function, query key, and schema key.
   * @template K - The type of the query key.
   */
  const get = <Key extends keyof SchemaMap<Q>>(queryKey: Key, args: QueryArgs<Q, Key>) =>
    schemaMap[queryKey]?.(schemaKey, ...args) as QueryResult<Q, Key>
  return {
    get,
    schema: schemaMap,
    schemaKey,
  } as Schema<typeof schemaMap, typeof get>
}
