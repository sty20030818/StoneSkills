import { Outlet } from 'react-router-dom'
import { BrandIsland } from '@/app/layout/BrandIsland'
import { BottomStatusBar } from '@/app/layout/BottomStatusBar'
import { HeaderIsland } from '@/app/layout/HeaderIsland'
import { MainIsland } from '@/app/layout/MainIsland'
import { PageHeaderProvider } from '@/app/layout/PageHeaderContext'
import { Sidebar } from '@/app/layout/Sidebar'

export function ShellLayout() {
	return (
		<PageHeaderProvider>
			<div
				data-testid='app-shell'
				className='flex h-dvh min-h-0 flex-col overflow-hidden bg-(--shell-app-bg) p-3 md:p-4'>
				<div className='grid min-h-0 flex-1 gap-3 lg:grid-cols-[264px_minmax(0,1fr)]'>
					<div className='grid min-h-0 grid-rows-[auto_minmax(0,1fr)] gap-3'>
						<BrandIsland />
						<Sidebar />
					</div>
					<div className='grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] gap-3'>
						<HeaderIsland />
						<MainIsland>
							<main
								data-testid='app-main-column'
								className='min-h-0 h-full min-w-0 overflow-hidden'>
								<Outlet />
							</main>
						</MainIsland>
					</div>
				</div>
				<BottomStatusBar />
			</div>
		</PageHeaderProvider>
	)
}
