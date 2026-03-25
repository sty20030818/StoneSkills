import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Skill } from '@/lib/tauri/contracts'
import { EmptyState } from '@/components/shared/EmptyState'
import { PageScaffold } from '@/components/shared/PageScaffold'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/stores/app-store'

type ViewMode = 'list' | 'card'
type DrawerTab = 'overview' | 'readme' | 'targets' | 'version' | 'issues'

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

function OverviewMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
	return (
		<div className='rounded-2xl border border-border bg-muted/25 p-4'>
			<div className='text-xs font-semibold tracking-[0.16em] text-muted-foreground uppercase'>{label}</div>
			<strong className='mt-3 block text-2xl font-semibold text-foreground'>{value}</strong>
			<p className='mt-1 text-sm leading-6 text-muted-foreground'>{hint}</p>
		</div>
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
		<Card className='sticky top-4 border-border/70 shadow-sm'>
			<CardHeader>
				<div className='flex items-start justify-between gap-3'>
					<div className='space-y-1'>
						<CardTitle>{skill.name}</CardTitle>
						<CardDescription>{skill.description ?? '当前 Skill 暂无描述'}</CardDescription>
					</div>
					<Button
						variant='ghost'
						size='sm'
						onClick={onClose}>
						关闭详情
					</Button>
				</div>
				<div className='flex flex-wrap gap-2'>
					<Badge variant='outline'>{getStatusLabel(skill.status)}</Badge>
					<Badge variant='outline'>v{skill.version}</Badge>
					<Badge variant='outline'>{primarySource?.sourceType ?? skill.installMethod}</Badge>
				</div>
			</CardHeader>
			<CardContent className='flex flex-col gap-4'>
				<div className='rounded-xl border border-border bg-muted/25 p-4'>
					<strong className='text-sm'>状态摘要</strong>
					<p className='mt-2 text-sm leading-6 text-muted-foreground'>
						{metadata.hasIssues ? '需要关注问题与兼容性' : '当前状态稳定'} · 支持 {skill.supportedTargets.length} 个 AI 工具
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
						<div className='rounded-xl border border-border bg-background/80 p-4'>
							<strong className='text-sm'>本地路径</strong>
							<p className='mt-1 break-all text-sm leading-6 text-muted-foreground'>{skill.localPath}</p>
						</div>
						<div className='rounded-xl border border-border bg-background/80 p-4'>
							<strong className='text-sm'>标签</strong>
							<p className='mt-1 text-sm leading-6 text-muted-foreground'>{skill.tags.length > 0 ? skill.tags.join('、') : '暂无标签'}</p>
						</div>
					</div>
				) : null}
				{tab === 'readme' ? (
					<div className='rounded-xl border border-border bg-background/80 p-4'>
						<strong className='text-sm'>README 摘要</strong>
						<p className='mt-1 text-sm leading-6 text-muted-foreground'>
							{skill.readmePath ? `已检测到 README：${skill.readmePath}` : '当前未记录 README 路径，后续可在详情内继续补足。'}
						</p>
					</div>
				) : null}
				{tab === 'targets' ? (
					<div className='grid gap-3'>
						{skill.supportedTargets.map((target) => (
							<div
								key={target.targetKey}
								className='rounded-xl border border-border bg-background/80 p-4'>
								<strong className='text-sm'>{target.targetKey}</strong>
								<p className='mt-1 text-sm leading-6 text-muted-foreground'>支持等级：{target.supportLevel}</p>
							</div>
						))}
					</div>
				) : null}
				{tab === 'version' ? (
					<div className='rounded-xl border border-border bg-background/80 p-4'>
						<strong className='text-sm'>版本与更新</strong>
						<p className='mt-1 text-sm leading-6 text-muted-foreground'>
							当前版本 v{skill.version}
							{metadata.updateAvailable ? '，检测到待更新版本。' : '，当前未发现待更新。'}
						</p>
					</div>
				) : null}
				{tab === 'issues' ? (
					<div className='rounded-xl border border-border bg-background/80 p-4'>
						<strong className='text-sm'>问题与建议</strong>
						<ul className='mt-2 grid gap-2 text-sm leading-6 text-muted-foreground'>
							<li>• 当前 Skill 存在异常或兼容性提示。</li>
							<li>• 可结合 AI 工具页继续查看受影响的工具范围。</li>
						</ul>
					</div>
				) : null}
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
			</CardContent>
		</Card>
	)
}

