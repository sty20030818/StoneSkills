import { useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import type { Skill } from '@/lib/tauri/contracts'
import { usePageHeader } from '@/app/layout/PageHeaderContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'

type DrawerTab = 'overview' | 'readme' | 'targets' | 'version' | 'issues'
type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'secondary' | 'outline'

function parseSkillMetadata(skill: Skill) {
	if (!skill.extraMetadataJson) {
		return { updateAvailable: false, hasIssues: skill.status === 'error' }
	}

	try {
		const parsed = JSON.parse(skill.extraMetadataJson) as {
			updateAvailable?: boolean
			hasIssues?: boolean
		}

		return {
			updateAvailable: Boolean(parsed.updateAvailable),
			hasIssues: Boolean(parsed.hasIssues) || skill.status === 'error',
		}
	} catch {
		return { updateAvailable: false, hasIssues: skill.status === 'error' }
	}
}

function getPrimarySource(skill: Skill) {
	return skill.sources.find((source) => source.isPrimary) ?? skill.sources[0] ?? null
}

function getStatusLabel(status: string) {
	if (status === 'enabled') return '已启用'
	if (status === 'error') return '异常'
	if (status === 'disabled') return '未启用'
	return status
}

function getStatusTone(status: string): BadgeTone {
	if (status === 'enabled') return 'success'
	if (status === 'error') return 'error'
	if (status === 'disabled') return 'outline'
	return 'secondary'
}

function HeaderMetricPill({
	testId,
	label,
	value,
	toneClassName,
}: {
	testId: string
	label: string
	value: string
	toneClassName: string
}) {
	return (
		<div
			data-testid={testId}
			className={cn(
				'inline-flex items-center gap-2 rounded-full border border-(--shell-border-subtle) bg-white/88 px-3.5 py-2 text-sm shadow-(--shadow-pill-flat)',
				toneClassName,
			)}>
			<span className='text-[0.72rem] font-semibold tracking-[0.08em]'>{label}</span>
			<strong className='text-sm font-semibold'>{value}</strong>
		</div>
	)
}

function SkillFilterSelect({
	value,
	onValueChange,
	placeholder,
	items,
}: {
	value: string
	onValueChange: (value: string) => void
	placeholder: string
	items: Array<{ value: string; label: string; group?: string }>
}) {
	const grouped = items.reduce<Record<string, Array<{ value: string; label: string }>>>((acc, item) => {
		const group = item.group ?? 'default'
		acc[group] ??= []
		acc[group].push({ value: item.value, label: item.label })
		return acc
	}, {})

	return (
		<Select
			value={value}
			onValueChange={onValueChange}>
			<SelectTrigger>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				{Object.entries(grouped).map(([group, groupItems]) => (
					<SelectGroup key={group}>
						{group !== 'default' ? <SelectLabel>{group}</SelectLabel> : null}
						{groupItems.map((item) => (
							<SelectItem
								key={item.value}
								value={item.value}>
								{item.label}
							</SelectItem>
						))}
					</SelectGroup>
				))}
			</SelectContent>
		</Select>
	)
}

function SkillDetailDrawer({
	skill,
	tab,
	onChangeTab,
	onClose,
}: {
	skill: Skill
	tab: DrawerTab
	onChangeTab: (tab: DrawerTab) => void
	onClose: () => void
}) {
	const metadata = parseSkillMetadata(skill)
	const primarySource = getPrimarySource(skill)
	const tabs: Array<{ id: DrawerTab; label: string }> = [
		{ id: 'overview', label: '概览' },
		{ id: 'readme', label: 'README' },
		{ id: 'targets', label: '工具支持' },
		{ id: 'version', label: '版本' },
		{ id: 'issues', label: '问题' },
	]

	return (
		<Sheet
			open
			onOpenChange={(open) => {
				if (!open) {
					onClose()
				}
			}}>
			<SheetContent
				side='right'
				showCloseButton={false}
				className='gap-0 p-0'>
				<SheetHeader className='gap-4 border-b border-border/70 bg-(--drawer-header-bg)'>
					<div className='flex items-start justify-between gap-3'>
						<div className='space-y-2'>
							<Badge variant='info'>Skill Context</Badge>
							<div className='space-y-2'>
								<SheetTitle>{skill.name}</SheetTitle>
								<SheetDescription>{skill.description ?? '当前 Skill 暂无描述'}</SheetDescription>
							</div>
						</div>
						<Button
							variant='ghost'
							size='sm'
							onClick={onClose}>
							关闭详情
						</Button>
					</div>
					<div className='flex flex-wrap gap-2'>
						<Badge variant={getStatusTone(skill.status)}>{getStatusLabel(skill.status)}</Badge>
						<Badge variant='outline'>v{skill.version}</Badge>
						<Badge variant='outline'>{primarySource?.sourceType ?? skill.installMethod}</Badge>
						{metadata.updateAvailable ? <Badge variant='warning'>待更新</Badge> : null}
					</div>
				</SheetHeader>

				<div className='scrollbar-hidden flex-1 overflow-y-auto p-5'>
					<div className='flex flex-col gap-5'>
						<div className='rounded-[1.35rem] border border-border/80 bg-card/80 p-4 shadow-(--shadow-soft)'>
							<div className='flex items-center justify-between gap-3'>
								<strong className='text-sm text-foreground'>状态摘要</strong>
								<Badge variant={metadata.hasIssues ? 'warning' : 'success'}>
									{metadata.hasIssues ? '需要处理' : '状态稳定'}
								</Badge>
							</div>
							<p className='mt-2 text-sm leading-6 text-muted-foreground'>
								{metadata.hasIssues
									? '当前需要关注问题与兼容性。'
									: '当前状态稳定，可继续作为工作台中的常用 Skill 使用。'}{' '}
								支持 {skill.supportedTargets.length} 个 AI 工具。
							</p>
						</div>

						<div className='flex flex-wrap gap-2'>
							{tabs.map((item) => (
								<Button
									key={item.id}
									variant={item.id === tab ? 'default' : 'outline'}
									size='sm'
									onClick={() => onChangeTab(item.id)}>
									{item.label}
								</Button>
							))}
						</div>

						{tab === 'overview' ? (
							<div className='grid gap-3'>
								<div className='rounded-2xl border border-border/80 bg-card/84 p-4'>
									<strong className='text-sm'>本地路径</strong>
									<p className='mt-1 break-all text-sm leading-6 text-muted-foreground'>{skill.localPath}</p>
								</div>
								<div className='rounded-2xl border border-border/80 bg-card/84 p-4'>
									<strong className='text-sm'>标签</strong>
									<p className='mt-1 text-sm leading-6 text-muted-foreground'>
										{skill.tags.length > 0 ? skill.tags.join('、') : '暂无标签'}
									</p>
								</div>
							</div>
						) : null}

						{tab === 'readme' ? (
							<div className='rounded-2xl border border-border/80 bg-card/84 p-4'>
								<strong className='text-sm'>README 摘要</strong>
								<p className='mt-1 text-sm leading-6 text-muted-foreground'>
									{skill.readmePath
										? `已检测到 README：${skill.readmePath}`
										: '当前未记录 README 路径，后续可在详情内继续补足。'}
								</p>
							</div>
						) : null}

						{tab === 'targets' ? (
							<div className='grid gap-3'>
								{skill.supportedTargets.map((target) => (
									<div
										key={target.targetKey}
										className='rounded-2xl border border-border/80 bg-card/84 p-4'>
										<div className='flex items-center justify-between gap-3'>
											<strong className='text-sm'>{target.targetKey}</strong>
											<Badge variant='info'>{target.supportLevel}</Badge>
										</div>
										<p className='mt-1 text-sm leading-6 text-muted-foreground'>支持等级：{target.supportLevel}</p>
									</div>
								))}
							</div>
						) : null}

						{tab === 'version' ? (
							<div className='rounded-2xl border border-border/80 bg-card/84 p-4'>
								<strong className='text-sm'>版本与更新</strong>
								<p className='mt-1 text-sm leading-6 text-muted-foreground'>
									当前版本 v{skill.version}
									{metadata.updateAvailable ? '，检测到待更新版本。' : '，当前未发现待更新。'}
								</p>
							</div>
						) : null}

						{tab === 'issues' ? (
							<div className='rounded-2xl border border-warning-border bg-warning-bg p-4 text-warning'>
								<strong className='text-sm'>问题与建议</strong>
								<ul className='mt-2 grid gap-2 text-sm leading-6 text-warning/90'>
									<li>• 当前 Skill 存在异常或兼容性提示。</li>
									<li>• 可结合 AI 工具页继续查看受影响的工具范围。</li>
								</ul>
							</div>
						) : null}
					</div>
				</div>

				<SheetFooter className='border-t border-border/70 bg-background/88'>
					<div className='flex flex-wrap gap-2'>
						<Button size='sm'>启用</Button>
						<Button
							variant='secondary'
							size='sm'>
							更新
						</Button>
						<Button
							variant='outline'
							size='sm'>
							查看 AI 工具影响
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	)
}

export function SkillsPage() {
	const navigate = useNavigate()
	const skills = useAppStore((state) => state.skills)
	const skillsLoadStatus = useAppStore((state) => state.skillsLoadStatus)
	const detectedTargets = useAppStore((state) => state.detectedTargets)
	const [searchParams, setSearchParams] = useSearchParams()
	const [searchKeyword, setSearchKeyword] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [sourceFilter, setSourceFilter] = useState('all')
	const [toolFilter, setToolFilter] = useState('all')
	const [sortBy, setSortBy] = useState('updatedAt')
	const [selectedIds, setSelectedIds] = useState<string[]>([])

	const metrics = useMemo(() => {
		const issueCount = skills.filter((skill) => parseSkillMetadata(skill).hasIssues || skill.status === 'error').length
		const updateCount = skills.filter((skill) => parseSkillMetadata(skill).updateAvailable).length

		return {
			installed: skills.length,
			enabled: skills.filter((skill) => skill.status === 'enabled').length,
			issues: issueCount,
			updates: updateCount,
		}
	}, [skills])

	const filteredSkills = useMemo(() => {
		const normalizedKeyword = searchKeyword.trim().toLowerCase()
		const next = skills.filter((skill) => {
			const metadata = parseSkillMetadata(skill)
			const primarySource = getPrimarySource(skill)
			const matchesKeyword =
				normalizedKeyword.length === 0 ||
				skill.name.toLowerCase().includes(normalizedKeyword) ||
				(skill.description ?? '').toLowerCase().includes(normalizedKeyword) ||
				skill.tags.some((tag) => tag.toLowerCase().includes(normalizedKeyword))
			const matchesStatus =
				statusFilter === 'all' ||
				(statusFilter === 'issues' && (metadata.hasIssues || skill.status === 'error')) ||
				(statusFilter === 'updates' && metadata.updateAvailable) ||
				(statusFilter === 'enabled' && skill.status === 'enabled') ||
				(statusFilter === 'disabled' && skill.status === 'disabled')
			const matchesSource =
				sourceFilter === 'all' || (primarySource?.sourceType ?? skill.installMethod) === sourceFilter
			const matchesTool =
				toolFilter === 'all' || skill.supportedTargets.some((target) => target.targetKey === toolFilter)

			return matchesKeyword && matchesStatus && matchesSource && matchesTool
		})

		return next.sort((left, right) => {
			if (sortBy === 'name') return left.name.localeCompare(right.name, 'zh-CN')
			return right.updatedAt - left.updatedAt
		})
	}, [searchKeyword, skills, sortBy, sourceFilter, statusFilter, toolFilter])

	const selectedSkillKey = searchParams.get('skill')
	const drawerTab = (searchParams.get('tab') as DrawerTab | null) ?? 'overview'
	const selectedSkill =
		filteredSkills.find((skill) => skill.slug === selectedSkillKey || skill.id === selectedSkillKey) ??
		skills.find((skill) => skill.slug === selectedSkillKey || skill.id === selectedSkillKey) ??
		null

	const openSkillDrawer = (skill: Skill, tab: DrawerTab = 'overview') => {
		const next = new URLSearchParams(searchParams)
		next.set('skill', skill.slug)
		next.set('tab', tab)
		setSearchParams(next)
	}

	const closeSkillDrawer = () => {
		const next = new URLSearchParams(searchParams)
		next.delete('skill')
		next.delete('tab')
		setSearchParams(next)
	}

	const handleDrawerTabChange = (tab: DrawerTab) => {
		const next = new URLSearchParams(searchParams)
		next.set('tab', tab)
		setSearchParams(next)
	}

	const toggleSelection = (skillId: string) => {
		setSelectedIds((current) =>
			current.includes(skillId) ? current.filter((item) => item !== skillId) : [...current, skillId],
		)
	}

	const headerContent = usePageHeader(
		'我的 Skills',
		<>
			<Button
				type='button'
				onClick={() => navigate('/install')}>
				导入 Skill
			</Button>
			<Button
				variant='secondary'
				type='button'>
				重新扫描
			</Button>
		</>,
		<div
			data-testid='skills-header-metrics'
			className='flex min-w-0 flex-wrap items-center justify-center gap-2'>
			<HeaderMetricPill
				testId='skills-header-metric-installed'
				label='已安装'
				value={String(metrics.installed)}
				toneClassName='text-slate-600'
			/>
			<HeaderMetricPill
				testId='skills-header-metric-enabled'
				label='已启用'
				value={String(metrics.enabled)}
				toneClassName='text-emerald-600'
			/>
			<HeaderMetricPill
				testId='skills-header-metric-updates'
				label='待更新'
				value={String(metrics.updates)}
				toneClassName='text-amber-600'
			/>
			<HeaderMetricPill
				testId='skills-header-metric-issues'
				label='异常'
				value={String(metrics.issues)}
				toneClassName='text-rose-600'
			/>
		</div>,
	)

	return (
		<>
			{headerContent}
			<section className='flex h-full min-h-0 flex-col gap-3 py-1 md:py-2'>
				<div
					data-testid='skills-filter-bar'
					className='shrink-0 rounded-[1.65rem] border border-border/70 bg-white p-3 shadow-none'>
					<div className='grid gap-2 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,0.92fr))]'>
						<Input
							value={searchKeyword}
							onChange={(event) => setSearchKeyword(event.target.value)}
							placeholder='搜索 Skills'
						/>
						<SkillFilterSelect
							value={statusFilter}
							onValueChange={setStatusFilter}
							placeholder='全部状态'
							items={[
								{ value: 'all', label: '全部状态' },
								{ value: 'issues', label: '异常' },
								{ value: 'updates', label: '待更新' },
								{ value: 'enabled', label: '已启用' },
								{ value: 'disabled', label: '未启用' },
							]}
						/>
						<SkillFilterSelect
							value={sourceFilter}
							onValueChange={setSourceFilter}
							placeholder='全部来源'
							items={[
								{ value: 'all', label: '全部来源' },
								{ value: 'github', label: 'GitHub' },
								{ value: 'local', label: '本地' },
							]}
						/>
						<SkillFilterSelect
							value={toolFilter}
							onValueChange={setToolFilter}
							placeholder='全部工具'
							items={[
								{ value: 'all', label: '全部工具' },
								...detectedTargets.map((target) => ({
									value: target.id,
									label: target.label,
								})),
							]}
						/>
						<SkillFilterSelect
							value={sortBy}
							onValueChange={setSortBy}
							placeholder='最近更新'
							items={[
								{ value: 'updatedAt', label: '最近更新' },
								{ value: 'name', label: '名称排序' },
							]}
						/>
					</div>
				</div>

				{selectedIds.length > 0 ? (
					<div className='shrink-0 rounded-2xl border border-info-border bg-info-bg px-4 py-3 text-info shadow-(--shadow-soft)'>
						<div className='flex flex-wrap items-center gap-2'>
							<strong className='mr-2 text-sm'>已选择 {selectedIds.length} 项</strong>
							<Button size='sm'>启用</Button>
							<Button
								variant='secondary'
								size='sm'>
								停用
							</Button>
							<Button
								variant='outline'
								size='sm'>
								更新
							</Button>
							<Button
								variant='outline'
								size='sm'>
								重新检测
							</Button>
						</div>
					</div>
				) : null}

				<div
					data-testid='skills-card-list'
					className='scrollbar-hidden min-h-0 flex-1 overflow-y-auto'>
					<div className='grid gap-3 pb-1'>
						{filteredSkills.length === 0 ? (
							<EmptyState
								title={skillsLoadStatus === 'loading' ? '正在读取 Skills' : '当前没有符合条件的 Skill'}
								description='你可以调整筛选条件，或先通过导入 / 安装页面把 Skill 纳入工作台。'
							/>
						) : (
							filteredSkills.map((skill) => {
								const metadata = parseSkillMetadata(skill)
								const primarySource = getPrimarySource(skill)
								const selected = selectedIds.includes(skill.id)

								return (
									<Card
										key={skill.id}
										data-testid={`skill-card-${skill.slug}`}
										className='rounded-[1.45rem] border-border/70 bg-white shadow-none'>
										<CardHeader>
											<div className='flex flex-wrap items-start justify-between gap-3'>
												<div className='flex items-start gap-3'>
													<input
														type='checkbox'
														checked={selected}
														onClick={(event) => event.stopPropagation()}
														onChange={() => toggleSelection(skill.id)}
														aria-label={`选择 ${skill.name}`}
														className='mt-1 size-4 rounded border-border bg-background text-primary'
													/>
													<div className='space-y-2'>
														<div className='flex flex-wrap gap-2'>
															<Badge variant={getStatusTone(skill.status)}>{getStatusLabel(skill.status)}</Badge>
															<Badge variant='outline'>v{skill.version}</Badge>
															{metadata.updateAvailable ? <Badge variant='warning'>待更新</Badge> : null}
														</div>
														<div className='space-y-1'>
															<CardTitle>{skill.name}</CardTitle>
															<CardDescription>{skill.description ?? '当前 Skill 暂无描述'}</CardDescription>
														</div>
													</div>
												</div>
												<Button
													variant='ghost'
													size='sm'
													onClick={(event) => {
														event.stopPropagation()
														openSkillDrawer(skill, 'overview')
													}}>
													查看详情
												</Button>
											</div>
										</CardHeader>

										<CardContent className='pt-0'>
											<div
												role='button'
												tabIndex={0}
												data-testid={`skill-card-trigger-${skill.slug}`}
												aria-label={`打开 ${skill.name} 详情`}
												className='grid gap-4 rounded-[1.2rem] p-1 text-left transition-colors outline-none hover:bg-muted/24 focus-visible:ring-3 focus-visible:ring-ring/25'
												onClick={() => openSkillDrawer(skill, 'overview')}
												onKeyDown={(event) => {
													if (event.key === 'Enter' || event.key === ' ') {
														event.preventDefault()
														openSkillDrawer(skill, 'overview')
													}
												}}>
												<div className='grid gap-3 sm:grid-cols-3'>
													<div className='rounded-2xl border border-border/80 bg-white p-4'>
														<strong className='text-sm'>来源</strong>
														<p className='mt-1 text-sm leading-6 text-muted-foreground'>
															{primarySource?.sourceType ?? skill.installMethod}
														</p>
													</div>
													<div className='rounded-2xl border border-border/80 bg-white p-4'>
														<strong className='text-sm'>工具支持</strong>
														<p className='mt-1 text-sm leading-6 text-muted-foreground'>
															{skill.supportedTargets.length > 0
																? skill.supportedTargets.map((item) => item.targetKey).join('、')
																: '尚未声明'}
														</p>
													</div>
													<div
														className={cn(
															'rounded-2xl border p-4',
															metadata.hasIssues
																? 'border-warning-border bg-warning-bg text-warning'
																: 'border-border/80 bg-white',
														)}>
														<strong className='text-sm'>问题摘要</strong>
														<p
															className={cn(
																'mt-1 text-sm leading-6',
																metadata.hasIssues ? 'text-warning/90' : 'text-muted-foreground',
															)}>
															{metadata.hasIssues ? '存在异常或兼容性提示' : '当前未发现显著问题'}
														</p>
													</div>
												</div>
												<p className='text-sm leading-6 text-muted-foreground'>
													标签：{skill.tags.length > 0 ? skill.tags.join('、') : '暂无'}
												</p>
											</div>
											<div className='flex justify-end gap-2 pt-3'>
												<Button
													variant='outline'
													size='sm'
													onClick={(event) => {
														event.stopPropagation()
														openSkillDrawer(skill, 'overview')
													}}>
													查看详情
												</Button>
												<Button
													variant='ghost'
													size='sm'
													onClick={(event) => {
														event.stopPropagation()
														openSkillDrawer(skill, 'issues')
													}}>
													查看问题
												</Button>
											</div>
										</CardContent>
									</Card>
								)
							})
						)}
					</div>
				</div>
			</section>

			{selectedSkill ? (
				<SkillDetailDrawer
					skill={selectedSkill}
					tab={drawerTab}
					onChangeTab={handleDrawerTabChange}
					onClose={closeSkillDrawer}
				/>
			) : null}
		</>
	)
}
