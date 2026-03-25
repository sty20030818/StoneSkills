import type { PropsWithChildren, ReactNode } from 'react'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

interface PageScaffoldProps extends PropsWithChildren {
	eyebrow: string
	title: string
	description: string
	actions?: ReactNode
	headerContent?: ReactNode
	contentClassName?: string
}

export function PageScaffold({
	eyebrow,
	title,
	description,
	actions,
	headerContent,
	contentClassName,
	children,
}: PageScaffoldProps) {
	return (
		<div className='flex h-full min-h-0 flex-col'>
			<header
				data-testid='page-header'
				className='shrink-0 border-b border-border/70 bg-background/88 px-4 py-5 backdrop-blur md:px-6'>
				<div className='flex flex-col gap-4'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
						<div className='flex max-w-4xl flex-col gap-3'>
							<div className='w-fit rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
								{eyebrow}
							</div>
							<div className='flex flex-col gap-2'>
								<h1 className='text-2xl leading-tight font-semibold md:text-[32px]'>{title}</h1>
								<p className='max-w-3xl text-sm leading-6 text-muted-foreground md:text-[15px]'>{description}</p>
							</div>
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
