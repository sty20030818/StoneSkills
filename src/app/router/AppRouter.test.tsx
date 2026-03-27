import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRouter } from '@/app/router/AppRouter'
import { useAppStore } from '@/stores/app-store'

const baseState = {
	bootstrapStatus: 'ready' as const,
	bootstrapPayload: {
		system: {
			platform: 'darwin',
			platformLabel: 'macOS',
			arch: 'arm64',
			appVersion: '0.1.0',
		},
		paths: {
			appDataDir: '/tmp/app',
			appLogDir: '/tmp/logs',
			suggestedRepositoryDir: '/tmp/repo',
		},
		launchedAt: '2026-03-25T10:00:00.000Z',
	},
	tasks: {},
	skills: [],
	skillsLoadStatus: 'ready' as const,
	currentPlatform: 'macOS',
	detectedTargets: [],
	settingsSnapshot: {
		repositoryRoot: '/tmp/repo',
		defaultInstallMode: 'symlink',
		autoCheckUpdates: true,
		githubToken: null,
		scanPaths: ['/tmp/repo'],
		logLevel: 'info',
	},
}

describe('AppRouter', () => {
	beforeEach(() => {
		useAppStore.setState(baseState)
	})

	it('会把根路径重定向到我的 Skills 页面', async () => {
		render(
			<MemoryRouter initialEntries={['/']}>
				<AppRouter />
			</MemoryRouter>,
		)

		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: '我的 Skills',
			}),
		).toBeInTheDocument()
	})

	it('会把历史页面路由重定向到新的正式结构', async () => {
		render(
			<MemoryRouter initialEntries={['/dashboard']}>
				<AppRouter />
			</MemoryRouter>,
		)

		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: '我的 Skills',
			}),
		).toBeInTheDocument()

		cleanup()
		render(
			<MemoryRouter initialEntries={['/updates']}>
				<AppRouter />
			</MemoryRouter>,
		)

		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: '我的 Skills',
			}),
		).toBeInTheDocument()

		cleanup()
		render(
			<MemoryRouter initialEntries={['/tools']}>
				<AppRouter />
			</MemoryRouter>,
		)

		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: 'AI 工具',
			}),
		).toBeInTheDocument()
		expect(screen.getByTestId('targets-main-card')).toHaveClass('bg-white')
		expect(screen.getByTestId('targets-main-card')).toHaveClass('shadow-none')
	})

	it('侧边导航只展示四个正式一级页面', async () => {
		render(
			<MemoryRouter initialEntries={['/skills']}>
				<AppRouter />
			</MemoryRouter>,
		)

		await screen.findByRole('heading', {
			level: 1,
			name: '我的 Skills',
		})

		expect(screen.getByRole('link', { name: /我的 Skills/i })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: /安装\s*\/\s*导入/i })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: /AI 工具/i })).toBeInTheDocument()
		expect(screen.getByRole('link', { name: /设置/i })).toBeInTheDocument()
		expect(screen.queryByText('总览')).not.toBeInTheDocument()
		expect(screen.queryByText('更新中心')).not.toBeInTheDocument()
		expect(screen.getByText('Stone')).toBeInTheDocument()
		expect(screen.getByText('Skills')).toBeInTheDocument()
		expect(screen.getByTestId('sidebar-brand-logo')).toBeInTheDocument()
		expect(screen.getByTestId('app-brand-island')).toBeInTheDocument()
		expect(within(screen.getByTestId('app-sidebar')).queryByText('StoneSkills')).not.toBeInTheDocument()
		expect(screen.queryByText('默认首页与治理工作台')).not.toBeInTheDocument()
		expect(screen.queryByText('导入来源、检测预览与安装确认')).not.toBeInTheDocument()
		expect(screen.queryByText('Architecture Shift')).not.toBeInTheDocument()
		expect(screen.queryByText('Primary Navigation')).not.toBeInTheDocument()
	})

	it('当前导航项会使用更强的选中态高亮', async () => {
		render(
			<MemoryRouter initialEntries={['/skills']}>
				<AppRouter />
			</MemoryRouter>,
		)

		const activeLink = await screen.findByRole('link', { name: /我的 Skills/i })

		expect(activeLink).toHaveAttribute('aria-current', 'page')
		expect(activeLink).toHaveClass('bg-(--shell-nav-active-bg)')
		expect(activeLink).toHaveClass('border-(--shell-border-subtle)')
		expect(activeLink).toHaveClass('min-h-12')
		expect(activeLink).toHaveClass('text-primary')
		expect(activeLink).not.toHaveClass('shadow-(--shadow-soft)')
		expect(activeLink).not.toHaveClass('hover:bg-sidebar-accent')
	})
})
