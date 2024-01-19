import type { CollectionReference, DocumentData, Query, DocumentReference, DocumentChange } from "firebase/firestore"
import type { Next } from "../../swr/src/subscribe"
import { onSnapshot } from "firebase/firestore"

type DocumentWithId<D> = D & { id: string }
type SnapArgument = Parameters<typeof onSnapshot>[0]
type Unsubscribe<D> = () => D
type FireData<D> = D extends DocumentData ? D : never
type Data<T> = T extends CollectionReference<infer D, infer _>
  ? FireData<D>
  : T extends Query<infer D>
  ? FireData<D>
  : T extends DocumentReference<infer D>
  ? FireData<D>
  : never

const updateMap = <T extends DocumentData, M extends Map<string, unknown>>(map: M, change: DocumentChange<T, DocumentData>) =>
  map.set(change.doc.id, change?.doc.exists() ? ({ ...change.doc.data(), id: change.doc.id } as DocumentWithId<T>) : null)

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

export function collectionUpdater<T, D extends DocumentData = Data<T>>(
  collection: CollectionReference<D, D>,
  next: Next,
): Unsubscribe<DocumentWithId<D>[]> {
  const cache: Map<string, DocumentWithId<D>> = new Map()
  const unsub = snapshotSubscriber(collection, cache, next)
  return unsub as Unsubscribe<DocumentWithId<D>[]>
}

export function queryUpdater<T, D extends DocumentData = Data<T>>(query: Query<D, D>, next: Next): Unsubscribe<DocumentWithId<D>[]> {
  const cache: Map<string, DocumentWithId<D>> = new Map()
  const unsub = snapshotSubscriber(query, cache, next)
  return unsub as Unsubscribe<DocumentWithId<D>[]>
}

export function docUpdater<T, D extends DocumentData = Data<T>>(doc: DocumentReference<D, D>, next: Next): Unsubscribe<DocumentWithId<D>> {
  const unsub = onSnapshot(
    doc,
    snapshot => {
      next(null, snapshot?.exists() ? ({ ...snapshot.data(), id: snapshot.id } as DocumentWithId<D>) : null)
    },
    err => next(err),
  )
  return unsub as Unsubscribe<DocumentWithId<D>>
}
