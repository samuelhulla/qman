import { type AxiosRequestConfig } from "axios"
import { type Args, type Getter, type Methods } from "qman"

export type ConfigWithMethod<M extends Methods> = AxiosRequestConfig & { method: M }
export type ConfigOrConfigFunction<A extends Args, M extends Methods> = ConfigWithMethod<M> | ((...args: A) => ConfigWithMethod<M>)
export type Resolver<M extends Methods, R> = (config: ConfigWithMethod<M>) => R

export function request<M extends Methods, R, A extends Args = Args>(
  config: ConfigOrConfigFunction<A, M>,
  resolver: Resolver<M, R>,
): Getter<A, R, M> {
  const configFn = typeof config === "function" ? config : () => config
  const getter = <SK extends string>(_schemaKey: SK, ...args: A) => resolver(configFn(...args))
  return getter as unknown as Getter<A, R, M>
}
