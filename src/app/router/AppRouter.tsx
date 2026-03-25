import { Navigate, Route, Routes } from 'react-router-dom'
import { ShellLayout } from '@/app/layout/ShellLayout'
import { SkillsPage } from '@/pages/skills/SkillsPage'
import { InstallPage } from '@/pages/install/InstallPage'
import { TargetsPage } from '@/pages/targets/TargetsPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

export function AppRouter() {
	return (
		<Routes>
			<Route element={<ShellLayout />}>
				<Route
					index
					element={
						<Navigate
							to='/skills'
							replace
						/>
					}
				/>
				<Route
					path='/skills'
					element={<SkillsPage />}
				/>
				<Route
					path='/dashboard'
					element={
						<Navigate
							to='/skills'
							replace
						/>
					}
				/>
				<Route
					path='/updates'
					element={
						<Navigate
							to='/skills'
							replace
						/>
					}
				/>
				<Route
					path='/install'
					element={<InstallPage />}
				/>
				<Route
					path='/tools'
					element={<TargetsPage />}
				/>
				<Route
					path='/targets'
					element={
						<Navigate
							to='/tools'
							replace
						/>
					}
				/>
				<Route
					path='/settings'
					element={<SettingsPage />}
				/>
			</Route>
		</Routes>
	)
}
