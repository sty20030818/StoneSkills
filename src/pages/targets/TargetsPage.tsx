import { PageScaffold } from '@/components/shared/PageScaffold'
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

	return (
		<PageScaffold
			eyebrow='Environment Overview'
			title='AI 工具'
			description='查看当前 Skills 依赖的 AI 工具环境，包括连接状态、路径、版本风险和受影响的 Skills 范围。'
			actions={
				<>
					<Button variant='outline'>重新检测</Button>
					<Button variant='secondary'>配置帮助</Button>
				</>
			}>
			<section className='grid gap-4 2xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,1fr)]'>
				<Card className='rounded-[1.5rem] bg-card/84'>
					<CardHeader>
						<CardTitle>环境概览</CardTitle>
						<CardDescription>优先回答有哪些工具、哪些可用、哪些异常以及影响范围。</CardDescription>
					</CardHeader>
					<CardContent className='grid gap-3 sm:grid-cols-2'>
						{[
							['当前平台', platform ?? '待识别'],
							['已检测工具', String(detectedTargets.length)],
							['已连接', String(detectedTargets.filter((target) => target.status === 'detected').length)],
							['有异常', String(detectedTargets.filter((target) => target.status !== 'detected').length)],
						].map(([label, value]) => (
							<div
								key={label}
								className='rounded-[1.35rem] border border-border/80 bg-muted/38 p-4'>
								<span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>{label}</span>
								<strong className='mt-3 block text-lg'>{value}</strong>
							</div>
						))}
					</CardContent>
				</Card>
				<Card className='rounded-[1.5rem] bg-card/84'>
					<CardHeader>
						<CardTitle>工具连接状态</CardTitle>
						<CardDescription>环境页保留轻量修复动作，但不承接单个 Skill 的详细诊断。</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{detectedTargets.map((target) => (
							<div
								key={target.id}
								className='flex items-start justify-between gap-3 rounded-[1.35rem] border border-border/80 bg-background/82 p-4'>
								<div>
									<div className='flex flex-wrap items-center gap-2'>
										<strong className='text-sm'>{target.label}</strong>
										<Badge variant={getTargetTone(target.status)}>{target.status}</Badge>
									</div>
									<p className='mt-1 text-sm text-muted-foreground'>状态：{target.status}</p>
									<p className='mt-1 text-sm text-muted-foreground'>
										{target.status === 'detected'
											? '环境已连接，可继续查看支持的 Skills。'
											: '需要重新检测、配置路径或查看修复引导。'}
									</p>
								</div>
								<div className='flex flex-col items-end gap-2'>
									<Badge
										variant='outline'
										className='rounded-xl'>
										{target.id}
									</Badge>
									<Button
										variant='ghost'
										size='sm'>
										{target.status === 'detected' ? '查看受影响 Skills' : '修复引导'}
									</Button>
								</div>
							</div>
						))}
					</CardContent>
				</Card>
			</section>
		</PageScaffold>
	)
}
