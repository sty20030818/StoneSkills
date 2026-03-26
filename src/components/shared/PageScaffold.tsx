import type { PropsWithChildren, ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface PageScaffoldProps extends PropsWithChildren {
	eyebrow?: string
	title: string
	description: string
	actions?: ReactNode
	headerContent?: ReactNode
	contentClassName?: string
	headerDensity?: 'normal' | 'compact'
}

export function PageScaffold({
	title,
	description,
	actions,
	headerContent,
	contentClassName,
	headerDensity = 'normal',
	children,
	// Note: eyebrow is currently not used in the scaffold markup.
}: PageScaffoldProps) {
	const isCompact = headerDensity === 'compact'

	return (
		<div className='flex h-full min-h-0 flex-col'>
			<header
				data-testid='page-header'
				className={cn(
					'shrink-0 border-b border-border/70 bg-background/84 px-4 backdrop-blur-xl md:px-6',
					isCompact ? 'py-3' : 'py-5',
				)}>
				<div className={cn('flex flex-col', isCompact ? 'gap-3' : 'gap-4')}>
					<div className={cn('flex flex-col', isCompact ? 'gap-2' : 'gap-3', 'lg:flex-row lg:items-end lg:justify-between')}>
						<div className='flex max-w-4xl flex-col gap-2'>
							<h1 className='text-2xl leading-tight font-semibold tracking-[-0.03em] md:text-[32px]'>{title}</h1>
							<p className='max-w-3xl text-sm leading-6 text-muted-foreground md:text-[15px]'>{description}</p>
						</div>
						{actions ? <div className='flex flex-wrap items-center gap-2'>{actions}</div> : null}
					</div>
					{headerContent ? <div>{headerContent}</div> : null}
					<Separator />
				</div>
			</header>
			<div
				data-testid='page-scroll-content'
				className={cn('scrollbar-hidden min-h-0 flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5', contentClassName)}>
				<div className='flex min-h-full flex-col gap-6'>{children}</div>
			</div>
		</div>
	)
}
