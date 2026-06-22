import * as TaskManager from 'expo-task-manager'
import * as BackgroundFetch from 'expo-background-fetch'
import { supabase } from '../lib/supabase'

export const REFRESH_TASK_NAME = 'background-auth-refresh'

TaskManager.defineTask(REFRESH_TASK_NAME, async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return BackgroundFetch.BackgroundFetchResult.NoData

    const { error } = await supabase.auth.refreshSession()
    if (error) throw error

    return BackgroundFetch.BackgroundFetchResult.NewData
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed
  }
})

export async function registerRefreshTask() {
  const status = await BackgroundFetch.getStatusAsync()
  if (status === BackgroundFetch.BackgroundFetchStatus.Denied) return

  const isRegistered = await TaskManager.isTaskRegisteredAsync(REFRESH_TASK_NAME)
  if (!isRegistered) {
    await BackgroundFetch.registerTaskAsync(REFRESH_TASK_NAME, {
      minimumInterval: 30 * 60,
      stopOnTerminate: false,
      startOnBoot: true,
    })
  }
}
