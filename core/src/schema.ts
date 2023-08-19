import { entries } from "./util"
import type { Fn } from "./query"

type QueryMap<T> = {
	[K in keyof T]: T[K] extends Fn ? T[K] : never
}

type SchemaHash<Key extends string, T extends QueryMap<T>> = {
	[K in keyof T as `${Key}/${K extends string ? K : never}`]: T[K]
}

type QueryArgs<T extends QueryMap<T>, Key extends keyof T> = {
	[K in keyof T]: T[K] extends Fn ? Parameters<ReturnType<T[K]>> : never
}[Key]

type QueryResult<T extends QueryMap<T>, Key extends keyof T> = {
	[K in keyof T]: T[K] extends Fn ? (ReturnType<T[K]> extends Fn ? ReturnType<ReturnType<T[K]>> : never) : never
}[Key]

type Schema<S, G, P> = {
	schema: S
	get: G
	prepare: P
}

type HashedKey<K extends string, Q, Args extends readonly unknown[]> = [`${K}/${Q extends string ? Q : never}`, ...Args]

/**
 * Creates a new schema object with the specified key and query map.
 * @param key - The key for the schema.
 * @param queryMap - An object that maps query keys to query functions.
 * @returns A new schema object that maps flattened query keys to query functions.
 * @template K - The type of the schema key.
 * @template T - The type of the query map.
 * @example
 * ```ts
 * const user = schema('user', {
 *   get: query((id: string) => ({ id, name, pic })),
 *   profilePic: query((id: string) => ({ id, name, pic }), ({ pic }) => pic),
 * })
 * ```
 */
export function schema<K extends string, T extends QueryMap<T>>(key: K, queryMap: T) {
	const schemaHash = entries(queryMap).reduce(
		(acc, [queryKey, queryFn]) => ({
			...acc,
			[`${key}/${queryKey.toString()}`]: queryFn,
		}),
		{} as SchemaHash<K, T>,
	)
	/**
	 * Retrieves a query function from the specified schema.
	 * @param key - The key of the query function to retrieve.
	 * @param queryArgs - The arguments to pass to the query function.
	 * @returns An object containing the query function, query key, and schema key.
	 * @template K - The type of the query key.
	 */
	const get = <Key extends keyof T>(queryKey: Key, args: QueryArgs<T, Key>) => queryMap[queryKey](key, ...args) as QueryResult<T, Key>
	const prepare = <Key extends keyof T>(queryKey: Key, args: QueryArgs<T, Key>) => ({
		queryFn: () => queryMap[queryKey](key, ...args) as (key: K, ...args: QueryArgs<T, Key>) => QueryResult<T, Key>,
		queryKey: [`${key as K}/${queryKey.toString()}`, ...args] as HashedKey<K, Key, typeof args>,
	})
	return {
		get,
		prepare,
		schema: schemaHash,
	} as Schema<typeof schemaHash, typeof get, typeof prepare>
}
