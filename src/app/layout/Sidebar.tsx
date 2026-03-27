import { useRef } from 'react'
import { NavLink } from 'react-router-dom'
import type { AnimatedIconHandle, NavItem } from '@/lib/constants/navigation'
import { NAV_ITEMS } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils'

interface SidebarNavItemProps {
	item: NavItem
}

function SidebarNavItem({ item }: SidebarNavItemProps) {
	const iconRef = useRef<AnimatedIconHandle | null>(null)

	return (
		<NavLink
			key={item.to}
			to={item.to}
			onMouseEnter={() => iconRef.current?.startAnimation()}
			onMouseLeave={() => iconRef.current?.stopAnimation()}
			onFocus={() => iconRef.current?.startAnimation()}
			onBlur={() => iconRef.current?.stopAnimation()}
			className={({ isActive }) =>
				isActive
					? 'group relative flex min-h-12 items-center gap-3 rounded-[1.1rem] border border-(--shell-border-subtle) bg-(--shell-nav-active-bg) px-3.5 text-primary transition-colors'
					: 'group relative flex min-h-12 items-center gap-3 rounded-[1.1rem] border border-transparent px-3.5 text-sidebar-foreground transition-colors hover:border-(--shell-border-subtle) hover:bg-(--shell-panel-hover-bg) hover:text-sidebar-accent-foreground'
			}>
			<span
				aria-hidden='true'
				className={cn(
					'absolute top-2.5 bottom-2.5 left-1 w-1 rounded-full bg-transparent transition-colors',
					'group-aria-current-page:bg-primary',
				)}
			/>
			<span className='flex size-8 shrink-0 items-center justify-center text-icon-default transition-transform duration-200 group-hover:scale-105 group-focus-visible:scale-105'>
				<item.icon
					ref={iconRef}
					size={20}
					className={cn(
						'inline-flex size-5 items-center justify-center text-icon-default transition-colors',
						'group-aria-current-page:text-primary group-hover:text-primary group-focus-visible:text-primary',
					)}
				/>
			</span>
			<strong className='text-[1rem] tracking-[-0.02em] text-current'>{item.label}</strong>
		</NavLink>
	)
}

export function Sidebar() {
	return (
		<aside
			data-testid='app-sidebar'
			className='scrollbar-hidden min-h-0 overflow-y-auto rounded-[2rem] border border-(--shell-border-subtle) bg-(--shell-panel-bg) p-4 shadow-(--shadow-island-flat)'>
			<nav className='flex flex-col gap-2'>
				{NAV_ITEMS.map((item) => (
					<SidebarNavItem
						key={item.to}
						item={item}
					/>
				))}
			</nav>
		</aside>
	)
}
