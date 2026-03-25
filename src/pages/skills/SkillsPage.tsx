import { PageScaffold } from '@/components/shared/PageScaffold'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function SkillsPage() {
	return (
		<PageScaffold
			eyebrow='Skill Governance'
			title='Skill 资产会先进入统一控制面，再去分发到目标工具。'
			description='这一页当前只保留结构占位，后续会接入搜索、筛选、详情入口和状态矩阵。'>
			<section className='grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]'>
				<EmptyState
					title='列表层骨架已就绪'
					description='下一阶段会在这里接入搜索栏、过滤条件、表格视图和批量操作区。'
				/>
				<Card className='border-border/70 shadow-sm'>
					<CardHeader>
						<CardTitle>Future Details</CardTitle>
						<CardDescription>列表页最终会承接来源、状态和批量治理。</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{[
							['来源筛选', 'GitHub、本地导入、扫描结果和在线仓库。'],
							['状态切片', '启用状态、待更新状态、健康检查摘要。'],
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
