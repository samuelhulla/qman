import type { FirebaseAuthTypes } from "@react-native-firebase/auth"
import auth from "@react-native-firebase/auth"
import type { Unsubscribe } from "./firestore"
import type { Next } from "../../swr/src/subscribe"

type App = Parameters<typeof auth>[0]
type User = FirebaseAuthTypes.User

function currentAuth(app?: App) {
  return app ? auth(app) : auth()
}

export function authUpdater(next: Next, app?: App): Unsubscribe<User | null> {
  const authService = currentAuth(app)
  const unsub = authService.onAuthStateChanged(user => next(null, user))
  return unsub as Unsubscribe<User | null>
}
