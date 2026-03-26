import { Outlet } from 'react-router-dom'
import { BottomStatusBar } from '@/app/layout/BottomStatusBar'
import { Sidebar } from '@/app/layout/Sidebar'

export function ShellLayout() {
	return (
		<div
			data-testid='app-shell'
			className='flex h-dvh min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,var(--app-shell-glow),transparent_34%),linear-gradient(180deg,var(--background),var(--surface-3))]'>
			<div className='grid min-h-0 flex-1 lg:grid-cols-[244px_minmax(0,1fr)]'>
				<Sidebar />
				<main
					data-testid='app-main-column'
					className='min-h-0 min-w-0 overflow-hidden border-t border-border/60 bg-background/72 supports-backdrop-filter:backdrop-blur-xl lg:border-t-0 lg:border-l'>
					<Outlet />
				</main>
			</div>
			<BottomStatusBar />
		</div>
	)
}
