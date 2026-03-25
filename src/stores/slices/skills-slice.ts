import type { CommandError, Skill } from '@/lib/tauri/contracts'

export type SkillsLoadStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface SkillsSlice {
	skills: Skill[]
	skillsLoadStatus: SkillsLoadStatus
	skillsError: CommandError | null
	setSkillsLoading: () => void
	setSkillsReady: (skills: Skill[]) => void
	setSkillsError: (error: CommandError) => void
}

export const createSkillsSlice = (set: SetStore<SkillsSlice>) => ({
	skills: [] as Skill[],
	skillsLoadStatus: 'idle' as SkillsLoadStatus,
	skillsError: null as CommandError | null,
	setSkillsLoading: () =>
		set({
			skillsLoadStatus: 'loading',
			skillsError: null,
		}),
	setSkillsReady: (skills: Skill[]) =>
		set({
			skills,
			skillsLoadStatus: 'ready',
			skillsError: null,
		}),
	setSkillsError: (error: CommandError) =>
		set({
			skillsLoadStatus: 'error',
			skillsError: error,
		}),
})
