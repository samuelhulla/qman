import type { SWRSubscription, SWRSubscriptionOptions, SWRSubscriptionResponse } from "swr/subscription"
import useSWRSub from "swr/subscription"

type InferredType<T> = T extends (...args: any[]) => infer R
	? R
	: T extends Promise<infer R>
	? R
	: T extends Iterable<infer U>
	? U
	: T extends Record<string, infer U>
	? U
	: T extends ReadonlyArray<infer U>
	? U
	: T extends Array<infer U>
	? U
	: T extends Map<any, infer U>
	? U
	: T extends Set<infer U>
	? U
	: T extends WeakMap<any, infer U>
	? U
	: T extends WeakSet<infer U>
	? U
	: T extends { [Symbol.iterator](): infer U }
	? U
	: never

type Key = Parameters<typeof useSWRSub>[0]

type Updater<T, E> = (value: InferredType<T>, next: SWRSubscriptionOptions<InferredType<T>, E>["next"]) => void

export const subscribe =
	<T, E>(updater: Updater<T, E>) =>
	<K extends Key>(value: InferredType<T>, queryKey: K): SWRSubscriptionResponse<InferredType<T>, E> => {
		// @ts-ignore
		const listener: SWRSubscription<K, InferredType<T>, E> = (_k: K, { next }: SWRSubscriptionOptions<InferredType<T>, E>) =>
			updater(value, next)
		return useSWRSub(queryKey, listener)
	}
