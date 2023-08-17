import { entries } from "./util"
import type { Fn } from "./query"

type QueryMap<T> = {
	[K in keyof T]: T[K] extends Fn ? (T[K] extends (...args: Parameters<T[K]>) => ReturnType<T[K]> ? T[K] : never) : never
}

type Schema<Key extends string, T extends QueryMap<T>> = {
	[K in keyof T as `${Key}/${K extends string ? K : never}`]: T[K]
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
 * const user = schema('user', {
 *   get: query((id: string) => ({ id, name, pic })),
 *   profilePic: query((id: string) => ({ id, name, pic }), ({ pic }) => pic),
 * })
 * ```
 */
export function schema<K extends string, T extends QueryMap<T>>(key: K, queryMap: T): Schema<K, T> {
	return entries(queryMap).reduce(
		(acc, [queryKey, queryFn]) => ({
			...acc,
			[`${key}/${queryKey.toString()}`]: queryFn,
		}),
		{} as Schema<K, T>,
	)
}
