import type { PropsWithChildren, ReactNode } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface PageScaffoldProps extends PropsWithChildren {
	eyebrow: string
	title: string
	description: string
	actions?: ReactNode
}

export function PageScaffold({ eyebrow, title, description, actions, children }: PageScaffoldProps) {
	return (
		<div className='flex flex-col gap-6'>
			<Card className='border-border/70 bg-card/90 shadow-[var(--shadow-panel)]'>
				<CardHeader className='gap-4'>
					<div className='flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between'>
						<div className='flex max-w-3xl flex-col gap-3'>
							<div className='w-fit rounded-full border border-border bg-muted px-3 py-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
								{eyebrow}
							</div>
							<div className='flex flex-col gap-2'>
								<h1 className='text-2xl leading-tight font-semibold md:text-3xl'>{title}</h1>
								<p className='max-w-3xl text-sm leading-6 text-muted-foreground md:text-[15px]'>{description}</p>
							</div>
						</div>
						{actions ? <div className='flex flex-wrap items-center gap-2'>{actions}</div> : null}
					</div>
					<Separator />
				</CardHeader>
				<CardContent className='pt-0'>{children}</CardContent>
			</Card>
		</div>
	)
}
