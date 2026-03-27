import { usePageHeader } from '@/app/layout/PageHeaderContext'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function UpdatesPage() {
	const headerContent = usePageHeader('更新会是独立工作流，所以这里先留出批量处理和版本摘要位。')

	return (
		<>
			{headerContent}
			<section className='scrollbar-hidden h-full overflow-y-auto py-1 md:py-2'>
				<div className='grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]'>
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
				</div>
			</section>
		</>
	)
}
