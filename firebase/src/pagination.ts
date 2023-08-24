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
  initialQuery: Q
  pageSize: number
}

type QS<D extends DocumentData> = QuerySnapshot<D>

export async function paginate<Q extends Query<DocumentData>, A extends Args<Q>, D extends DocumentData = Data<Q>>(
  args: A,
): Promise<DocumentWithId<D>[]> {
  const { lastData, initialQuery, pageSize } = args
  const initial = query(initialQuery, limit(pageSize)) as Query<D>
  let snapshots: QS<D> | null = null
  if (!lastData) {
    snapshots = await getDocs(initial)
    return snapshots.docs.map(doc => ({ ...(doc.data() as D), id: doc.id })) as DocumentWithId<D>[]
  }
  if (snapshots) {
    const last = (snapshots as QS<D>).docs[(snapshots as QS<D>).docs.length - 1]
    if (!last) {
      return lastData as DocumentWithId<D>[]
    }
    const next = query(initialQuery, startAfter(last.id), limit(pageSize)) as Query<D>
    snapshots = await getDocs(next)
    return snapshots.docs.map(doc => ({ ...(doc.data() as D), id: doc.id })) as DocumentWithId<D>[]
  }
  throw Error("Unsupported internal action on firebase detected")
}
