import { useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { usePageHeaderSlot } from '@/app/layout/PageHeaderContext'

export function HeaderIsland() {
	const location = useLocation()
	const setActionsSlot = usePageHeaderSlot()
	const handleActionsRef = useCallback(
		(node: HTMLDivElement | null) => {
			setActionsSlot(node)
		},
		[setActionsSlot],
	)

	return (
		<header
			data-testid='app-header-island'
			className='relative flex min-h-18 items-center overflow-hidden rounded-full border border-(--shell-border-subtle) bg-(--shell-pill-bg) px-5 py-3 shadow-(--shadow-pill-flat) md:px-6'>
			<div
				key={location.pathname}
				ref={handleActionsRef}
				data-testid='app-header-slot'
				className='flex min-w-0 flex-1 items-center justify-between gap-4'
			/>
		</header>
	)
}
