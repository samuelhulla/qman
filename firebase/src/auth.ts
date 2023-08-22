import type { FirebaseApp } from "firebase/app"
import type { User } from "firebase/auth"
import { getAuth, onAuthStateChanged } from "firebase/auth"
import type { Next } from "../../swr/src/subscribe"

type Unsubscribe<D> = () => D

export function currentAuth(app?: FirebaseApp) {
  return app ? getAuth(app) : getAuth()
}

export function authUpdater<App extends FirebaseApp>(next: Next, app?: App): Unsubscribe<User | null> {
  const auth = currentAuth(app)
  const unsub = onAuthStateChanged(
    auth,
    user => next(null, user),
    error => next(error),
  )
  return unsub as Unsubscribe<User | null>
}
