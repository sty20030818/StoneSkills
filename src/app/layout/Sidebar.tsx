import { NavLink } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { NAV_ITEMS } from '@/lib/constants/navigation'
import { cn } from '@/lib/utils'

export function Sidebar() {
	return (
		<aside className='border-b border-border/70 bg-background/80 backdrop-blur lg:border-r lg:border-b-0'>
			<div className='flex h-full flex-col gap-6 p-4 md:p-6'>
				<div className='flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-sm'>
					<div className='flex size-11 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground'>
						SS
					</div>
					<div className='flex min-w-0 flex-col gap-1'>
						<strong className='text-sm'>StoneSkills</strong>
						<span className='text-xs text-muted-foreground'>Developer Control Plane</span>
					</div>
				</div>

				<section className='flex flex-col gap-3'>
					<div className='px-1 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
						Primary Navigation
					</div>
					<nav className='flex flex-col gap-2'>
						{NAV_ITEMS.map((item) => (
							<NavLink
								key={item.to}
								to={item.to}
								className={({ isActive }) =>
									cn(
										'flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-border hover:bg-muted/70',
										isActive && 'border-border bg-accent text-accent-foreground shadow-sm',
									)
								}>
								<Badge
									variant='outline'
									className='min-w-11 justify-center rounded-xl'>
									{item.badge}
								</Badge>
								<span className='flex min-w-0 flex-col gap-1'>
									<strong className='text-sm'>{item.label}</strong>
									<span className='text-xs text-muted-foreground'>{item.description}</span>
								</span>
							</NavLink>
						))}
					</nav>
				</section>

				<Card className='mt-auto border-dashed bg-muted/25 shadow-none'>
					<CardContent className='flex flex-col gap-2 p-4'>
						<div className='text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase'>
							Foundational Layer
						</div>
						<strong className='text-sm'>模块 1 正在落地</strong>
						<p className='text-sm leading-6 text-muted-foreground'>
							当前阶段优先完成应用壳层、桥接协议、状态中心和诊断入口。
						</p>
					</CardContent>
				</Card>
			</div>
		</aside>
	)
}
