import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
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
import { ArrowLeftIcon, type ArrowLeftIconHandle } from '@/components/ui/arrow-left'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GithubImportEntry } from '@/pages/install/components/GithubImportEntry'
import { GithubImportPreviewPanel } from '@/pages/install/components/GithubImportPreviewPanel'
import { useAppStore } from '@/stores/app-store'

type InstallSource = 'github' | 'local'
type InstallingMode = 'all' | 'selected' | null

function normalizeOverrideValue(value: string, fallback: string | null) {
	const trimmed = value.trim()

	if (trimmed.length === 0 || trimmed === (fallback ?? '')) {
		return null
	}

	return trimmed
}

function isCandidateInstallable(candidate: SkillImportCandidate) {
	return candidate.missingFields.length === 0 && candidate.conflicts.length === 0
}

function getCandidateKey(candidate: SkillImportCandidate) {
	return candidate.relativePath || candidate.slug
}

function LocalCandidateCard({
	candidate,
	sourceValue,
	importing,
	onImport,
}: {
	candidate: SkillImportCandidate
	sourceValue: string
	importing: boolean
	onImport: (candidate: SkillImportCandidate) => void
}) {
	const canImport = isCandidateInstallable(candidate) && !importing

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
				</div>
				<div className='grid gap-2 text-sm text-muted-foreground'>
					<p>来源：{sourceValue}</p>
					<p>Slug：{candidate.slug}</p>
					{candidate.readmePath ? <p>README：{candidate.readmePath}</p> : null}
				</div>
			</div>
			<div className='mt-4 grid gap-3'>
				{candidate.missingFields.length > 0 ? (
					<Alert>
						<AlertTitle>需要补齐信息</AlertTitle>
						<AlertDescription>{`缺失字段：${candidate.missingFields.join('、')}`}</AlertDescription>
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
						onClick={() => onImport(candidate)}>
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

async function waitForNextPaint() {
	await new Promise<void>((resolve) => {
		if (typeof requestAnimationFrame === 'function') {
			requestAnimationFrame(() => resolve())
			return
		}

		setTimeout(resolve, 0)
	})
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
	const [selectedCandidateKeys, setSelectedCandidateKeys] = useState<string[]>([])
	const [installingMode, setInstallingMode] = useState<InstallingMode>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)
	const [isBackButtonHovered, setIsBackButtonHovered] = useState(false)
	const backIconRef = useRef<ArrowLeftIconHandle>(null)

	const activeSourceValue = sourceType === 'github' ? githubUrl : localPath
	const headerContent = usePageHeader('导入 / 安装')
	const isGithubPreviewActive = sourceType === 'github' && preview?.sourceType === 'github'

	useEffect(() => {
		if (isBackButtonHovered) {
			backIconRef.current?.startAnimation()
			return
		}

		backIconRef.current?.stopAnimation()
	}, [isBackButtonHovered])

	const handleSourceTypeChange = (nextSourceType: InstallSource) => {
		setSourceType(nextSourceType)
		setPreview(null)
		setPreviewError(null)
		setSuccessMessage(null)
		setSelectedCandidateKeys([])
		setInstallingMode(null)
		setIsBackButtonHovered(false)
	}

	const handleInspect = async () => {
		flushSync(() => {
			setPreviewing(true)
			setPreviewError(null)
			setSuccessMessage(null)
		})

		// 先让 loading 状态完成一次绘制，再开始耗时识别。
		await waitForNextPaint()

		try {
			const nextPreview =
				sourceType === 'github'
					? await inspectGithubRepository(githubUrl.trim())
					: await inspectLocalDirectory(localPath.trim())

			setPreview(nextPreview)
			setSelectedCandidateKeys([])
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

	const handleToggleCandidate = (candidate: SkillImportCandidate) => {
		if (!isCandidateInstallable(candidate) || installingMode !== null) {
			return
		}

		const candidateKey = getCandidateKey(candidate)
		setSelectedCandidateKeys((current) =>
			current.includes(candidateKey)
				? current.filter((item) => item !== candidateKey)
				: [...current, candidateKey],
		)
	}

	const handleInstallGithubCandidates = async (candidates: SkillImportCandidate[], mode: Exclude<InstallingMode, null>) => {
		if (candidates.length === 0) {
			return
		}

		setInstallingMode(mode)
		setPreviewError(null)
		setSuccessMessage(null)

		try {
			for (const candidate of candidates) {
				await importGithubSkill({
					url: githubUrl.trim(),
					relativePath: candidate.relativePath,
					slugOverride: normalizeOverrideValue(candidate.slug, candidate.slug),
					nameOverride: normalizeOverrideValue(candidate.name, candidate.name),
					descriptionOverride: normalizeOverrideValue(candidate.description ?? '', candidate.description ?? ''),
				})
			}

			await refreshSkillsStore(setSkillsLoading, setSkillsReady, setSkillsError)

			setSuccessMessage(
				candidates.length === 1 ? `已成功导入 ${candidates[0].name}` : `已成功导入 ${candidates.length} 个 Skills`,
			)
			setSelectedCandidateKeys([])
			pushToast({
				title: '导入完成',
				description:
					candidates.length === 1 ? `${candidates[0].name} 已加入我的 Skills。` : `已完成 ${candidates.length} 个 Skill 的导入。`,
			})
		} catch (error) {
			const normalized = normalizeCommandError(error)
			setPreviewError(normalized.message)
			pushToast({
				title: '导入失败',
				description: normalized.message,
			})
		} finally {
			setInstallingMode(null)
		}
	}

	const handleInstallSelected = async () => {
		if (!preview || preview.sourceType !== 'github') {
			return
		}

		const candidates = preview.candidates.filter(
			(candidate) => isCandidateInstallable(candidate) && selectedCandidateKeys.includes(getCandidateKey(candidate)),
		)

		await handleInstallGithubCandidates(candidates, 'selected')
	}

	const handleInstallAll = async () => {
		if (!preview || preview.sourceType !== 'github') {
			return
		}

		const candidates = preview.candidates.filter(isCandidateInstallable)
		await handleInstallGithubCandidates(candidates, 'all')
	}

	const handleBackToGithubEntry = () => {
		setPreview(null)
		setPreviewError(null)
		setSuccessMessage(null)
		setSelectedCandidateKeys([])
		setInstallingMode(null)
		setIsBackButtonHovered(false)
	}

	return (
		<>
			{headerContent}
			<div
				data-testid='install-page-shell'
				className={`scrollbar-hidden h-full ${isGithubPreviewActive ? 'overflow-hidden' : 'overflow-y-auto'}`}>
				<Tabs
					value={sourceType}
					onValueChange={(value) => handleSourceTypeChange(value as InstallSource)}
					className={`flex flex-col gap-3 ${isGithubPreviewActive ? 'h-full min-h-0' : ''}`}>
					<div
						data-testid='install-source-controls'
						className='flex flex-wrap items-center gap-3'>
						{isGithubPreviewActive ? (
							<Button
								type='button'
								variant='outline'
								aria-label='返回'
								data-hovered={isBackButtonHovered ? 'true' : 'false'}
								onMouseEnter={() => setIsBackButtonHovered(true)}
								onMouseLeave={() => setIsBackButtonHovered(false)}
								onClick={handleBackToGithubEntry}>
								<ArrowLeftIcon
									aria-hidden='true'
									data-icon='inline-start'
									ref={backIconRef}
									size={14}
								/>
								<span>返回</span>
							</Button>
						) : null}
						<TabsList
							data-testid='install-source-rail'
							className='h-12 self-start justify-start rounded-full border border-border/70 bg-white p-1 shadow-none'>
							<TabsTrigger
								value='github'
								onClick={() => handleSourceTypeChange('github')}>
								GitHub
							</TabsTrigger>
							<TabsTrigger
								value='local'
								onClick={() => handleSourceTypeChange('local')}>
								本地目录
							</TabsTrigger>
						</TabsList>
					</div>
					{isGithubPreviewActive ? (
						<div
							data-testid='install-github-preview-stage'
							className='flex min-h-0 flex-1 flex-col gap-3'>
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
							<GithubImportPreviewPanel
								githubUrl={githubUrl}
								candidates={preview.candidates}
								selectedKeys={selectedCandidateKeys}
								installingMode={installingMode}
								onToggleCandidate={handleToggleCandidate}
								onClearSelection={() => setSelectedCandidateKeys([])}
								onInstallSelected={handleInstallSelected}
								onInstallAll={handleInstallAll}
								onViewDetails={() => {
									pushToast({
										title: '功能稍后开放',
										description: '查看详情流程将在下一步实现。',
									})
								}}
							/>
						</div>
					) : (
						<Card
							data-testid='install-main-card'
							className='rounded-[1.9rem] border-border/70 bg-white shadow-none'>
							<CardContent
								data-testid='install-main-body'
								className='grid gap-6'>
								{sourceType === 'github' ? (
									<GithubImportEntry
										value={githubUrl}
										loading={previewing}
										onChange={setGithubUrl}
										onSubmit={handleInspect}
									/>
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

								{preview && sourceType === 'local' ? (
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
												<LocalCandidateCard
													key={`${candidate.relativePath}:${candidate.slug}`}
													candidate={candidate}
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
					)}
				</Tabs>
			</div>
		</>
	)
}
