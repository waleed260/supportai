import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import { createSyncEngine } from '../db/sync/syncEngine'
import { useSyncStore } from '../stores/syncStore'
import { getApiBaseUrl, supabase } from '../lib/supabase'
import { analytics } from '../analytics/tracker'

export const SYNC_TASK_NAME = 'background-sync'

TaskManager.defineTask(SYNC_TASK_NAME, async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return BackgroundFetch.BackgroundFetchResult.NoData

    const store = useSyncStore.getState()
    const syncEngine = createSyncEngine({
      baseUrl: getApiBaseUrl(),
      getToken: async () => session.access_token,
      orgId: store.organizationId ?? '',
    })

    const startTime = Date.now()
    const pendingCount = await syncEngine.getPendingCount()
    await syncEngine.processQueue()
    await syncEngine.cleanup()
    analytics.syncCompleted(Date.now() - startTime, pendingCount)

    return pendingCount > 0
      ? BackgroundFetch.BackgroundFetchResult.NewData
      : BackgroundFetch.BackgroundFetchResult.NoData
  } catch (err) {
    analytics.syncFailed((err as Error).message)
    return BackgroundFetch.BackgroundFetchResult.Failed
  }
})

export async function registerSyncTask() {
  const status = await BackgroundFetch.getStatusAsync()
  if (status === BackgroundFetch.BackgroundFetchStatus.Denied) return

  const isRegistered = await TaskManager.isTaskRegisteredAsync(SYNC_TASK_NAME)
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(SYNC_TASK_NAME, {
      minimumInterval: 15 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    })
  }
}

export async function unregisterSyncTask() {
  if (await TaskManager.isTaskRegisteredAsync(SYNC_TASK_NAME)) {
    await BackgroundFetch.unregisterTaskAsync(SYNC_TASK_NAME)
  }
}
