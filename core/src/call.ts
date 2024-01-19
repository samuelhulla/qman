type Types = "query" | "infiniteQuery" | "call"
export type Args = readonly unknown[]
export type Getter<A extends Args, R> = (...args: A) => R
export type Invocation<K extends string, A extends Args, R, T extends Types> = {
  key: K
  getter: Getter<A, R>
  type: T
}
export type Call<K extends string, A extends Args, R> = Invocation<K, A, R, "call">

/**
 * Executes a built query
 * @param key The query/call key to invoke schema from
 * @param getter The funcion which executes the built query
 * @returns The query result
 */
export function call<const K extends string, A extends Args, R>(key: K, getter: Getter<A, R>): Call<K, A, R> {
  return { key, getter, type: "call" }
}
