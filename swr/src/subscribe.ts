import type { SWRSubscription, SWRSubscriptionOptions } from "swr/subscription"
import useSWRSub from "swr/subscription"

type Key = Parameters<typeof useSWRSub>[0]
type SWRError = Error | null | undefined

type Updater<R, T, E = SWRError> = (value: T, next: SWRSubscriptionOptions<T, E>["next"]) => R

export function subscribe<R, T, K extends Key, E = SWRError, U extends Updater<R, T, E> = Updater<R, T, E>>(col: T, key: K, updater: U) {
	const fn = (_: K, { next }: SWRSubscriptionOptions<T, E>) => {
		updater(col, next)
	}
	return useSWRSub(key, fn as SWRSubscription<K, ReturnType<U>, E>)
}
