import { usePageHeader } from '@/app/layout/PageHeaderContext'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/stores/app-store'

function getTargetTone(status: string) {
	if (status === 'detected') return 'success'
	if (status === 'missing') return 'error'
	return 'warning'
}

export function TargetsPage() {
	const platform = useAppStore((state) => state.currentPlatform)
	const detectedTargets = useAppStore((state) => state.detectedTargets)
	const headerContent = usePageHeader(
		'AI 工具',
		<>
			<Button variant='outline'>重新检测</Button>
			<Button variant='secondary'>配置帮助</Button>
		</>,
	)

	return (
		<>
			{headerContent}
			<div
				data-testid='targets-page-body'
				className='scrollbar-hidden h-full overflow-y-auto py-1 md:py-2'>
				<Card
					data-testid='targets-main-card'
					className='rounded-[1.8rem] border-border/70 bg-white shadow-none'>
					<CardHeader>
						<CardTitle>环境概览</CardTitle>
						<CardDescription>这页先保留一个主卡骨架，后续再补真实工具能力与诊断模块。</CardDescription>
					</CardHeader>
					<CardContent className='grid gap-4'>
						<div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
							{[
								['当前平台', platform ?? '待识别'],
								['已检测工具', String(detectedTargets.length)],
								['已连接', String(detectedTargets.filter((target) => target.status === 'detected').length)],
								['有异常', String(detectedTargets.filter((target) => target.status !== 'detected').length)],
							].map(([label, value]) => (
								<div
									key={label}
									className='rounded-[1.35rem] border border-border/80 bg-white p-4'>
									<span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>{label}</span>
									<strong className='mt-3 block text-lg'>{value}</strong>
								</div>
							))}
						</div>
						<div className='grid gap-3'>
							{detectedTargets.map((target) => (
								<div
									key={target.id}
									className='flex items-start justify-between gap-3 rounded-[1.35rem] border border-border/80 bg-white p-4'>
									<div>
										<div className='flex flex-wrap items-center gap-2'>
											<strong className='text-sm'>{target.label}</strong>
											<Badge variant={getTargetTone(target.status)}>{target.status}</Badge>
										</div>
										<p className='mt-1 text-sm text-muted-foreground'>状态：{target.status}</p>
									</div>
									<Badge
										variant='outline'
										className='rounded-xl'>
										{target.id}
									</Badge>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</>
	)
}
