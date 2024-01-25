import type { AppStateStatus } from "react-native"
import { AppState } from "react-native"
import Netinfo from "@react-native-community/netinfo"
import type { ProviderConfiguration, SWRConfiguration } from "swr/_internal"

type Config = SWRConfiguration &
  ProviderConfiguration & {
    provider?: (cache: Readonly<Cache>) => Cache
  }

export const nativeConfig: Config = {
  provider: _cache => new Map() as unknown as Cache,
  isOnline: () => !!Netinfo.useNetInfo().isConnected,
  isVisible: () => AppState.currentState === "active",
  initFocus: cb => {
    let appState = AppState.currentState
    const onAuthStateChanged = (nextAppState: AppStateStatus) => {
      if (appState.match(/inactive|background/) && nextAppState === "active") {
        cb()
      }
      appState = nextAppState
    }
    const sub = AppState.addEventListener("change", onAuthStateChanged)
    return () => sub.remove()
  },
  initReconnect: cb => {
    const sub = Netinfo.addEventListener(state => {
      if (state.isConnected) {
        cb()
      }
    })
    return () => sub()
  },
}
