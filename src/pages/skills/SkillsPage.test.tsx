import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AppRouter } from '@/app/router/AppRouter'
import { useAppStore } from '@/stores/app-store'

function LocationProbe() {
	const location = useLocation()

	return <output data-testid='location'>{`${location.pathname}${location.search}`}</output>
}

describe('SkillsPage', () => {
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
			tasks: {},
			skillsLoadStatus: 'ready',
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
					extraMetadataJson: JSON.stringify({ updateAvailable: true, hasIssues: true }),
					tags: ['core', 'workspace'],
					sources: [
						{
							id: 'source-alpha',
							sourceType: 'github',
							sourceUrl: 'https://github.com/example/alpha',
							sourceRef: 'main',
							sourceCommit: null,
							sourceSubpath: null,
							isPrimary: true,
						},
					],
					supportedTargets: [
						{ targetKey: 'claude-code', supportLevel: 'full' },
						{ targetKey: 'codex', supportLevel: 'partial' },
					],
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
					status: 'error',
					extraMetadataJson: JSON.stringify({ hasIssues: true }),
					tags: ['local'],
					sources: [
						{
							id: 'source-beta',
							sourceType: 'local',
							sourceUrl: null,
							sourceRef: null,
							sourceCommit: null,
							sourceSubpath: null,
							isPrimary: true,
						},
					],
					supportedTargets: [{ targetKey: 'claude-code', supportLevel: 'full' }],
					createdAt: 1,
					updatedAt: 2,
					lastCheckedAt: 1710000100000,
				},
			],
			currentPlatform: 'macOS',
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

	it('把 Skills 页面渲染成工作台并展示概览信息', async () => {
		render(
			<MemoryRouter initialEntries={['/skills']}>
				<AppRouter />
			</MemoryRouter>,
		)

		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: '我的 Skills',
			}),
		).toBeInTheDocument()

		expect(screen.getByTestId('page-header')).toContainElement(
			screen.getByRole('heading', {
				level: 1,
				name: '我的 Skills',
			}),
		)
		expect(screen.getByTestId('page-header')).toContainElement(screen.getByRole('button', { name: '导入 Skill' }))
		expect(screen.getByTestId('page-scroll-content')).toHaveClass('scrollbar-hidden')
		expect(screen.getByTestId('page-scroll-content')).toContainElement(screen.getByPlaceholderText('搜索 Skills'))
		expect(screen.getAllByText('已安装').length).toBeGreaterThan(0)
		expect(screen.getAllByText('待更新').length).toBeGreaterThan(0)
		expect(screen.getAllByText('异常').length).toBeGreaterThan(0)
		expect(screen.getByRole('button', { name: '导入 Skill' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '重新扫描' })).toBeInTheDocument()
		expect(screen.getByPlaceholderText('搜索 Skills')).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: '列表视图' })).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: '卡片视图' })).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: '列表视图' })).toHaveAttribute('data-state', 'active')
		expect(screen.getByRole('button', { name: '导入 Skill' })).toHaveClass('h-10')
		expect(screen.getByRole('button', { name: '重新扫描' })).toHaveClass('h-10')
	})

	it('根据 query 参数打开详情抽屉并支持关闭', async () => {
		render(
			<MemoryRouter initialEntries={['/skills?skill=skill-alpha&tab=issues']}>
				<AppRouter />
				<LocationProbe />
			</MemoryRouter>,
		)

		expect(await screen.findByRole('dialog', { name: 'Skill Alpha' })).toBeInTheDocument()
		expect(screen.getByText('问题与建议')).toBeInTheDocument()
		expect(screen.getByTestId('location')).toHaveTextContent('/skills?skill=skill-alpha&tab=issues')

		fireEvent.click(screen.getByRole('button', { name: '关闭详情' }))

		expect(screen.getByTestId('location')).toHaveTextContent('/skills')
	})
})
