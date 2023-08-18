import type { SWRSubscription, SWRSubscriptionOptions } from "swr/subscription"
import useSWRSub from "swr/subscription"

type Key = Parameters<typeof useSWRSub>[0]
type SWRError = Error | null

type Updater<T, E = SWRError> = (value: T, next: SWRSubscriptionOptions<T, E>["next"]) => any
type UpdaterReturn<U> = U extends (...args: any[]) => infer R ? R : never

export function subscribe<T, K extends Key, E = SWRError, U extends Updater<T, E> = Updater<T, E>>(col: T, key: K, updater: U) {
	const fn = (_: K, { next }: SWRSubscriptionOptions<T, E>) => {
		updater(col, next)
	}
	return useSWRSub(key, fn as SWRSubscription<K, UpdaterReturn<U>, E>)
}
