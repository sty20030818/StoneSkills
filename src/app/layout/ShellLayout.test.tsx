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

	it('使用固定壳层并在底部显示横跨全宽的产品状态栏', async () => {
		render(
			<MemoryRouter initialEntries={['/skills']}>
				<AppRouter />
			</MemoryRouter>,
		)

		await screen.findByRole('heading', {
			level: 1,
			name: '我的 Skills',
		})

		expect(screen.queryByText('Application Shell')).not.toBeInTheDocument()
		expect(screen.getByTestId('app-shell')).toBeInTheDocument()
		expect(screen.getByTestId('app-sidebar')).toHaveClass('scrollbar-hidden')
		const statusBar = screen.getByTestId('bottom-status-bar')
		const statusTrack = within(statusBar).getByTestId('bottom-status-track')
		const versionItem = within(statusBar).getByTestId('status-app-version')

		expect(statusBar).toBeInTheDocument()
		expect(statusTrack).toHaveClass('h-8')
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
