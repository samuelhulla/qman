import type { Args, Getter, Invocation } from "./call"

export type Fn = (...args: any[]) => any
export type HashedQueryKey<S extends string, K extends string, A extends Args> = [`${S}/${K}`, ...A]
export type Modifier<K extends string, A extends Args, R1, R> = (arg: R1, hashKey: HashedQueryKey<string, K, A>) => R

export type Query<K extends string, A extends Args, R> = Invocation<K, A, R, "query">

/**
 * Builds a query from the getter function `fn` and an optional modifier function `modifier`.
 * @param fn - The function to wrap - your main getter
 * @param modifier - An optional function to modify the result of `fn`.
 * @returns A new function that calls `fn` and optionally applies `modifier` to the result.
 * @template F - The type of the function being wrapped.
 * @template R - The return type of the modifier function.
 */
export function query<QK extends string, A extends Args, R>(queryKey: QK, getter: Getter<A, R>): Query<QK, A, R>
/**
 * Wraps a function with optional result modifier.
 * @param fn - The function to wrap.
 * @param modifier - An optional function to modify the result of `fn`.
 * @returns A new function that calls `fn` and optionally applies `modifier` to the result.
 * @template F - The type of the function being wrapped.
 * @template R - The return type of the modifier function.
 */
export function query<QK extends string, A extends Args, R1, R>(
  queryKey: QK,
  fn: Getter<A, R1>,
  modifier: Modifier<QK, A, R1, R>,
): Query<QK, A, R>
export function query<QK extends string, A extends Args, R1, R>(
  queryKey: QK,
  fn: Getter<A, R1>,
  modifier?: Modifier<QK, A, R1, R>,
): Query<QK, A, R> {
  if (!modifier) {
    const getter = <SK extends string>(_schemaKey: SK, ...args: A) => fn(...args)
    // This type conversion is incorrect, but it serves to act consistently with Call in type Params
    return { key: queryKey, getter: getter as unknown as Getter<A, R>, type: "query" }
  }
  const getter = <const SK extends string>(schemaKey: SK, ...args: A) => modifier(fn(...args), [`${schemaKey}/${queryKey}`, ...args])
  // This type conversion is incorrect, but it serves to act consistently with Call in type Params
  return { key: queryKey, getter: getter as unknown as Getter<A, R>, type: "query" }
}
