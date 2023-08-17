type ObjectLike<O extends Record<string, unknown> = Record<string, unknown>> = {
	[K in keyof O]: O[K]
}

export const entries = <O extends ObjectLike>(obj: O) => Object.entries(obj) as [keyof O, O[keyof O]][]
