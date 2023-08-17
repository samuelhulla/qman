export type Fn = (...args: any[]) => any
export type HashedQueryKey<S extends string, K extends string, A extends readonly unknown[]> = [`${S}/${K}`, ...A]
export type Modifier<K extends string, F extends Fn, R> = (arg: ReturnType<F>, hashKey: HashedQueryKey<string, K, Parameters<F>>) => R

/**
 * Builds a query from the getter function `fn` and an optional modifier function `modifier`.
 * @param fn - The function to wrap - your main getter
 * @param modifier - An optional function to modify the result of `fn`.
 * @returns A new function that calls `fn` and optionally applies `modifier` to the result.
 * @template F - The type of the function being wrapped.
 * @template R - The return type of the modifier function.
 */
export function query<K extends string, F extends Fn>(
	queryKey: K,
	fn: F,
): <SK extends string>(schemaKey: SK) => (...args: Parameters<F>) => ReturnType<F>
/**
 * Wraps a function with optional result modifier.
 * @param fn - The function to wrap.
 * @param modifier - An optional function to modify the result of `fn`.
 * @returns A new function that calls `fn` and optionally applies `modifier` to the result.
 * @template F - The type of the function being wrapped.
 * @template R - The return type of the modifier function.
 */
export function query<K extends string, F extends Fn, R, S extends string = string>(
	queryKey: K,
	fn: F,
	modifier: Modifier<K, F, R>,
): <SK extends string>(schemaKey: SK) => (...args: Parameters<F>) => R
export function query<K extends string, F extends Fn, R>(queryKey: K, fn: F, modifier?: Modifier<K, F, R>) {
	if (!modifier) {
		return (_schemaKey: string) =>
			(...args: Parameters<F>) =>
				fn(...args)
	}
	return <SK extends string>(schemaKey: SK) =>
		(...args: Parameters<F>) =>
			modifier(fn(...args), [`${schemaKey}/${queryKey}`, ...args])
}
