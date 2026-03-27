import { useMemo, useState } from 'react'
import type { CommandError, Skill, SkillImportCandidate, SkillImportPreview } from '@/lib/tauri/contracts'
import {
	importGithubSkill,
	importLocalSkill,
	inspectGithubRepository,
	inspectLocalDirectory,
	listSkills,
} from '@/lib/tauri/commands'
import { normalizeCommandError } from '@/lib/tauri/errors'
import { usePageHeader } from '@/app/layout/PageHeaderContext'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/stores/app-store'

type InstallSource = 'github' | 'local'

interface CandidateOverrides {
	slug: string
	name: string
	description: string
}

interface CandidateCardProps {
	candidate: SkillImportCandidate
	sourceType: InstallSource
	sourceValue: string
	importing: boolean
	onImport: (candidate: SkillImportCandidate) => void
}

function normalizeOverrideValue(value: string, fallback: string | null) {
	const trimmed = value.trim()

	if (trimmed.length === 0 || trimmed === (fallback ?? '')) {
		return null
	}

	return trimmed
}

function getDefaultOverrides(candidate: SkillImportCandidate): CandidateOverrides {
	return {
		slug: candidate.slug,
		name: candidate.name,
		description: candidate.description ?? '',
	}
}

function resolveMissingFields(candidate: SkillImportCandidate, overrides: CandidateOverrides) {
	return candidate.missingFields.filter((field) => {
		if (field === 'slug') return overrides.slug.trim().length === 0
		if (field === 'name') return overrides.name.trim().length === 0
		if (field === 'description') return overrides.description.trim().length === 0
		return true
	})
}

function CandidateCard({ candidate, sourceType, sourceValue, importing, onImport }: CandidateCardProps) {
	const [overrides, setOverrides] = useState(() => getDefaultOverrides(candidate))
	const unresolvedFields = useMemo(() => resolveMissingFields(candidate, overrides), [candidate, overrides])
	const hasConflicts = candidate.conflicts.length > 0
	const canImport = unresolvedFields.length === 0 && !hasConflicts && !importing

	const handleImport = () => {
		onImport({
			...candidate,
			slug: normalizeOverrideValue(overrides.slug, candidate.slug) ?? candidate.slug,
			name: normalizeOverrideValue(overrides.name, candidate.name) ?? candidate.name,
			description: normalizeOverrideValue(overrides.description, candidate.description) ?? candidate.description,
		})
	}

	return (
		<section className='rounded-[1.5rem] border border-border/70 bg-white p-5 shadow-none'>
			<div className='grid gap-3'>
				<div className='flex flex-wrap items-start justify-between gap-3'>
					<div className='space-y-2'>
						<h3 className='text-lg font-semibold tracking-[-0.03em] text-foreground'>{candidate.name}</h3>
						<p className='text-sm leading-6 text-muted-foreground'>
							{candidate.description ?? '当前缺少描述，需要在导入前补齐。'}
						</p>
					</div>
					<div className='flex flex-wrap gap-2'>
						<Badge variant='outline'>{sourceType === 'github' ? 'GitHub' : '本地目录'}</Badge>
						<Badge variant='outline'>v{candidate.version}</Badge>
						{candidate.relativePath.length > 0 ? <Badge variant='info'>{candidate.relativePath}</Badge> : null}
					</div>
				</div>
				<div className='grid gap-2 text-sm text-muted-foreground'>
					<p>来源：{sourceValue}</p>
					<p>Slug：{candidate.slug}</p>
					{candidate.readmePath ? <p>README：{candidate.readmePath}</p> : null}
				</div>
			</div>
			<div className='mt-4 grid gap-4'>
				<div className='grid gap-3 md:grid-cols-2'>
					<label className='grid gap-2 text-sm'>
						<span className='font-medium text-foreground'>Slug</span>
						<Input
							value={overrides.slug}
							onChange={(event) => {
								setOverrides((current) => ({ ...current, slug: event.target.value }))
							}}
							placeholder='输入导入后的 slug'
						/>
					</label>
					<label className='grid gap-2 text-sm'>
						<span className='font-medium text-foreground'>名称</span>
						<Input
							value={overrides.name}
							onChange={(event) => {
								setOverrides((current) => ({ ...current, name: event.target.value }))
							}}
							placeholder='输入导入后的名称'
						/>
					</label>
				</div>
				<label className='grid gap-2 text-sm'>
					<span className='font-medium text-foreground'>描述</span>
					<textarea
						value={overrides.description}
						onChange={(event) => {
							setOverrides((current) => ({ ...current, description: event.target.value }))
						}}
						placeholder='输入导入后的描述'
						className='field-sizing-content min-h-28 rounded-xl border border-input bg-transparent px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25'
					/>
				</label>

				{unresolvedFields.length > 0 ? (
					<Alert>
						<AlertTitle>需要补齐信息</AlertTitle>
						<AlertDescription>{`缺失字段：${unresolvedFields.join('、')}`}</AlertDescription>
					</Alert>
				) : null}

				{candidate.conflicts.map((conflict) => (
					<Alert key={conflict}>
						<AlertTitle>存在冲突</AlertTitle>
						<AlertDescription>{`冲突提示：${conflict}`}</AlertDescription>
					</Alert>
				))}

				<div className='flex flex-wrap items-center justify-between gap-3 border-t border-border/70 pt-1'>
					<p className='text-sm text-muted-foreground'>
						{canImport ? '当前候选项已满足导入条件。' : '请先处理缺失字段或冲突，再执行导入。'}
					</p>
					<Button
						type='button'
						disabled={!canImport}
						onClick={handleImport}>
						{importing ? '导入中...' : `导入 ${candidate.name}`}
					</Button>
				</div>
			</div>
		</section>
	)
}

