import { Outlet } from 'react-router-dom'
import { BottomStatusBar } from '@/app/layout/BottomStatusBar'
import { Sidebar } from '@/app/layout/Sidebar'

export function ShellLayout() {
	return (
		<div
			data-testid='app-shell'
			className='flex h-dvh min-h-0 flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,247,251,0.98))]'>
			<div className='grid min-h-0 flex-1 lg:grid-cols-[280px_minmax(0,1fr)]'>
				<Sidebar />
				<main
					data-testid='app-main-column'
					className='min-h-0 min-w-0 overflow-hidden border-t border-border/60 lg:border-t-0 lg:border-l'>
					<Outlet />
				</main>
			</div>
			<BottomStatusBar />
		</div>
	)
}
