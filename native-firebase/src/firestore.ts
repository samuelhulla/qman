import type { FirebaseFirestoreTypes } from "@react-native-firebase/firestore"
import type { Next } from "../../swr/src/subscribe"

type DocumentData = FirebaseFirestoreTypes.DocumentData
type DocumentChange<D extends DocumentData> = FirebaseFirestoreTypes.DocumentChange<D>
export type Unsubscribe<D> = () => D
type DocumentWithId<D extends DocumentData> = D & { id: string }
type FireData<D> = D extends DocumentData ? D : never
type Data<T> = T extends FirebaseFirestoreTypes.CollectionReference<infer D>
  ? FireData<D>
  : T extends FirebaseFirestoreTypes.Query<infer D>
  ? FireData<D>
  : T extends FirebaseFirestoreTypes.DocumentReference<infer D>
  ? FireData<D>
  : never

const updateMap = <T extends DocumentData, M extends Map<string, unknown>>(map: M, change: DocumentChange<T>) =>
  map.set(change.doc.id, change?.doc.exists ? ({ ...change.doc.data(), id: change.doc.id } as DocumentWithId<T>) : null)

const snapshotSubscriber = <T extends DocumentData, X extends FirebaseFirestoreTypes.Query<T>, C extends Map<string, T>>(
  on: X,
  cache: C,
  next: Next,
) =>
  on.onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      switch (change.type) {
        case "added":
        case "modified":
          updateMap(cache, change as DocumentChange<T>)
          break
        case "removed":
          cache.delete(change.doc.id)
          break
        default:
          throw Error("Unsupported internal action on firebase detected")
      }
    })
    return next(null, [...cache.values()])
  })

export function collectionUpdater<T, D extends DocumentData = Data<T>>(
  collection: FirebaseFirestoreTypes.CollectionReference<D>,
  next: Next,
): Unsubscribe<DocumentWithId<D>[]> {
  const cache: Map<string, DocumentWithId<D>> = new Map()
  const unsub = snapshotSubscriber(collection, cache, next)
  return unsub as Unsubscribe<DocumentWithId<D>[]>
}

export function queryUpdater<T, D extends DocumentData = Data<T>>(
  query: FirebaseFirestoreTypes.Query<D>,
  next: Next,
): Unsubscribe<DocumentWithId<D>[]> {
  const cache: Map<string, DocumentWithId<D>> = new Map()
  const unsub = snapshotSubscriber(query, cache, next)
  return unsub as Unsubscribe<DocumentWithId<D>[]>
}

export function docUpdater<T, D extends DocumentData = Data<T>>(
  doc: FirebaseFirestoreTypes.DocumentReference<D>,
  next: Next,
): Unsubscribe<DocumentWithId<D>> {
  const unsub = doc.onSnapshot(snapshot => {
    return next(null, snapshot.exists ? ({ ...snapshot.data(), id: snapshot.id } as DocumentWithId<D>) : null)
  })
  return unsub as Unsubscribe<DocumentWithId<D>>
}
