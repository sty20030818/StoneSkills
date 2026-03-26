import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { BlocksIcon } from '@/components/ui/blocks'
import { type AnimatedIconHandle, NAV_ITEMS } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils'

export function Sidebar() {
	const iconRefs = useRef<Record<string, AnimatedIconHandle | null>>({})
	const brandIconRef = useRef<AnimatedIconHandle | null>(null)

	return (
		<aside
			data-testid='app-sidebar'
			className='scrollbar-hidden min-h-0 overflow-y-auto border-b border-sidebar-border bg-sidebar/92 backdrop-blur-xl lg:border-r lg:border-b-0'>
			<div className='flex min-h-full flex-col gap-4 px-3 py-5 md:px-4 md:py-6'>
				<div
					className='flex cursor-default items-center gap-3 px-2'
					onMouseEnter={() => brandIconRef.current?.startAnimation()}
					onMouseLeave={() => brandIconRef.current?.stopAnimation()}>
					<div
						aria-hidden='true'
						data-testid='sidebar-brand-logo'
						className='flex size-11 items-center justify-center text-primary'>
						<BlocksIcon
							ref={brandIconRef}
							size={34}
							className='inline-flex items-center justify-center'
						/>
					</div>
					<strong className='text-[1.42rem] leading-none tracking-[-0.045em] text-foreground'>StoneSkills</strong>
				</div>

				<section>
					<nav className='flex flex-col gap-1.5'>
						{NAV_ITEMS.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								onMouseEnter={() => iconRefs.current[item.to]?.startAnimation()}
								onMouseLeave={() => iconRefs.current[item.to]?.stopAnimation()}
								className={({ isActive }) =>
									isActive
										? 'group relative flex min-h-12 items-center gap-3.5 rounded-xl border border-sidebar-border bg-background/90 px-3.5 text-primary shadow-(--shadow-soft) ring-1 ring-sidebar-ring/25 transition-colors hover:border-sidebar-ring/45 hover:bg-background hover:text-primary'
										: 'group relative flex min-h-12 items-center gap-3.5 rounded-xl border border-transparent px-3.5 text-sidebar-foreground transition-colors hover:border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
								}>
								<span
									aria-hidden='true'
									className={cn(
										'absolute top-2.5 bottom-2.5 left-1 w-1 rounded-full bg-transparent transition-colors',
										'group-aria-current-page:bg-primary',
									)}
								/>
								<span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-transparent'>
									<item.icon
										ref={(instance) => {
											iconRefs.current[item.to] = instance
										}}
										size={22}
										className={cn(
											'inline-flex size-5.5 items-center justify-center text-icon-default transition-colors',
											'group-aria-current-page:text-primary',
										)}
									/>
								</span>
								<strong className='text-[1.02rem] tracking-[-0.02em] text-current'>{item.label}</strong>
							</NavLink>
						))}
					</nav>
				</section>
			</div>
		</aside>
	)
}
