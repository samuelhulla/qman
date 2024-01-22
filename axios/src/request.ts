import { type AxiosRequestConfig } from "axios"
import { type Args, type Getter, type Methods } from "qman"

type Config<C extends AxiosRequestConfig> = {
  [K in keyof C]: C[K] extends "method" ? (C[K] extends Methods ? C[K] : "GET") : C[K]
}

type Method<C extends AxiosRequestConfig> = C extends { method: infer M } ? (M extends Methods ? M : "GET") : "GET"

/**
 * Special function that creates a special getter with help of axios
 * @param config Function that returns axios config (use params to create dynamic config)
 * @param instance The direct axios instance function, that takes config as first argument
 * @returns Standard query `Getter` that returns axios data fetch with proper method specified
 */
export function request<A extends Args, R, C extends AxiosRequestConfig>(
  config: (...args: A) => Config<C>,
  instance: (config: Config<C>) => R,
): Getter<A, R, Method<C>> {
  const getter = <SK extends string>(_schemaKey: SK, ...args: A) => instance(config(...args))
  return getter as unknown as Getter<A, R, Method<C>>
}
