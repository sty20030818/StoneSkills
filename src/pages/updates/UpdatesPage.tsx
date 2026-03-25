import { PageScaffold } from '@/components/shared/PageScaffold'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function UpdatesPage() {
	return (
		<PageScaffold
			eyebrow='Update Rail'
			title='更新会是独立工作流，所以这里先留出批量处理和版本摘要位。'
			description='模块 1 只需要把页面骨架和状态承载能力准备好，真正的版本检测与回滚会在后续模块接入。'>
			<section className='grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]'>
				<EmptyState
					title='更新列表尚未接线'
					description='稍后会接入待更新清单、版本差异摘要和批量更新入口。'
				/>
				<Card className='border-border/70 shadow-sm'>
					<CardHeader>
						<CardTitle>Guardrails</CardTitle>
						<CardDescription>高风险动作必须可回滚、可观测、可中断。</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{[
							['先备份后更新', '所有高风险覆盖动作都要可回滚。'],
							['任务中心复用', '批量更新直接复用当前 event + task center 架构。'],
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
