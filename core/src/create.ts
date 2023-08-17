import type { Fn } from "./query"

type SchemaMap<S> = {
	[SchemaKey in keyof S]: S[SchemaKey]
}

type QueryKeys<S> = S extends SchemaMap<S>
	? {
			[SchemaKey in keyof S]: {
				[QueryKey in keyof S[SchemaKey]]: QueryKey
			}[keyof S[SchemaKey]]
	  }[keyof S]
	: never

type SchemaArgs<S, K extends QueryKeys<S>> = S extends SchemaMap<S>
	? {
			[SchemaKey in keyof S]: {
				[QueryKey in keyof S[SchemaKey]]: QueryKey extends K
					? S[SchemaKey][QueryKey] extends Fn
						? Parameters<S[SchemaKey][QueryKey]>
						: never
					: never
			}[keyof S[SchemaKey]]
	  }[keyof S]
	: never

type ParsedSchemaKey<S, K> = S extends SchemaMap<S>
	? K extends QueryKeys<S>
		? K extends `${infer SchemaKey}/${string}`
			? SchemaKey
			: never
		: never
	: never

export function create<S>(schemas: SchemaMap<S>) {
	const getSchemaKey = <K extends QueryKeys<S>>(key: K): ParsedSchemaKey<S, K> => {
		const schemaKey = key.toString().split("/")[0]
		if (!schemaKey) {
			throw Error("Make sure you specified the correct schemakey and created your schemas/getter properly")
		}
		return schemaKey as ParsedSchemaKey<S, K>
	}
	const get = <K extends QueryKeys<S>>(key: K, queryArgs: SchemaArgs<S, K>) => {
		const queryFn = schemas[getSchemaKey(key)][key]
		const queryKey = [key, ...queryArgs]
		return {
			queryFn,
			queryKey,
			key,
		}
	}
	return get
}
