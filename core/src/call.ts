type Types = "query" | "infiniteQuery" | "call" | "request"
export type Methods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD" | "CONNECT" | "TRACE"
export type LowercaseMethods = Lowercase<Methods>

export type Args = readonly unknown[]
export type Getter<A extends Args, R, _M extends Methods = "GET"> = (...args: A) => R
export type Invocation<K extends string, A extends Args, R, T extends Types, M extends Methods> = {
  key: K
  getter: Getter<A, R, M>
  type: T
}
export type Call<K extends string, A extends Args, R, M extends Methods = "GET"> = Invocation<K, A, R, "call", M>

/**
 * Executes a built query
 * @param key The query/call key to invoke schema from
 * @param getter The funcion which executes the built query
 * @returns The query result
 */
export function call<const K extends string, A extends Args, R>(key: K, getter: Getter<A, R>): Call<K, A, R> {
  return { key, getter, type: "call" }
}
