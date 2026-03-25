import { PageScaffold } from '@/components/shared/PageScaffold'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useAppStore } from '@/stores/app-store'

export function SkillsPage() {
	const skills = useAppStore((state) => state.skills)
	const skillsLoadStatus = useAppStore((state) => state.skillsLoadStatus)

	return (
		<PageScaffold
			eyebrow='Skill Governance'
			title='Skill 资产会先进入统一控制面，再去分发到目标工具。'
			description='模块 2 已把 Skills 接到本地 SQLite 数据层，这一页现在直接读取持久化快照。'>
			<section className='grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]'>
				{skills.length === 0 ? (
					<EmptyState
						title={skillsLoadStatus === 'loading' ? '正在读取 Skills' : '当前还没有 Skill 记录'}
						description='本页已经接到本地数据库；当安装、导入或扫描模块写入数据后，这里会直接显示持久化结果。'
					/>
				) : (
					<div className='grid gap-4'>
						{skills.map((skill) => (
							<Card
								key={skill.id}
								className='border-border/70 shadow-sm'>
								<CardHeader>
									<div className='flex flex-wrap items-start justify-between gap-3'>
										<div className='space-y-1'>
											<CardTitle>{skill.name}</CardTitle>
											<CardDescription>
												{skill.description ?? '当前 Skill 暂无描述'}
											</CardDescription>
										</div>
										<div className='flex flex-wrap gap-2'>
											<Badge variant='outline'>{skill.status}</Badge>
											<Badge variant='outline'>v{skill.version}</Badge>
										</div>
									</div>
								</CardHeader>
								<CardContent className='grid gap-3 sm:grid-cols-2'>
									<div className='rounded-xl border border-border bg-muted/25 p-4'>
										<strong className='text-sm'>本地路径</strong>
										<p className='mt-1 break-all text-sm leading-6 text-muted-foreground'>
											{skill.localPath}
										</p>
									</div>
									<div className='rounded-xl border border-border bg-muted/25 p-4'>
										<strong className='text-sm'>支持目标</strong>
										<p className='mt-1 text-sm leading-6 text-muted-foreground'>
											{skill.supportedTargets.length > 0
												? skill.supportedTargets.map((item) => item.targetKey).join('、')
												: '尚未声明'}
										</p>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				)}
				<Card className='border-border/70 shadow-sm'>
					<CardHeader>
						<CardTitle>Registry Snapshot</CardTitle>
						<CardDescription>当前面板展示模块 2 已经落地的数据维度。</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{[
							['Skills 数量', String(skills.length)],
							['列表状态', skillsLoadStatus],
							['事实源', 'SQLite 本地状态库'],
						].map(([label, value]) => (
							<div
								key={label}
								className='rounded-xl border border-border bg-muted/25 p-4'>
								<strong className='text-sm'>{label}</strong>
								<p className='mt-1 text-sm leading-6 text-muted-foreground'>{value}</p>
							</div>
						))}
					</CardContent>
				</Card>
			</section>
		</PageScaffold>
	)
}
