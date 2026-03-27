import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRouter } from '@/app/router/AppRouter'
import { useAppStore } from '@/stores/app-store'

const {
	importGithubSkillMock,
	importLocalSkillMock,
	inspectGithubRepositoryMock,
	inspectLocalDirectoryMock,
	listSkillsMock,
} = vi.hoisted(() => ({
	importGithubSkillMock: vi.fn(),
	importLocalSkillMock: vi.fn(),
	inspectGithubRepositoryMock: vi.fn(),
	inspectLocalDirectoryMock: vi.fn(),
	listSkillsMock: vi.fn(),
}))

vi.mock('@/lib/tauri/commands', async () => {
	const actual = await vi.importActual<typeof import('@/lib/tauri/commands')>('@/lib/tauri/commands')

	return {
		...actual,
		importGithubSkill: importGithubSkillMock,
		importLocalSkill: importLocalSkillMock,
		inspectGithubRepository: inspectGithubRepositoryMock,
		inspectLocalDirectory: inspectLocalDirectoryMock,
		listSkills: listSkillsMock,
	}
})

describe('InstallPage', () => {
	beforeEach(() => {
		importGithubSkillMock.mockReset()
		importLocalSkillMock.mockReset()
		inspectGithubRepositoryMock.mockReset()
		inspectLocalDirectoryMock.mockReset()
		listSkillsMock.mockReset()

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
			toasts: [],
			skillsLoadStatus: 'ready',
			skills: [],
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
		})
	})

	it('支持 GitHub 仓库识别并导入后显示回流入口', async () => {
		inspectGithubRepositoryMock.mockResolvedValue({
			sourceType: 'github',
			sourceLabel: 'https://github.com/example/skills',
			candidates: [
				{
					relativePath: '',
					slug: 'example-skill',
					name: 'Example Skill',
					description: '测试 Skill',
					author: 'Stone',
					version: '1.2.3',
					readmePath: '/tmp/README.md',
					missingFields: [],
					conflicts: [],
				},
			],
		})
		importGithubSkillMock.mockResolvedValue({
			id: 'skill-new',
			slug: 'example-skill',
			name: 'Example Skill',
			version: '1.2.3',
			description: '测试 Skill',
			author: 'Stone',
			localPath: '/Users/test/.stoneskills/skills/example-skill',
			icon: null,
			readmePath: '/Users/test/.stoneskills/skills/example-skill/README.md',
			installMethod: 'copy',
			checksum: null,
			status: 'ready',
			extraMetadataJson: null,
			tags: [],
			sources: [],
			supportedTargets: [],
			createdAt: 1,
			updatedAt: 1,
			lastCheckedAt: null,
		})
		listSkillsMock.mockResolvedValue([])

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.change(await screen.findByPlaceholderText('输入 GitHub 仓库 URL'), {
			target: { value: 'https://github.com/example/skills' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		await screen.findByText('Example Skill')
		fireEvent.click(screen.getByRole('button', { name: '导入 Example Skill' }))

		await waitFor(() => {
			expect(importGithubSkillMock).toHaveBeenCalledWith({
				url: 'https://github.com/example/skills',
				relativePath: '',
				slugOverride: null,
				nameOverride: null,
				descriptionOverride: null,
			})
		})

		expect(await screen.findByText('导入完成')).toBeInTheDocument()
		expect(screen.getByRole('link', { name: '去我的 Skills 查看' })).toHaveAttribute('href', '/skills')
	})

	it('支持本地目录识别并导入', async () => {
		inspectLocalDirectoryMock.mockResolvedValue({
			sourceType: 'local',
			sourceLabel: '/tmp/skills/local-skill',
			candidates: [
				{
					relativePath: '',
					slug: 'local-skill',
					name: 'Local Skill',
					description: '本地测试 Skill',
					author: 'Stone',
					version: '0.9.0',
					readmePath: '/tmp/README.md',
					missingFields: [],
					conflicts: [],
				},
			],
		})
		importLocalSkillMock.mockResolvedValue({
			id: 'skill-local',
			slug: 'local-skill',
			name: 'Local Skill',
			version: '0.9.0',
			description: '本地测试 Skill',
			author: 'Stone',
			localPath: '/Users/test/.stoneskills/skills/local-skill',
			icon: null,
			readmePath: '/Users/test/.stoneskills/skills/local-skill/README.md',
			installMethod: 'copy',
			checksum: null,
			status: 'ready',
			extraMetadataJson: null,
			tags: [],
			sources: [],
			supportedTargets: [],
			createdAt: 1,
			updatedAt: 1,
			lastCheckedAt: null,
		})
		listSkillsMock.mockResolvedValue([])

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.click(await screen.findByRole('tab', { name: '本地目录' }))
		fireEvent.change(screen.getByPlaceholderText('输入本地 Skill 目录'), {
			target: { value: '/tmp/skills/local-skill' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别目录' }))

		await screen.findByText('Local Skill')
		fireEvent.click(screen.getByRole('button', { name: '导入 Local Skill' }))

		await waitFor(() => {
			expect(importLocalSkillMock).toHaveBeenCalledWith({
				path: '/tmp/skills/local-skill',
				relativePath: '',
				slugOverride: null,
				nameOverride: null,
				descriptionOverride: null,
			})
		})
	})

	it('会展示冲突和缺失字段，并阻止直接导入', async () => {
		inspectGithubRepositoryMock.mockResolvedValue({
			sourceType: 'github',
			sourceLabel: 'https://github.com/example/broken-skills',
			candidates: [
				{
					relativePath: 'skills/broken',
					slug: 'broken-skill',
					name: 'Broken Skill',
					description: null,
					author: 'Stone',
					version: '0.1.0',
					readmePath: null,
					missingFields: ['description'],
					conflicts: ['slug 冲突：broken-skill'],
				},
			],
		})

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.change(await screen.findByPlaceholderText('输入 GitHub 仓库 URL'), {
			target: { value: 'https://github.com/example/broken-skills' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		expect(await screen.findByText('缺失字段：description')).toBeInTheDocument()
		expect(screen.getByText('冲突提示：slug 冲突：broken-skill')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '导入 Broken Skill' })).toBeDisabled()
	})

	it('导入失败时会保留输入并展示错误', async () => {
		inspectGithubRepositoryMock.mockRejectedValue({
			code: 'install/github-fetch-failed',
			message: '无法获取 GitHub 仓库内容',
			details: null,
			recoverable: true,
		})

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.change(await screen.findByPlaceholderText('输入 GitHub 仓库 URL'), {
			target: { value: 'https://github.com/example/missing' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		expect(await screen.findByText('导入预览失败')).toBeInTheDocument()
		expect(screen.getByDisplayValue('https://github.com/example/missing')).toBeInTheDocument()
	})
})
