import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import type { CommandError, Skill, SkillImportCandidate, SkillImportPreview } from '@/lib/tauri/contracts'
import {
	importGithubSkill,
	importLocalSkill,
	inspectGithubRepository,
	inspectLocalDirectory,
	listSkills,
} from '@/lib/tauri/commands'
import { normalizeCommandError } from '@/lib/tauri/errors'
import { PageScaffold } from '@/components/shared/PageScaffold'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
		<Card className='rounded-[1.5rem] border-border/70 bg-card/88'>
			<CardHeader className='gap-3'>
				<div className='flex flex-wrap items-start justify-between gap-3'>
					<div className='space-y-2'>
						<CardTitle>{candidate.name}</CardTitle>
						<CardDescription>{candidate.description ?? '当前缺少描述，需要在导入前补齐。'}</CardDescription>
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
			</CardHeader>
			<CardContent className='grid gap-4'>
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
			</CardContent>
		</Card>
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
			const slugOverride = normalizeOverrideValue(candidate.slug, preview?.candidates.find((item) => item.relativePath === candidate.relativePath)?.slug ?? candidate.slug)
			const nameOverride = normalizeOverrideValue(candidate.name, preview?.candidates.find((item) => item.relativePath === candidate.relativePath)?.name ?? candidate.name)
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
		<PageScaffold
			eyebrow='Install Workspace'
			title='导入 / 安装'
			description='从公开 GitHub 仓库或本地目录识别 Skill，确认候选项后导入到全局仓库。'
			contentClassName='py-1 md:py-2'>
			<section className='grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,0.85fr)]'>
				<div className='grid gap-4'>
					<Card className='rounded-[1.7rem] border-border/70 bg-card/88'>
						<CardHeader className='gap-3'>
							<CardTitle>选择来源并识别 Skill</CardTitle>
							<CardDescription>先识别候选 Skill，再补齐字段并确认导入。</CardDescription>
						</CardHeader>
						<CardContent className='grid gap-4'>
							<Tabs
								value={sourceType}
								onValueChange={(value) => {
									setSourceType(value as InstallSource)
									setPreview(null)
									setPreviewError(null)
									setSuccessMessage(null)
								}}>
								<TabsList>
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
							</Tabs>

							{sourceType === 'github' ? (
								<div className='grid gap-3'>
									<label className='grid gap-2 text-sm'>
										<span className='font-medium text-foreground'>GitHub 仓库 URL</span>
										<Input
											value={githubUrl}
											onChange={(event) => setGithubUrl(event.target.value)}
											placeholder='输入 GitHub 仓库 URL'
										/>
									</label>
									<div className='flex justify-end'>
										<Button
											type='button'
											disabled={previewing || githubUrl.trim().length === 0}
											onClick={handleInspect}>
											{previewing ? '识别中...' : '识别仓库'}
										</Button>
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
						</CardContent>
					</Card>

					{preview ? (
						<section className='grid gap-4'>
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
				</div>

				<div className='grid gap-4'>
					<Card className='rounded-[1.7rem] border-border/70 bg-card/88'>
						<CardHeader className='gap-3'>
							<CardTitle>导入流程</CardTitle>
							<CardDescription>按固定流程执行，避免导入后再返工。</CardDescription>
						</CardHeader>
						<CardContent className='grid gap-3 text-sm leading-6 text-muted-foreground'>
							<p>1. 选择 GitHub 仓库或本地目录。</p>
							<p>2. 识别候选 Skill，并检查冲突与缺失字段。</p>
							<p>3. 按需覆盖 slug、名称、描述。</p>
							<p>4. 确认导入后，Skill 会复制到全局仓库。</p>
						</CardContent>
					</Card>

					<Card className='rounded-[1.7rem] border-border/70 bg-card/88'>
						<CardHeader className='gap-3'>
							<CardTitle>导入后操作</CardTitle>
							<CardDescription>成功后仍停留在当前页面，便于继续安装其他 Skill。</CardDescription>
						</CardHeader>
						<CardContent className='grid gap-3'>
							<Button
								asChild
								variant='secondary'>
								<Link to='/skills'>去我的 Skills 查看</Link>
							</Button>
							<p className='text-sm leading-6 text-muted-foreground'>
								如果当前候选项存在 slug 冲突或缺少必要字段，页面会直接阻止导入，避免破坏已安装数据。
							</p>
						</CardContent>
					</Card>
				</div>
			</section>
		</PageScaffold>
	)
}
