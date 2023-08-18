import type { CollectionReference, DocumentData, Query, DocumentReference, DocumentChange } from "firebase/firestore"
import { onSnapshot } from "firebase/firestore"

type DocumentWithId<T extends DocumentData> = T & { id: string }
type Next = <Error, Data>(err: Error, data?: Data) => void
type SnapArgument = Parameters<typeof onSnapshot>[0]
type Unsubscribe<T> = () => T

const updateMap = <T extends DocumentData, M extends Map<string, unknown>>(map: M, change: DocumentChange<T, DocumentData>) =>
	map.set(change.doc.id, { ...change.doc.data(), id: change.doc.id } as DocumentWithId<T>)

const snapshotSubscriber = <T extends DocumentData, X extends SnapArgument, C extends Map<string, T>>(on: X, cache: C, next: Next) =>
	onSnapshot(
		on,
		snapshot => {
			snapshot.docChanges().forEach(change => {
				switch (change.type) {
					case "added":
					case "modified":
						updateMap(cache, change as DocumentChange<T, DocumentData>)
						break
					case "removed":
						cache.delete(change.doc.id)
						break
					default:
						throw Error("Unsupported internal action on firebase detected")
				}
			})
			return next(null, [...cache.values()])
		},
		error => next(error),
	)

export function collectionUpdater<T extends DocumentData>(collection: CollectionReference<T>, next: Next): Unsubscribe<T> {
	const cache: Map<string, DocumentWithId<T>> = new Map()
	const unsub = snapshotSubscriber(collection, cache, next)
	return unsub as Unsubscribe<T>
}

export function queryUpdater<T extends DocumentData>(query: Query<T>, next: Next): Unsubscribe<T> {
	const cache: Map<string, DocumentWithId<T>> = new Map()
	const unsub = snapshotSubscriber(query, cache, next)
	return unsub as Unsubscribe<T>
}

export function docUpdater<T extends DocumentData>(doc: DocumentReference<T>, next: Next): Unsubscribe<T> {
	const unsub = onSnapshot(
		doc,
		snapshot => {
			next(null, { ...snapshot.data(), id: snapshot.id } as DocumentWithId<T>)
		},
		err => next(err),
	)
	return unsub as Unsubscribe<T>
}
