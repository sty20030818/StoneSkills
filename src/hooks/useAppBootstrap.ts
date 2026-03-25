import { useEffect, useRef } from 'react'
import { bootstrapApp, getAppSettingsSnapshot, listSkills, listTargets } from '@/lib/tauri/commands'
import { normalizeCommandError } from '@/lib/tauri/errors'
import { useAppStore } from '@/stores/app-store'

export function useAppBootstrap() {
	const hasRunRef = useRef(false)
	const setBootstrapLoading = useAppStore((state) => state.setBootstrapLoading)
	const setBootstrapReady = useAppStore((state) => state.setBootstrapReady)
	const setBootstrapNeedsSetup = useAppStore((state) => state.setBootstrapNeedsSetup)
	const setBootstrapError = useAppStore((state) => state.setBootstrapError)
	const setRepositoryRoots = useAppStore((state) => state.setRepositoryRoots)
	const setTargetSummary = useAppStore((state) => state.setTargetSummary)
	const setSkillsLoading = useAppStore((state) => state.setSkillsLoading)
	const setSkillsReady = useAppStore((state) => state.setSkillsReady)
	const setSkillsError = useAppStore((state) => state.setSkillsError)
	const setSettingsLoading = useAppStore((state) => state.setSettingsLoading)
	const setSettingsReady = useAppStore((state) => state.setSettingsReady)
	const setSettingsError = useAppStore((state) => state.setSettingsError)
	const pushToast = useAppStore((state) => state.pushToast)

	useEffect(() => {
		if (hasRunRef.current) {
			return
		}

		hasRunRef.current = true

		const run = async () => {
			try {
				setBootstrapLoading()
				setSkillsLoading()
				setSettingsLoading()
				const payload = await bootstrapApp()
				const [settingsSnapshot, skills, targets] = await Promise.all([
					getAppSettingsSnapshot(),
					listSkills(),
					listTargets(),
				])

				setRepositoryRoots({
					repositoryRoot: settingsSnapshot.repositoryRoot,
					suggestedRepositoryRoot: payload.paths.suggestedRepositoryDir,
				})
				setSettingsReady(settingsSnapshot)
				setSkillsReady(skills)
				setTargetSummary({
					currentPlatform: payload.system.platformLabel,
					detectedTargets: targets.map((target) => ({
						id: target.key,
						label: target.name,
						status: target.detectStatus,
					})),
				})

				if (payload.paths.suggestedRepositoryDir.length === 0) {
					setBootstrapNeedsSetup(payload)
					return
				}

				setBootstrapReady(payload)
			} catch (error) {
				const normalized = normalizeCommandError(error)
				setBootstrapError(normalized)
				setSkillsError(normalized)
				setSettingsError(normalized)
				pushToast({
					title: '应用启动检查失败',
					description: normalized.message,
				})
			}
		}

		void run()
	}, [
		pushToast,
		setBootstrapError,
		setBootstrapLoading,
		setBootstrapNeedsSetup,
		setBootstrapReady,
		setRepositoryRoots,
		setSettingsError,
		setSettingsLoading,
		setSettingsReady,
		setSkillsError,
		setSkillsLoading,
		setSkillsReady,
		setTargetSummary,
	])
}
