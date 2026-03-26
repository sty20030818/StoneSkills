import { BoxIcon } from '@/components/ui/box'

export function EmptyState({ title, description }: { title: string; description: string }) {
	return (
		<div className='flex min-h-52 flex-col items-start justify-center gap-4 rounded-2xl border border-dashed border-border bg-card/78 p-6 shadow-[var(--shadow-soft)]'>
			<div className='flex size-11 items-center justify-center rounded-2xl border border-border bg-accent text-accent-foreground'>
				<BoxIcon
					size={16}
					className='inline-flex items-center justify-center'
				/>
			</div>
			<div className='flex flex-col gap-2'>
				<strong className='text-sm text-foreground'>{title}</strong>
				<p className='max-w-2xl text-sm leading-6 text-muted-foreground'>{description}</p>
			</div>
		</div>
	)
}
