import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AppRouter } from '@/app/router/AppRouter'
import { AppToaster } from '@/app/providers/AppToaster'
import { AppErrorBoundary } from '@/components/shared/AppErrorBoundary'
import { useAppBootstrap } from '@/hooks/useAppBootstrap'
import { useResolvedTheme } from '@/hooks/useResolvedTheme'
import { useTaskEventBridge } from '@/hooks/useTaskEventBridge'

function AppRuntime() {
	useAppBootstrap()
	useTaskEventBridge()

	return <AppRouter />
}

function AppThemeSync() {
	const theme = useResolvedTheme()

	useEffect(() => {
		const root = document.documentElement
		root.classList.toggle('dark', theme === 'dark')
		root.dataset.theme = theme
	}, [theme])

	return null
}

export function AppProviders() {
	return (
		<AppErrorBoundary>
			<BrowserRouter>
				<AppThemeSync />
				<AppRuntime />
				<AppToaster />
			</BrowserRouter>
		</AppErrorBoundary>
	)
}
