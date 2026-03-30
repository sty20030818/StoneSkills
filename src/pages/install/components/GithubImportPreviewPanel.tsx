import type { SkillImportCandidate } from '@/lib/tauri/contracts'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { GithubImportCandidateCard } from './GithubImportCandidateCard'

type InstallingMode = 'all' | 'selected' | null

interface GithubImportPreviewPanelProps {
	githubUrl: string
	candidates: SkillImportCandidate[]
	selectedKeys: string[]
	installingMode: InstallingMode
	onToggleCandidate: (candidate: SkillImportCandidate) => void
	onClearSelection: () => void
	onInstallSelected: () => void
	onInstallAll: () => void
	onViewDetails: () => void
}

function formatCandidateReason(candidate: SkillImportCandidate) {
	const missingFieldText = candidate.missingFields.length > 0 ? `缺失字段 ${candidate.missingFields.join('、')}` : null
	const conflictText = candidate.conflicts.length > 0 ? candidate.conflicts.join('；') : null

	return [missingFieldText, conflictText].filter(Boolean).join('；') || null
}

function isCandidateInstallable(candidate: SkillImportCandidate) {
	return candidate.missingFields.length === 0 && candidate.conflicts.length === 0
}

export function GithubImportPreviewPanel({
	githubUrl,
	candidates,
	selectedKeys,
	installingMode,
	onToggleCandidate,
	onClearSelection,
	onInstallSelected,
	onInstallAll,
	onViewDetails,
}: GithubImportPreviewPanelProps) {
	const selectableCount = candidates.filter(isCandidateInstallable).length
	const hasSelected = selectedKeys.length > 0

	return (
		<div
			data-testid='github-import-preview-root'
			className='flex h-full min-h-0 flex-col gap-3'>
			<Card
				data-testid='github-import-preview-summary'
				className='shrink-0 rounded-[1.65rem] border-border/70 bg-white py-5 shadow-none'>
				<CardContent className='grid gap-3'>
					<div className='flex flex-wrap items-center justify-between gap-3'>
						<div className='flex flex-wrap items-center gap-3'>
							<h2 className='text-lg font-semibold tracking-[-0.03em] text-foreground'>Git 仓库地址</h2>
							<p className='text-sm text-muted-foreground'>
								<span className='sr-only'>{`识别到 ${candidates.length} 个技能`}</span>
								<span aria-hidden='true'>
									识别到 <span className='font-medium text-primary'>{candidates.length}</span> 个技能
								</span>
							</p>
						</div>
						<div className='flex flex-wrap items-center justify-end gap-2'>
							<Button
								type='button'
								onClick={onInstallAll}
								disabled={installingMode !== null || selectableCount === 0}>
								{installingMode === 'all' ? '安装中...' : '安装全部'}
							</Button>
							<Button
								type='button'
								variant='outline'
								onClick={onViewDetails}
								disabled={installingMode !== null}>
								查看详情
							</Button>
						</div>
					</div>
					<div className='grid gap-2 text-sm text-muted-foreground'>
						<Input
							value={githubUrl}
							readOnly
							aria-label='已识别的 GitHub 仓库地址'
						/>
					</div>
				</CardContent>
			</Card>

			<Card
				data-testid='github-import-preview-list-card'
				className='min-h-0 flex-1 rounded-[1.9rem] border-border/70 bg-white shadow-none'>
				<CardContent className='flex min-h-0 flex-1 flex-col gap-3 pt-1'>
					<div
						data-testid='github-import-preview-list-shell'
						className='scrollbar-hidden min-h-0 flex-1 overflow-y-auto pb-1'>
						<div
							data-testid='github-import-preview-list-items'
							className='grid gap-3'>
							{candidates.map((candidate) => {
								const candidateKey = candidate.relativePath || candidate.slug
								const disabled = !isCandidateInstallable(candidate)

								return (
									<GithubImportCandidateCard
										key={candidateKey}
										candidate={candidate}
										selected={selectedKeys.includes(candidateKey)}
										disabled={disabled}
										installing={installingMode !== null}
										reasonText={formatCandidateReason(candidate)}
										onToggle={() => onToggleCandidate(candidate)}
									/>
								)
							})}
						</div>
					</div>
				</CardContent>
				<div
					data-testid='github-import-preview-actions'
					className='shrink-0 flex items-center justify-end gap-3 px-4'>
					<Button
						type='button'
						variant='outline'
						onClick={onClearSelection}
						disabled={installingMode !== null || !hasSelected}>
						取消
					</Button>
					<Button
						type='button'
						onClick={onInstallSelected}
						disabled={installingMode !== null || !hasSelected}>
						{installingMode === 'selected' ? '安装中...' : '安装选中'}
					</Button>
				</div>
			</Card>
		</div>
	)
}
