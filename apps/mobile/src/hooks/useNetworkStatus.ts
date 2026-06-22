import { useEffect } from 'react'
import NetInfo from '@react-native-community/netinfo'
import { useSyncStore } from '../stores/syncStore'

export function useNetworkStatus() {
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        useSyncStore.getState().setNetworkStatus(
          state.isInternetReachable === false ? 'poor' : 'online'
        )
      } else {
        useSyncStore.getState().setNetworkStatus('offline')
      }
    })

    return () => unsubscribe()
  }, [])
}
