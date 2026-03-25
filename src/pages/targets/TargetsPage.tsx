import { PageScaffold } from '@/components/shared/PageScaffold'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/stores/app-store'

export function TargetsPage() {
	const platform = useAppStore((state) => state.currentPlatform)
	const detectedTargets = useAppStore((state) => state.detectedTargets)

	return (
		<PageScaffold
			eyebrow='Target Matrix'
			title='同一套 Skill，最终要落到哪些 AI 工具上，这里就是控制面。'
			description='本页当前用于验证平台摘要和目标工具占位结构。后续会扩展为适配状态、安装路径、启用方式和错误诊断面板。'>
			<section className='grid gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]'>
				<Card className='border-border/70 shadow-sm'>
					<CardHeader>
						<CardTitle>Platform Summary</CardTitle>
						<CardDescription>当前平台与工具检测摘要。</CardDescription>
					</CardHeader>
					<CardContent className='grid gap-3 sm:grid-cols-2'>
						{[
							['当前平台', platform ?? '待识别'],
							['目标工具', String(detectedTargets.length)],
						].map(([label, value]) => (
							<div
								key={label}
								className='rounded-xl border border-border bg-muted/30 p-4'>
								<span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>{label}</span>
								<strong className='mt-3 block text-lg'>{value}</strong>
							</div>
						))}
					</CardContent>
				</Card>
				<Card className='border-border/70 shadow-sm'>
					<CardHeader>
						<CardTitle>Target Placeholders</CardTitle>
						<CardDescription>适配器健康状态会继续长在这一列。</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{detectedTargets.map((target) => (
							<div
								key={target.id}
								className='flex items-start justify-between gap-3 rounded-xl border border-border bg-background/80 p-4'>
								<div>
									<strong className='text-sm'>{target.label}</strong>
									<p className='mt-1 text-sm text-muted-foreground'>状态：{target.status}</p>
								</div>
								<Badge
									variant='outline'
									className='rounded-xl'>
									{target.id}
								</Badge>
							</div>
						))}
					</CardContent>
				</Card>
			</section>
		</PageScaffold>
	)
}
