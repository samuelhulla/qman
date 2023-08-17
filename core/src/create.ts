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

/**
 * Creates a new function that can be used to retrieve query functions from a set of schemas.
 * @param schemas - An object that maps schema keys to schema objects.
 * @returns A new function that can be used to retrieve query functions from the specified schemas.
 * @template S - The type of the schema map.
 * @example
 * ```ts
 * const user = schema('user', {
 *   get: query((id: string) => ({ id, name, pic })),
 *   profilePic: query((id: string) => ({ id, name, pic }), ({ pic }) => pic),
 * })
 *
 * const get = create({ user })
 * ```
 */
export function create<S>(schemas: SchemaMap<S>) {
	/**
	 * Parses the schema key from the specified query key.
	 * @param key - The query key to parse.
	 * @returns The schema key for the specified query key.
	 * @template K - The type of the query key.
	 */
	const getSchemaKey = <K extends QueryKeys<S>>(key: K): ParsedSchemaKey<S, K> => {
		const schemaKey = key.toString().split("/")[0]
		if (!schemaKey) {
			throw Error("Make sure you specified the correct schemakey and created your schemas/getter properly")
		}
		return schemaKey as ParsedSchemaKey<S, K>
	}
	/**
	 * Retrieves a query function from the specified schema.
	 * @param key - The key of the query function to retrieve.
	 * @param queryArgs - The arguments to pass to the query function.
	 * @returns An object containing the query function, query key, and schema key.
	 * @template K - The type of the query key.
	 */
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
