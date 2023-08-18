import type { SWRSubscription, SWRSubscriptionOptions } from "swr/subscription"
import useSWRSub from "swr/subscription"

type Key = Parameters<typeof useSWRSub>[0]
type SWRError<E = any> = E | null | undefined

type Updater<T, R = unknown, E = SWRError> = (value: T, next: SWRSubscriptionOptions<T, E>["next"]) => R

export function subscribe<T, K extends Key, E = SWRError, U extends Updater<T> = Updater<T, E>>(col: T, key: K, updater: U) {
	const fn = (_: K, { next }: SWRSubscriptionOptions<T, E>) => {
		updater(col, next)
	}
	return useSWRSub(key, fn as SWRSubscription<K, ReturnType<typeof updater>, E>)
}