export function SkillsPage() {
	const skills = useAppStore((state) => state.skills)
	const skillsLoadStatus = useAppStore((state) => state.skillsLoadStatus)
	const detectedTargets = useAppStore((state) => state.detectedTargets)
	const [searchParams, setSearchParams] = useSearchParams()
	const [searchKeyword, setSearchKeyword] = useState('')
	const [statusFilter, setStatusFilter] = useState('all')
	const [sourceFilter, setSourceFilter] = useState('all')
	const [toolFilter, setToolFilter] = useState('all')
	const [sortBy, setSortBy] = useState('updatedAt')
	const [viewMode, setViewMode] = useState<ViewMode>('list')
	const [selectedIds, setSelectedIds] = useState<string[]>([])

	const metrics = useMemo(() => {
		const issueCount = skills.filter((skill) => parseSkillMetadata(skill).hasIssues || skill.status === 'error').length
		const updateCount = skills.filter((skill) => parseSkillMetadata(skill).updateAvailable).length
		const toolIssueCount = detectedTargets.filter((target) => target.status !== 'detected').length

		return {
			installed: skills.length,
			enabled: skills.filter((skill) => skill.status === 'enabled').length,
			issues: issueCount,
			updates: updateCount,
			toolIssues: toolIssueCount,
		}
	}, [detectedTargets, skills])

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

	return (
		<PageScaffold
			eyebrow='Skills Workbench'
			title='我的 Skills'
			description='统一管理当前环境中的所有 Skills，在一个工作台中完成浏览、筛选、更新提示、异常发现和详情处理。'
			actions={
				<>
					<Button>导入 Skill</Button>
					<Button variant='secondary'>重新扫描</Button>
				</>
			}>
			<section className='grid gap-4'>
				<div className='grid gap-4 xl:grid-cols-5'>
					<OverviewMetric
						label='已安装'
						value={String(metrics.installed)}
						hint={`已启用 ${metrics.enabled}`}
					/>
					<OverviewMetric
						label='异常'
						value={String(metrics.issues)}
						hint='需要在工作台或详情内处理'
					/>
					<OverviewMetric
						label='待更新'
						value={String(metrics.updates)}
						hint='版本变化会继续并入工作台'
					/>
					<OverviewMetric
						label='工具异常'
						value={String(metrics.toolIssues)}
						hint='环境问题可在 AI 工具页查看'
					/>
					<OverviewMetric
						label='已连接工具'
						value={String(detectedTargets.filter((item) => item.status === 'detected').length)}
						hint={`共检测到 ${detectedTargets.length} 个`}
					/>
				</div>

				<Card className='border-border/70 shadow-sm'>
					<CardContent className='grid gap-3 p-4 lg:grid-cols-[minmax(0,1.5fr)_repeat(4,minmax(0,0.9fr))_auto]'>
						<input
							value={searchKeyword}
							onChange={(event) => setSearchKeyword(event.target.value)}
							placeholder='搜索 Skills'
							className='h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20'
						/>
						<select
							value={statusFilter}
							onChange={(event) => setStatusFilter(event.target.value)}
							className='h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20'>
							<option value='all'>全部状态</option>
							<option value='issues'>异常</option>
							<option value='updates'>待更新</option>
							<option value='enabled'>已启用</option>
							<option value='disabled'>未启用</option>
						</select>
						<select
							value={sourceFilter}
							onChange={(event) => setSourceFilter(event.target.value)}
							className='h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20'>
							<option value='all'>全部来源</option>
							<option value='github'>GitHub</option>
							<option value='local'>本地</option>
						</select>
						<select
							value={toolFilter}
							onChange={(event) => setToolFilter(event.target.value)}
							className='h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20'>
							<option value='all'>全部工具</option>
							{detectedTargets.map((target) => (
								<option
									key={target.id}
									value={target.id}>
									{target.label}
								</option>
							))}
						</select>
						<select
							value={sortBy}
							onChange={(event) => setSortBy(event.target.value)}
							className='h-10 rounded-xl border border-border bg-background px-3 text-sm outline-none transition focus:border-ring focus:ring-3 focus:ring-ring/20'>
							<option value='updatedAt'>最近更新</option>
							<option value='name'>名称排序</option>
						</select>
						<div className='flex gap-2'>
							<Button
								variant={viewMode === 'list' ? 'default' : 'outline'}
								onClick={() => setViewMode('list')}>
								列表视图
							</Button>
							<Button
								variant={viewMode === 'card' ? 'default' : 'outline'}
								onClick={() => setViewMode('card')}>
								卡片视图
							</Button>
						</div>
					</CardContent>
				</Card>

				{selectedIds.length > 0 ? (
					<Card className='border-border/70 shadow-sm'>
						<CardContent className='flex flex-wrap items-center gap-2 p-4'>
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
						</CardContent>
					</Card>
				) : null}

				<section
					className={cn(
						'grid gap-4',
						selectedSkill ? '2xl:grid-cols-[minmax(0,1.55fr)_minmax(340px,0.95fr)]' : undefined,
					)}>
					<div className={cn('grid gap-4', viewMode === 'card' ? 'md:grid-cols-2' : undefined)}>
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
										className='border-border/70 shadow-sm'>
										<CardHeader>
											<div className='flex flex-wrap items-start justify-between gap-3'>
												<div className='flex items-start gap-3'>
													<input
														type='checkbox'
														checked={selected}
														onChange={() => toggleSelection(skill.id)}
														aria-label={`选择 ${skill.name}`}
														className='mt-1 size-4 rounded border-border'
													/>
													<div className='space-y-1'>
														<CardTitle>{skill.name}</CardTitle>
														<CardDescription>{skill.description ?? '当前 Skill 暂无描述'}</CardDescription>
													</div>
												</div>
												<div className='flex flex-wrap gap-2'>
													<Badge variant='outline'>{getStatusLabel(skill.status)}</Badge>
													<Badge variant='outline'>v{skill.version}</Badge>
													{metadata.updateAvailable ? <Badge>待更新</Badge> : null}
												</div>
											</div>
										</CardHeader>
										<CardContent className='grid gap-4'>
											<div className='grid gap-3 sm:grid-cols-3'>
												<div className='rounded-xl border border-border bg-muted/25 p-4'>
													<strong className='text-sm'>来源</strong>
													<p className='mt-1 text-sm leading-6 text-muted-foreground'>
														{primarySource?.sourceType ?? skill.installMethod}
													</p>
												</div>
												<div className='rounded-xl border border-border bg-muted/25 p-4'>
													<strong className='text-sm'>工具支持</strong>
													<p className='mt-1 text-sm leading-6 text-muted-foreground'>
														{skill.supportedTargets.length > 0
															? skill.supportedTargets.map((item) => item.targetKey).join('、')
															: '尚未声明'}
													</p>
												</div>
												<div className='rounded-xl border border-border bg-muted/25 p-4'>
													<strong className='text-sm'>问题摘要</strong>
													<p className='mt-1 text-sm leading-6 text-muted-foreground'>
														{metadata.hasIssues ? '存在异常或兼容性提示' : '当前未发现显著问题'}
													</p>
												</div>
											</div>
											<div className='flex flex-wrap items-center justify-between gap-3'>
												<p className='text-sm leading-6 text-muted-foreground'>
													标签：{skill.tags.length > 0 ? skill.tags.join('、') : '暂无'}
												</p>
												<div className='flex gap-2'>
													<Button
														variant='outline'
														size='sm'
														onClick={() => openSkillDrawer(skill, 'overview')}>
														查看详情
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => openSkillDrawer(skill, 'issues')}>
														查看问题
													</Button>
												</div>
											</div>
										</CardContent>
									</Card>
								)
							})
						)}
					</div>
					{selectedSkill ? (
						<SkillDetailDrawer
							skill={selectedSkill}
							tab={drawerTab}
							onChangeTab={handleDrawerTabChange}
							onClose={closeSkillDrawer}
						/>
					) : null}
				</section>
			</section>
		</PageScaffold>
	)
}