async function refreshSkillsStore(
	setSkillsLoading: () => void,
	setSkillsReady: (skills: Skill[]) => void,
	setSkillsError: (error: CommandError) => void,
) {
	setSkillsLoading()

	try {
		const skills = await listSkills()
		setSkillsReady(skills)
	} catch (error) {
		setSkillsError(normalizeCommandError(error))
	}
}

export function InstallPage() {
	const setSkillsLoading = useAppStore((state) => state.setSkillsLoading)
	const setSkillsReady = useAppStore((state) => state.setSkillsReady)
	const setSkillsError = useAppStore((state) => state.setSkillsError)
	const pushToast = useAppStore((state) => state.pushToast)

	const [sourceType, setSourceType] = useState<InstallSource>('github')
	const [githubUrl, setGithubUrl] = useState('')
	const [localPath, setLocalPath] = useState('')
	const [preview, setPreview] = useState<SkillImportPreview | null>(null)
	const [previewError, setPreviewError] = useState<string | null>(null)
	const [previewing, setPreviewing] = useState(false)
	const [importingKey, setImportingKey] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)

	const activeSourceValue = sourceType === 'github' ? githubUrl : localPath
	const headerContent = usePageHeader('导入 / 安装')

	const handleInspect = async () => {
		setPreviewing(true)
		setPreviewError(null)
		setSuccessMessage(null)

		try {
			const nextPreview =
				sourceType === 'github'
					? await inspectGithubRepository(githubUrl.trim())
					: await inspectLocalDirectory(localPath.trim())

			setPreview(nextPreview)
		} catch (error) {
			const normalized = normalizeCommandError(error)
			setPreviewError(normalized.message)
			pushToast({
				title: '导入预览失败',
				description: normalized.message,
			})
		} finally {
			setPreviewing(false)
		}
	}

	const handleImport = async (candidate: SkillImportCandidate) => {
		setImportingKey(candidate.relativePath || candidate.slug)
		setPreviewError(null)
		setSuccessMessage(null)

		try {
			const slugOverride = normalizeOverrideValue(
				candidate.slug,
				preview?.candidates.find((item) => item.relativePath === candidate.relativePath)?.slug ?? candidate.slug,
			)
			const nameOverride = normalizeOverrideValue(
				candidate.name,
				preview?.candidates.find((item) => item.relativePath === candidate.relativePath)?.name ?? candidate.name,
			)
			const descriptionOverride = normalizeOverrideValue(
				candidate.description ?? '',
				preview?.candidates.find((item) => item.relativePath === candidate.relativePath)?.description ?? '',
			)

			if (sourceType === 'github') {
				await importGithubSkill({
					url: githubUrl.trim(),
					relativePath: candidate.relativePath,
					slugOverride,
					nameOverride,
					descriptionOverride,
				})
			} else {
				await importLocalSkill({
					path: localPath.trim(),
					relativePath: candidate.relativePath,
					slugOverride,
					nameOverride,
					descriptionOverride,
				})
			}

			await refreshSkillsStore(setSkillsLoading, setSkillsReady, setSkillsError)

			setSuccessMessage(`已成功导入 ${candidate.name}`)
			pushToast({
				title: '导入完成',
				description: `${candidate.name} 已加入我的 Skills。`,
			})
		} catch (error) {
			const normalized = normalizeCommandError(error)
			setPreviewError(normalized.message)
			pushToast({
				title: '导入失败',
				description: normalized.message,
			})
		} finally {
			setImportingKey(null)
		}
	}

	return (
		<>
			{headerContent}
			<div className='scrollbar-hidden h-full overflow-y-auto py-1 md:py-2'>
				<Tabs
					value={sourceType}
					onValueChange={(value) => {
						setSourceType(value as InstallSource)
						setPreview(null)
						setPreviewError(null)
						setSuccessMessage(null)
					}}
					className='flex flex-col gap-3'>
					<TabsList
						data-testid='install-source-rail'
						className='h-12 self-start justify-start rounded-full border border-border/70 bg-white p-1 shadow-none'>
						<TabsTrigger
							value='github'
							onClick={() => setSourceType('github')}>
							GitHub
						</TabsTrigger>
						<TabsTrigger
							value='local'
							onClick={() => setSourceType('local')}>
							本地目录
						</TabsTrigger>
					</TabsList>
					<Card
						data-testid='install-main-card'
						className='rounded-[1.9rem] border-border/70 bg-white shadow-none'>
						<CardContent
							data-testid='install-main-body'
							className='grid gap-6'>
							{sourceType === 'github' ? (
								<div className='grid gap-4'>
									<div className='grid gap-2'>
										<h2 className='text-lg font-semibold tracking-[-0.03em] text-foreground'>Git 仓库地址</h2>
										<div
											data-testid='install-github-input-row'
											className='grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3'>
											<label className='grid gap-2 text-sm'>
												<span className='sr-only'>Git 仓库地址</span>
												<Input
													value={githubUrl}
													onChange={(event) => setGithubUrl(event.target.value)}
													placeholder='https://github.com/user/repo 或 user/repo'
												/>
											</label>
											<Button
												type='button'
												className='min-w-28'
												disabled={previewing || githubUrl.trim().length === 0}
												onClick={handleInspect}>
												{previewing ? '识别中...' : '识别仓库'}
											</Button>
										</div>
									</div>
									<div className='grid gap-2 text-sm leading-6 text-muted-foreground'>
										<p className='font-medium text-foreground'>支持格式：</p>
										<ul className='grid gap-1 pl-5'>
											<li className='list-disc'>https://github.com/user/repo 或直接写 user/repo (Github 简写)</li>
											<li className='list-disc'>
												https://github.com/user/repo/tree/main/skills/my-skill（指定子路径）
											</li>
										</ul>
									</div>
								</div>
							) : (
								<div className='grid gap-3'>
									<label className='grid gap-2 text-sm'>
										<span className='font-medium text-foreground'>本地 Skill 目录</span>
										<Input
											value={localPath}
											onChange={(event) => setLocalPath(event.target.value)}
											placeholder='输入本地 Skill 目录'
										/>
									</label>
									<div className='flex justify-end'>
										<Button
											type='button'
											disabled={previewing || localPath.trim().length === 0}
											onClick={handleInspect}>
											{previewing ? '识别中...' : '识别目录'}
										</Button>
									</div>
								</div>
							)}

							{previewError ? (
								<Alert variant='destructive'>
									<AlertTitle>导入预览失败</AlertTitle>
									<AlertDescription>{previewError}</AlertDescription>
								</Alert>
							) : null}

							{successMessage ? (
								<Alert>
									<AlertTitle>导入完成</AlertTitle>
									<AlertDescription>{successMessage}</AlertDescription>
								</Alert>
							) : null}

							{preview ? (
								<section className='grid gap-4 border-t border-border/70 pt-2'>
									<div className='flex flex-wrap items-center justify-between gap-3'>
										<div className='space-y-1'>
											<h2 className='text-lg font-semibold'>候选 Skill</h2>
											<p className='text-sm text-muted-foreground'>
												来源：{preview.sourceLabel}，共识别到 {preview.candidates.length} 个候选项。
											</p>
										</div>
										<Badge variant='info'>{preview.sourceType === 'github' ? 'GitHub' : '本地目录'}</Badge>
									</div>
									<div className='grid gap-4'>
										{preview.candidates.map((candidate) => (
											<CandidateCard
												key={`${candidate.relativePath}:${candidate.slug}`}
												candidate={candidate}
												sourceType={preview.sourceType}
												sourceValue={activeSourceValue}
												importing={importingKey === (candidate.relativePath || candidate.slug)}
												onImport={handleImport}
											/>
										))}
									</div>
								</section>
							) : null}
						</CardContent>
					</Card>
				</Tabs>
			</div>
		</>
	)
}
