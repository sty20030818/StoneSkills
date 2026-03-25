import type { TaskEventPayload } from '@/lib/tauri/contracts'

export interface TaskCenterSlice {
	tasks: Record<string, TaskEventPayload>
	latestTaskId: string | null
	upsertTaskEvent: (payload: TaskEventPayload) => void
}

export const createTaskCenterSlice = (set: SetStore<TaskCenterSlice>) => ({
	tasks: {} as Record<string, TaskEventPayload>,
	latestTaskId: null as string | null,
	upsertTaskEvent: (payload: TaskEventPayload) =>
		set((state) => ({
			tasks: {
				...state.tasks,
				[payload.taskId]: payload,
			},
			latestTaskId: payload.taskId,
		})),
})
