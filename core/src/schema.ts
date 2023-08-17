import { entries } from "./util"
import type { Fn } from "./query"

type QueryMap<T> = {
	[K in keyof T]: T[K] extends Fn ? (T[K] extends (...args: Parameters<T[K]>) => ReturnType<T[K]> ? T[K] : never) : never
}

type Schema<Key extends string, T extends QueryMap<T>> = {
	[K in keyof T as `${Key}/${K extends string ? K : never}`]: T[K]
}

export function schema<K extends string, T extends QueryMap<T>>(key: K, queryMap: T): Schema<K, T> {
	return entries(queryMap).reduce(
		(acc, [queryKey, queryFn]) => ({
			...acc,
			[`${key}/${queryKey.toString()}`]: queryFn,
		}),
		{} as Schema<K, T>,
	)
}
