import useSWR from "swr"

type Key = Parameters<typeof useSWR>[0]

export function use<T, K extends Key>(value: Promise<T>, queryKey: K) {
  return useSWR(queryKey, () => value)
}
