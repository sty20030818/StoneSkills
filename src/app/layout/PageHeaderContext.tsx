import type { PropsWithChildren, ReactNode } from 'react'
import { createContext, useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import { useInRouterContext, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from '@/lib/constants/navigation'

interface PageHeaderContextValue {
	headerSlot: HTMLDivElement | null
	setHeaderSlot: (node: HTMLDivElement | null) => void
}

const PageHeaderContext = createContext<PageHeaderContextValue | null>(null)

export function PageHeaderProvider({ children }: PropsWithChildren) {
	const [headerSlot, setHeaderSlot] = useState<HTMLDivElement | null>(null)

	return <PageHeaderContext.Provider value={{ headerSlot, setHeaderSlot }}>{children}</PageHeaderContext.Provider>
}

export function usePageHeaderSlot() {
	const context = useContext(PageHeaderContext)

	if (!context) {
		throw new Error('usePageHeaderSlot 必须在 PageHeaderProvider 内使用')
	}

	return context.setHeaderSlot
}

export function usePageHeader(title: string, actions?: ReactNode, centerContent?: ReactNode) {
	const context = useContext(PageHeaderContext)
	const inRouterContext = useInRouterContext()
	const location = inRouterContext ? useLocation() : null

	if (!context) {
		throw new Error('usePageHeader 必须在 PageHeaderProvider 内使用')
	}

	if (!context.headerSlot) {
		return null
	}

	const matchedNavItem = location ? NAV_ITEMS.find((item) => location.pathname.startsWith(item.to)) : null
	const HeaderIcon = matchedNavItem?.icon
	const layoutClassName = centerContent
		? 'grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]'
		: actions
			? 'grid-cols-[minmax(0,1fr)_auto]'
			: 'grid-cols-[minmax(0,1fr)]'

	return createPortal(
		<div className={cn('grid min-w-0 flex-1 items-center gap-4', layoutClassName)}>
			<div className='min-w-0'>
				<div className='flex min-w-0 items-center gap-3'>
					{HeaderIcon ? (
						<span
							data-testid='page-header-icon'
							className='flex size-10 shrink-0 items-center justify-center text-primary'>
							<HeaderIcon
								size={24}
								className='pointer-events-none inline-flex size-6 items-center justify-center text-primary'
							/>
						</span>
					) : null}
					<h1 className='truncate text-[1.7rem] leading-none font-semibold tracking-[-0.045em] text-foreground md:text-[1.85rem]'>
						{title}
					</h1>
				</div>
			</div>
			{centerContent ? (
				<div className='flex min-w-0 items-center justify-center'>
					<div className='flex min-w-0 items-center justify-center'>{centerContent}</div>
				</div>
			) : null}
			{actions ? <div className='flex min-w-0 flex-wrap items-center justify-end gap-2'>{actions}</div> : null}
		</div>,
		context.headerSlot,
	)
}
