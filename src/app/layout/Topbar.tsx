import { useLocation } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { NAV_ITEMS } from '@/lib/constants/navigation'
import { useAppStore } from '@/stores/app-store'

export function Topbar() {
	const location = useLocation()
	const bootstrapStatus = useAppStore((state) => state.bootstrapStatus)
	const bootstrapPayload = useAppStore((state) => state.bootstrapPayload)
	const tasks = useAppStore((state) => state.tasks)

	const matched = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to)) ?? NAV_ITEMS[0]
	const runningTasks = Object.values(tasks).filter(
		(task) => task.status === 'queued' || task.status === 'running',
	).length

	return (
		<Card className='mb-6 border-border/70 bg-background/80 shadow-sm backdrop-blur'>
			<CardContent className='flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between'>
				<div className='flex flex-col gap-1'>
					<small className='text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
						Application Shell
					</small>
					<strong className='text-xl'>{matched.label}</strong>
				</div>
				<div className='flex flex-wrap items-center gap-2'>
					<Badge
						variant={bootstrapStatus === 'ready' ? 'default' : 'secondary'}
						className='rounded-xl px-3 py-1'>
						启动态：{bootstrapStatus}
					</Badge>
					<Badge
						variant='outline'
						className='rounded-xl px-3 py-1'>
						平台：{bootstrapPayload?.system.platformLabel ?? '待识别'}
					</Badge>
					<Badge
						variant='outline'
						className='rounded-xl px-3 py-1'>
						task {runningTasks > 0 ? `进行中 ${runningTasks}` : '当前无长任务'}
					</Badge>
				</div>
			</CardContent>
		</Card>
	)
}
