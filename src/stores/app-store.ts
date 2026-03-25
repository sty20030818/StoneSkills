import { create } from 'zustand'
import { createBootstrapSlice, type BootstrapSlice } from '@/stores/slices/bootstrap-slice'
import { createAppShellSlice, type AppShellSlice } from '@/stores/slices/app-shell-slice'
import { createTaskCenterSlice, type TaskCenterSlice } from '@/stores/slices/task-center-slice'
import { createRepositorySlice, type RepositorySlice } from '@/stores/slices/repository-slice'
import { createTargetDetectionSlice, type TargetDetectionSlice } from '@/stores/slices/target-detection-slice'

export type AppStore = BootstrapSlice & AppShellSlice & TaskCenterSlice & RepositorySlice & TargetDetectionSlice

declare global {
	type SetStore<T> = (partial: Partial<T> | ((state: T) => Partial<T>)) => void
}

export const useAppStore = create<AppStore>()((...args) => ({
	...createBootstrapSlice(args[0] as SetStore<BootstrapSlice>),
	...createAppShellSlice(args[0] as SetStore<AppShellSlice>),
	...createTaskCenterSlice(args[0] as SetStore<TaskCenterSlice>),
	...createRepositorySlice(args[0] as SetStore<RepositorySlice>),
	...createTargetDetectionSlice(args[0] as SetStore<TargetDetectionSlice>),
}))
