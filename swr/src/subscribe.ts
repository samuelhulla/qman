import type { SWRSubscription, SWRSubscriptionOptions } from "swr/subscription"
import useSWRSub from "swr/subscription"

type Key = Parameters<typeof useSWRSub>[0]

type Updater<T, E = Error> = (value: T, next: SWRSubscriptionOptions<T, E>["next"]) => void

export function subscribe<T, K extends Key, E = Error, U extends Updater<T, E> = Updater<T, E>>(col: T, key: K, updater: U) {
	const fn = (_: K, { next }: SWRSubscriptionOptions<T, E>) => {
		updater(col, next)
	}
	return useSWRSub(key, fn as SWRSubscription<K, ReturnType<U>, E>)
}
