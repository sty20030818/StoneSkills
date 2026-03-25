import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/app/layout/Sidebar'
import { Topbar } from '@/app/layout/Topbar'

export function ShellLayout() {
	return (
		<div className='grid min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.08),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(245,247,251,0.98))] lg:grid-cols-[280px_minmax(0,1fr)]'>
			<Sidebar />
			<main className='min-w-0 p-4 md:p-6'>
				<Topbar />
				<Outlet />
			</main>
		</div>
	)
}
