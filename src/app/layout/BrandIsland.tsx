import { useRef } from 'react'
import { BlocksIcon } from '@/components/ui/blocks'
import type { AnimatedIconHandle } from '@/lib/constants/navigation'

export function BrandIsland() {
	const brandIconRef = useRef<AnimatedIconHandle | null>(null)

	return (
		<section
			data-testid='app-brand-island'
			className='relative min-h-18 overflow-hidden rounded-full border border-(--shell-border-subtle) bg-(--shell-pill-bg) px-4 py-3 shadow-(--shadow-pill-flat)'
			onMouseEnter={() => brandIconRef.current?.startAnimation()}
			onMouseLeave={() => brandIconRef.current?.stopAnimation()}>
			<div className='flex h-full items-center gap-3'>
				<div
					aria-hidden='true'
					data-testid='sidebar-brand-logo'
					className='flex size-10 shrink-0 items-center justify-center rounded-full text-primary'>
					<BlocksIcon
						ref={brandIconRef}
						size={30}
						className='inline-flex items-center justify-center'
					/>
				</div>
				<strong className='truncate text-[1.45rem] leading-none tracking-[-0.04em]'>
					<span className='text-foreground'>Stone</span>
					<span className='text-primary'>Skills</span>
				</strong>
			</div>
		</section>
	)
}
