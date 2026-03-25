import { Skeleton } from '@/components/ui/skeleton'

export function LoadingState({
	title = '正在准备界面',
	description = '框架层正在整理状态与系统信息。',
}: {
	title?: string
	description?: string
}) {
	return (
		<div className='rounded-xl border border-dashed border-border bg-muted/40 p-4'>
			<div className='flex flex-col gap-3'>
				<div className='flex flex-col gap-2'>
					<Skeleton className='h-4 w-40' />
					<Skeleton className='h-3 w-72 max-w-full' />
				</div>
				<div className='rounded-lg border border-border/60 bg-background/90 p-3'>
					<strong className='block text-sm'>{title}</strong>
					<p className='mt-1 text-sm text-muted-foreground'>{description}</p>
				</div>
			</div>
		</div>
	)
}
