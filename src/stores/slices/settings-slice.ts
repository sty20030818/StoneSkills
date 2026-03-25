import type { AppSettingsSnapshot, CommandError } from '@/lib/tauri/contracts'

export type SettingsLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface SettingsSlice {
	settingsSnapshot: AppSettingsSnapshot | null
	settingsLoadStatus: SettingsLoadStatus
	settingsError: CommandError | null
	setSettingsLoading: () => void
	setSettingsReady: (snapshot: AppSettingsSnapshot) => void
	setSettingsError: (error: CommandError) => void
}

export const createSettingsSlice = (set: SetStore<SettingsSlice>) => ({
	settingsSnapshot: null as AppSettingsSnapshot | null,
	settingsLoadStatus: 'idle' as SettingsLoadStatus,
	settingsError: null as CommandError | null,
	setSettingsLoading: () =>
		set({
			settingsLoadStatus: 'loading',
			settingsError: null,
		}),
	setSettingsReady: (snapshot: AppSettingsSnapshot) =>
		set({
			settingsSnapshot: snapshot,
			settingsLoadStatus: 'ready',
			settingsError: null,
		}),
	setSettingsError: (error: CommandError) =>
		set({
			settingsLoadStatus: 'error',
			settingsError: error,
		}),
})
