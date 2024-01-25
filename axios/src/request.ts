import { type AxiosRequestConfig } from "axios"
import type { Query } from "qman"
import { type Args, type Getter, type Methods, type Modifier } from "qman"

type Config<M extends Methods> = AxiosRequestConfig & { method: M }

/**
 * Special function that creates a special getter with help of axios
 * @param config Function that returns axios config (use params to create dynamic config)
 * @param instance The direct axios instance function, that takes config as first argument
 * @returns Standard query `Getter` that returns axios data fetch with proper method specified
 */
export function request<QK extends string, A extends Args, R1, const M extends Methods, R>(
  queryKey: QK,
  configFn: (...args: A) => Config<M>,
  instance: (config: Config<M>) => R1,
  modifier?: Modifier<QK, A, R1, R>,
  // @ts-expect-error
): Query<QK, A, R, typeof modifier extends undefined ? "query" : "modifiedQuery", M> {
  let method: M = "GET" as M
  const getter = <SK extends string>(schemaKey: SK, ...args: A) => {
    const config = configFn(...args)
    method = config.method ?? method
    return modifier ? modifier(instance(config), [`${schemaKey}/${queryKey}`, ...args]) : instance(config)
  }

  return {
    key: queryKey,
    getter: getter as unknown as Getter<A, typeof modifier extends undefined ? R1 : R, M>,
    // @ts-expect-error
    type: modifier ? "modifiedQuery" : "query",
    method,
  }
}
