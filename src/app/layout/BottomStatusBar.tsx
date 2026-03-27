import type { Skill } from '@/lib/tauri/contracts'
import { useAppStore } from '@/stores/app-store'

function formatLastScan(skills: Skill[]) {
	const latest = skills.reduce<number | null>((current, skill) => {
		if (skill.lastCheckedAt == null) {
			return current
		}

		return current == null ? skill.lastCheckedAt : Math.max(current, skill.lastCheckedAt)
	}, null)

	if (latest == null) {
		return '未扫描'
	}

	return new Date(latest).toLocaleString('zh-CN', {
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
	})
}

export function BottomStatusBar() {
	const bootstrapPayload = useAppStore((state) => state.bootstrapPayload)
	const skills = useAppStore((state) => state.skills)
	const repositoryRoot = useAppStore((state) => state.repositoryRoot)
	const repositoryHealthStatus = useAppStore((state) => state.repositoryHealthStatus)

	const enabledSkills = skills.filter((skill) => skill.status === 'enabled').length
	const updateCount = skills.filter((skill) => {
		if (!skill.extraMetadataJson) {
			return false
		}

		try {
			const parsed = JSON.parse(skill.extraMetadataJson) as { updateAvailable?: boolean }
			return Boolean(parsed.updateAvailable)
		} catch {
			return false
		}
	}).length

	return (
		<footer
			data-testid='bottom-status-bar'
			className='shrink-0 pt-3'>
			<div
				data-testid='bottom-status-track'
				className='relative flex min-h-10.5 flex-wrap items-center gap-x-5 gap-y-1 overflow-hidden rounded-full border border-(--shell-border-subtle) bg-(--shell-floatbar-surface-bg) px-4 py-2 text-[11px] text-muted-foreground shadow-(--shadow-floatbar-flat) md:px-5 md:text-xs'>
				<div className='flex items-center gap-2 whitespace-nowrap'>
					<strong className='text-foreground'>Skills 总数</strong>
					<span>{skills.length}</span>
				</div>
				<div className='flex items-center gap-2 whitespace-nowrap'>
					<strong className='text-foreground'>已启用</strong>
					<span>{enabledSkills}</span>
				</div>
				<div className='flex items-center gap-2 whitespace-nowrap'>
					<strong className='text-foreground'>待更新</strong>
					<span>{updateCount}</span>
				</div>
				<div className='flex items-center gap-2 whitespace-nowrap'>
					<strong className='text-foreground'>最近扫描</strong>
					<span>{formatLastScan(skills)}</span>
				</div>
				<div className='min-w-0 flex items-center gap-2 overflow-hidden'>
					<strong className='shrink-0 text-foreground'>当前仓库</strong>
					<span className='truncate'>{repositoryRoot ?? '未设置'}</span>
				</div>
				<div className='flex items-center gap-2 whitespace-nowrap'>
					<strong className='text-foreground'>仓库状态</strong>
					<span>{repositoryHealthStatus ?? '未知'}</span>
				</div>
				<div
					data-testid='status-app-version'
					className='ml-auto flex items-center gap-2 whitespace-nowrap'>
					<strong className='text-foreground'>App 版本</strong>
					<span>{bootstrapPayload?.system.appVersion ?? '未知'}</span>
				</div>
			</div>
		</footer>
	)
}
