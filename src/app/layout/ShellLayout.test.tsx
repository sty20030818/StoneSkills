import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRouter } from '@/app/router/AppRouter'
import { useAppStore } from '@/stores/app-store'

describe('ShellLayout', () => {
	beforeEach(() => {
		useAppStore.setState({
			bootstrapStatus: 'ready',
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
			tasks: {
				task_1: {
					taskId: 'task_1',
					status: 'running',
					label: '扫描 Skills',
					progress: 35,
					message: '处理中',
					timestamp: '2026-03-25T10:10:00.000Z',
				},
			},
			skills: [
				{
					id: 'skill-alpha',
					slug: 'skill-alpha',
					name: 'Skill Alpha',
					version: '1.2.0',
					description: '主工作流 Skill',
					author: 'Stone',
					localPath: '/skills/alpha',
					icon: null,
					readmePath: '/skills/alpha/README.md',
					installMethod: 'github',
					checksum: null,
					status: 'enabled',
					extraMetadataJson: JSON.stringify({ updateAvailable: true }),
					tags: ['core'],
					sources: [],
					supportedTargets: [],
					createdAt: 1,
					updatedAt: 2,
					lastCheckedAt: 1710000000000,
				},
				{
					id: 'skill-beta',
					slug: 'skill-beta',
					name: 'Skill Beta',
					version: '0.9.1',
					description: '辅助 Skill',
					author: 'Stone',
					localPath: '/skills/beta',
					icon: null,
					readmePath: null,
					installMethod: 'local',
					checksum: null,
					status: 'disabled',
					extraMetadataJson: null,
					tags: ['local'],
					sources: [],
					supportedTargets: [],
					createdAt: 1,
					updatedAt: 2,
					lastCheckedAt: 1710000100000,
				},
			],
			skillsLoadStatus: 'ready',
			currentPlatform: 'macOS',
			repositoryRoot: '/tmp/repo',
			suggestedRepositoryRoot: '/tmp/repo',
			repositoryHealthStatus: 'healthy',
			repositoryMissingDirectories: [],
			repositoryWritable: true,
			repositoryMessage: '仓库目录可用',
			detectedTargets: [
				{ id: 'claude-code', label: 'Claude Code', status: 'detected' },
				{ id: 'codex', label: 'Codex', status: 'missing' },
			],
			settingsSnapshot: {
				repositoryRoot: '/tmp/repo',
				defaultInstallMode: 'symlink',
				autoCheckUpdates: true,
				githubToken: null,
				scanPaths: ['/tmp/repo'],
				logLevel: 'info',
			},
		})
	})

	it('使用岛屿式壳层并由全局头部承载页面标题与按钮', async () => {
		render(
			<MemoryRouter initialEntries={['/skills']}>
				<AppRouter />
			</MemoryRouter>,
		)

		const heading = await screen.findByRole('heading', {
			level: 1,
			name: '我的 Skills',
		})

		expect(screen.queryByText('Application Shell')).not.toBeInTheDocument()
		const shell = screen.getByTestId('app-shell')
		expect(shell).toBeInTheDocument()
		expect(shell).toHaveClass('bg-(--shell-app-bg)')
		const sidebarIsland = screen.getByTestId('app-sidebar')
		const brandIsland = screen.getByTestId('app-brand-island')
		const mainIsland = screen.getByTestId('app-main-island')

		expect(sidebarIsland).toHaveClass('scrollbar-hidden')
		expect(sidebarIsland).toHaveClass('bg-(--shell-panel-bg)')
		expect(sidebarIsland).toHaveClass('border-(--shell-border-subtle)')
		expect(sidebarIsland).toHaveClass('shadow-(--shadow-island-flat)')
		expect(sidebarIsland.firstElementChild?.tagName).toBe('NAV')
		expect(brandIsland).toHaveTextContent('StoneSkills')
		expect(within(sidebarIsland).queryByText('StoneSkills')).not.toBeInTheDocument()
		expect(brandIsland).toHaveClass('rounded-full')
		expect(brandIsland).toHaveClass('bg-(--shell-pill-bg)')
		expect(brandIsland).toHaveClass('min-h-18')
		expect(brandIsland).toHaveClass('border-(--shell-border-subtle)')
		expect(brandIsland).toHaveClass('shadow-(--shadow-pill-flat)')
		expect(within(brandIsland).getByText('Stone')).toHaveClass('text-foreground')
		expect(within(brandIsland).getByText('Skills')).toHaveClass('text-primary')
		expect(mainIsland).not.toHaveClass('bg-(--shell-panel-bg)')
		expect(mainIsland).not.toHaveClass('border-(--shell-border-subtle)')
		expect(mainIsland).not.toHaveClass('shadow-(--shadow-island-flat)')
		expect(screen.queryByTestId('page-header')).not.toBeInTheDocument()

		const headerIsland = screen.getByTestId('app-header-island')
		expect(headerIsland).toContainElement(heading)
		expect(headerIsland).toHaveClass('rounded-full')
		expect(headerIsland).toHaveClass('bg-(--shell-pill-bg)')
		expect(headerIsland).toHaveClass('min-h-18')
		expect(headerIsland).toHaveClass('border-(--shell-border-subtle)')
		expect(headerIsland).toHaveClass('shadow-(--shadow-pill-flat)')
		const headerIcon = within(headerIsland).getByTestId('page-header-icon')
		expect(headerIcon).toBeInTheDocument()
		expect(headerIcon).toHaveClass('size-10')
		expect(headerIcon).not.toHaveClass('bg-(--shell-nav-active-bg)')
		expect(headerIcon.firstElementChild).toHaveClass('pointer-events-none')
		expect(headerIcon.firstElementChild).toHaveClass('size-6')
		expect(within(headerIsland).getByTestId('skills-header-metrics')).toBeInTheDocument()
		expect(within(headerIsland).getByRole('button', { name: '导入 Skill' })).toBeInTheDocument()
		expect(within(headerIsland).getByRole('button', { name: '重新扫描' })).toBeInTheDocument()

		const statusBar = screen.getByTestId('bottom-status-bar')
		const statusTrack = within(statusBar).getByTestId('bottom-status-track')
		const versionItem = within(statusBar).getByTestId('status-app-version')

		expect(statusBar).toBeInTheDocument()
		expect(statusTrack).toHaveClass('rounded-full')
		expect(statusTrack).toHaveClass('bg-(--shell-floatbar-surface-bg)')
		expect(statusTrack).toHaveClass('border-(--shell-border-subtle)')
		expect(statusTrack).toHaveClass('shadow-(--shadow-floatbar-flat)')
		expect(within(statusBar).getByText('Skills 总数')).toBeInTheDocument()
		expect(within(statusBar).getByText('已启用')).toBeInTheDocument()
		expect(within(statusBar).getByText('待更新')).toBeInTheDocument()
		expect(versionItem).toHaveTextContent('App 版本')
		expect(statusTrack.lastElementChild).toBe(versionItem)
		expect(screen.queryByText('启动状态')).not.toBeInTheDocument()
		expect(screen.queryByText('平台')).not.toBeInTheDocument()
		expect(screen.queryByText('任务状态')).not.toBeInTheDocument()
	})
})
