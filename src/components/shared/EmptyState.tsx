import { BoxIcon } from 'lucide-react'

export function EmptyState({ title, description }: { title: string; description: string }) {
	return (
		<div className='flex min-h-48 flex-col items-start justify-center gap-4 rounded-xl border border-dashed border-border bg-muted/20 p-6'>
			<div className='flex size-10 items-center justify-center rounded-full border border-border bg-background text-muted-foreground'>
				<BoxIcon className='size-4' />
			</div>
			<div className='flex flex-col gap-2'>
				<strong className='text-sm'>{title}</strong>
				<p className='max-w-2xl text-sm leading-6 text-muted-foreground'>{description}</p>
			</div>
		</div>
	)
}
