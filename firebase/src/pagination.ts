import type { DocumentData, QueryConstraint, Query, QuerySnapshot } from "firebase/firestore"
import { query, startAfter, limit, getDocs } from "firebase/firestore"

type Data<Q extends Query<DocumentData>> = Q extends Query<infer D> ? D : never

export function createPaginationQuery<Q extends Query<DocumentData>, D = Data<Q>>(
  ref: Q,
  pageSize: number,
  queryConstraints: QueryConstraint[],
) {
  return query(ref, ...queryConstraints, limit(pageSize)) as Query<D>
}

type DocumentWithId<D> = D & { id: string }

type Args<Q extends Query<DocumentData>> = {
  queryKey: [string, ...unknown[]]
  pageIndex: number
  lastData: DocumentWithId<Data<Q>>[]
  query: Q
  pageSize: number
}

type QS<D extends DocumentData> = QuerySnapshot<D>

export const paginate = async <Q extends Query<DocumentData>, A extends Args<Q>>(args: A) => {
  const { pageSize, query: ref } = args
  const firstPage = query(ref, limit(pageSize))
  let initialCache: QS<Data<Q>> | undefined
  // @ts-ignore we don't want to assign it here, on purpose for caching
  if (!initialCache) {
    initialCache = (await getDocs(firstPage)) as QS<Data<Q>>
    return initialCache.docs.map(doc => ({ ...doc.data(), id: doc.id }))
  }
  const lastVisible = (initialCache as QuerySnapshot).docs[(initialCache as QuerySnapshot).docs.length - 1]
  const nextPage = query(ref, startAfter(lastVisible), limit(pageSize))
  const nextCache = await getDocs(nextPage)
  return nextCache.docs.map(doc => ({ ...doc.data(), id: doc.id }))
}
