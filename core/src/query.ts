export type Fn = (...args: any[]) => any
export type Modifier<F extends Fn, R> = (arg: ReturnType<F>) => R

/**
 * Builds a query from the getter function `fn` and an optional modifier function `modifier`.
 * @param fn - The function to wrap - your main getter
 * @param modifier - An optional function to modify the result of `fn`.
 * @returns A new function that calls `fn` and optionally applies `modifier` to the result.
 * @template F - The type of the function being wrapped.
 * @template R - The return type of the modifier function.
 */
export function query<F extends Fn>(fn: F): (...args: Parameters<F>) => ReturnType<F>
/**
 * Wraps a function with optional result modifier.
 * @param fn - The function to wrap.
 * @param modifier - An optional function to modify the result of `fn`.
 * @returns A new function that calls `fn` and optionally applies `modifier` to the result.
 * @template F - The type of the function being wrapped.
 * @template R - The return type of the modifier function.
 */
export function query<F extends Fn, R>(fn: F, modifier: Modifier<F, R>): (...args: Parameters<F>) => R
export function query<F extends Fn, R>(fn: F, modifier?: Modifier<F, R>) {
	if (!modifier) {
		return (...args: Parameters<F>) => fn(...args)
	}
	return (...args: Parameters<F>) => modifier(fn(...args))
}
