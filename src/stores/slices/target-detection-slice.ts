export interface TargetSummary {
	id: string
	label: string
	status: 'unknown' | 'detected' | 'missing' | 'unsupported'
}

export interface TargetDetectionSlice {
	currentPlatform: string | null
	detectedTargets: TargetSummary[]
	setTargetSummary: (input: { currentPlatform: string; detectedTargets: TargetSummary[] }) => void
}

export const createTargetDetectionSlice = (set: SetStore<TargetDetectionSlice>) => ({
	currentPlatform: null as string | null,
	detectedTargets: [] as TargetSummary[],
	setTargetSummary: (input: { currentPlatform: string; detectedTargets: TargetSummary[] }) =>
		set({
			currentPlatform: input.currentPlatform,
			detectedTargets: input.detectedTargets,
		}),
})
