import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import type { TaskEventPayload } from '@/lib/tauri/contracts'

export const APP_READY_EVENT = 'app:ready'
export const TASK_PROGRESS_EVENT = 'task:progress'
export const TASK_COMPLETED_EVENT = 'task:completed'
export const TASK_FAILED_EVENT = 'task:failed'

export async function listenTaskEvents(handler: (payload: TaskEventPayload) => void) {
	const unlistenProgress = await listen<TaskEventPayload>(TASK_PROGRESS_EVENT, (event) => handler(event.payload))
	const unlistenCompleted = await listen<TaskEventPayload>(TASK_COMPLETED_EVENT, (event) => handler(event.payload))
	const unlistenFailed = await listen<TaskEventPayload>(TASK_FAILED_EVENT, (event) => handler(event.payload))

	return () => {
		unlistenProgress()
		unlistenCompleted()
		unlistenFailed()
	}
}

export async function listenAppReady(handler: (payload: unknown) => void): Promise<UnlistenFn> {
	return listen(APP_READY_EVENT, (event) => handler(event.payload))
}
