import type { SWRSubscription, SWRSubscriptionOptions, SWRSubscriptionResponse } from "swr/subscription"
import useSWRSub from "swr/subscription"

type Next = <Error, Data>(error: Error, data?: Data) => void
type SWRNext<T, E> = SWRSubscriptionOptions<T, E>
type Key = Parameters<typeof useSWRSub>[0]

type Updater<T> = <N extends Next>(value: T, next: N) => any
type Fn = (...args: any[]) => any
type UpdaterResult<U> = U extends (...args: any[]) => infer R ? (R extends Fn ? ReturnType<R> : R) : U

export function subscribe<T, K extends Key, U extends Updater<T>, E = Error>(value: T, queryKey: K, updater: U) {
	const observer = (_key: K, { next }: SWRNext<T, E>) => updater(value, next as Next)
	const res = useSWRSub(queryKey, observer as SWRSubscription<K, T, E>)
	return res as SWRSubscriptionResponse<UpdaterResult<U>, E>
}

