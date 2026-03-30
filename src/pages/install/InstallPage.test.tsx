import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppRouter } from '@/app/router/AppRouter'
import type { SkillImportPreview } from '@/lib/tauri/contracts'
import { useAppStore } from '@/stores/app-store'

const {
	importGithubSkillMock,
	importLocalSkillMock,
	inspectGithubRepositoryMock,
	inspectLocalDirectoryMock,
	listSkillsMock,
	setAppSettingMock,
} = vi.hoisted(() => ({
	importGithubSkillMock: vi.fn(),
	importLocalSkillMock: vi.fn(),
	inspectGithubRepositoryMock: vi.fn(),
	inspectLocalDirectoryMock: vi.fn(),
	listSkillsMock: vi.fn(),
	setAppSettingMock: vi.fn(),
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
		setAppSetting: setAppSettingMock,
	}
})

describe('InstallPage', () => {
	beforeEach(() => {
		importGithubSkillMock.mockReset()
		importLocalSkillMock.mockReset()
		inspectGithubRepositoryMock.mockReset()
		inspectLocalDirectoryMock.mockReset()
		listSkillsMock.mockReset()
		setAppSettingMock.mockReset()
		setAppSettingMock.mockResolvedValue({
			key: 'recent_github_repositories',
			valueJson: [],
			updatedAt: 1,
		})

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
				recentGithubRepositories: [],
			},
		})
	})

	it('支持 GitHub 仓库识别并导入后显示回流入口', async () => {
		let resolveInspect: ((value: SkillImportPreview) => void) | undefined

		inspectGithubRepositoryMock.mockImplementation(
			() =>
				new Promise((resolve) => {
					resolveInspect = resolve
				}),
		)
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

		fireEvent.change(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			target: { value: 'https://github.com/example/skills' },
		})
		const inspectButton = screen.getByRole('button', { name: '识别仓库' })
		fireEvent.click(inspectButton)

		await waitFor(() => {
			expect(screen.getByRole('button', { name: '识别中...' })).toBeDisabled()
		})
		expect(screen.getByTestId('github-inspect-loader')).toHaveClass('animate-spin')

		resolveInspect?.({
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

		await screen.findByRole('button', { name: '返回' })
		expect(screen.queryByTestId('github-import-history-card')).not.toBeInTheDocument()
		expect(screen.queryByTestId('install-github-input-row')).not.toBeInTheDocument()
		expect(screen.queryByTestId('install-main-card')).not.toBeInTheDocument()
		expect(screen.getByTestId('install-page-shell')).toHaveClass('overflow-hidden')
		expect(screen.getByTestId('install-github-preview-stage')).toHaveClass('min-h-0')
		expect(screen.getByTestId('install-github-preview-stage')).toHaveClass('flex-1')
		expect(screen.getByTestId('install-github-preview-stage')).toHaveClass('gap-3')
		expect(screen.getByDisplayValue('https://github.com/example/skills')).toHaveAttribute('readonly')
		expect(screen.queryByText('来源：https://github.com/example/skills')).not.toBeInTheDocument()
		const backButton = screen.getByRole('button', { name: '返回' })
		expect(backButton).toBeInTheDocument()
		expect(backButton).toHaveAttribute('data-hovered', 'false')
		expect(screen.getByRole('button', { name: '安装全部' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '查看详情' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '安装选中' })).toBeDisabled()
		expect(screen.getByRole('button', { name: '取消' })).toBeDisabled()
		expect(screen.getByText('Broken Skill')).toBeInTheDocument()
		expect(screen.getByText('不可安装：缺失字段 description；slug 冲突：broken-skill')).toBeInTheDocument()
		fireEvent.mouseEnter(backButton)
		expect(backButton).toHaveAttribute('data-hovered', 'true')
		fireEvent.mouseLeave(backButton)
		expect(backButton).toHaveAttribute('data-hovered', 'false')
		fireEvent.click(screen.getByRole('button', { name: '安装全部' }))

		await waitFor(() => {
			expect(importGithubSkillMock).toHaveBeenCalledWith({
				url: 'https://github.com/example/skills',
				relativePath: '',
				slugOverride: null,
				nameOverride: null,
				descriptionOverride: null,
			})
		})
		expect(importGithubSkillMock).toHaveBeenCalledTimes(1)

		expect(await screen.findByText('导入完成')).toBeInTheDocument()
	})

	it('调用 GitHub 识别命令前会先进入 loading 状态', async () => {
		inspectGithubRepositoryMock.mockImplementation(async () => {
			expect(screen.getByRole('button', { name: '识别中...' })).toBeDisabled()
			expect(screen.getByTestId('github-inspect-loader')).toBeInTheDocument()

			return {
				sourceType: 'github',
				sourceLabel: 'https://github.com/example/skills',
				candidates: [],
			}
		})

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.change(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			target: { value: 'https://github.com/example/skills' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		await waitFor(() => {
			expect(inspectGithubRepositoryMock).toHaveBeenCalledTimes(1)
		})
	})

	it('GitHub 输入态会显示历史卡片并支持回车提交', async () => {
		useAppStore.setState({
			settingsSnapshot: {
				repositoryRoot: '/tmp/repo',
				defaultInstallMode: 'symlink',
				autoCheckUpdates: true,
				githubToken: null,
				scanPaths: ['/tmp/repo'],
				logLevel: 'info',
				recentGithubRepositories: ['https://github.com/antfu/skills'],
			},
		})
		inspectGithubRepositoryMock.mockResolvedValue({
			sourceType: 'github',
			sourceLabel: 'https://github.com/example/skills',
			candidates: [],
		})

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		expect(await screen.findByTestId('github-import-history-card')).toHaveClass('flex-1')
		expect(screen.getByTestId('github-import-history-card')).toHaveClass('min-h-0')
		expect(screen.getByTestId('github-import-history-list-shell')).toHaveClass('overflow-y-auto')
		expect(screen.getByTestId('install-github-entry-stage')).toBeInTheDocument()
		expect(screen.getByTestId('github-import-entry-card')).toBeInTheDocument()
		expect(screen.queryByTestId('install-main-card')).not.toBeInTheDocument()
		expect(screen.getByTestId('github-import-entry-card')).not.toContainElement(screen.getByTestId('github-import-history-card'))
		expect(screen.getByText('https://github.com/antfu/skills')).toBeInTheDocument()

		const input = screen.getByPlaceholderText('https://github.com/user/repo 或 user/repo')
		fireEvent.change(input, {
			target: { value: 'https://github.com/example/skills' },
		})
		fireEvent.keyDown(input, {
			key: 'Enter',
			code: 'Enter',
		})

		await waitFor(() => {
			expect(inspectGithubRepositoryMock).toHaveBeenCalledWith('https://github.com/example/skills')
		})
	})

	it('输入为空时按回车不会触发识别', async () => {
		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.keyDown(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			key: 'Enter',
			code: 'Enter',
		})

		expect(inspectGithubRepositoryMock).not.toHaveBeenCalled()
	})

	it('点击历史仓库会覆盖输入框并直接触发识别', async () => {
		useAppStore.setState({
			settingsSnapshot: {
				repositoryRoot: '/tmp/repo',
				defaultInstallMode: 'symlink',
				autoCheckUpdates: true,
				githubToken: null,
				scanPaths: ['/tmp/repo'],
				logLevel: 'info',
				recentGithubRepositories: ['https://github.com/antfu/skills'],
			},
		})
		inspectGithubRepositoryMock.mockResolvedValue({
			sourceType: 'github',
			sourceLabel: 'https://github.com/antfu/skills',
			candidates: [],
		})

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.click(await screen.findByRole('button', { name: 'https://github.com/antfu/skills' }))

		await waitFor(() => {
			expect(screen.getByDisplayValue('https://github.com/antfu/skills')).toBeInTheDocument()
			expect(inspectGithubRepositoryMock).toHaveBeenCalledWith('https://github.com/antfu/skills')
		})
	})

	it('GitHub 识别成功后会写入去重后的历史记录', async () => {
		useAppStore.setState({
			settingsSnapshot: {
				repositoryRoot: '/tmp/repo',
				defaultInstallMode: 'symlink',
				autoCheckUpdates: true,
				githubToken: null,
				scanPaths: ['/tmp/repo'],
				logLevel: 'info',
				recentGithubRepositories: ['https://github.com/example/skills'],
			},
		})
		inspectGithubRepositoryMock.mockResolvedValue({
			sourceType: 'github',
			sourceLabel: 'example/skills',
			candidates: [],
		})

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.change(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			target: { value: 'example/skills' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		await screen.findByRole('button', { name: '返回' })
		expect(setAppSettingMock).toHaveBeenCalledWith('recent_github_repositories', [
			'https://github.com/example/skills',
		])

		fireEvent.click(screen.getByRole('button', { name: '返回' }))
		const historyItems = screen.getAllByRole('button', { name: 'https://github.com/example/skills' })
		expect(historyItems).toHaveLength(1)
	})

	it('GitHub 识别失败时不会写入历史记录', async () => {
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

		fireEvent.change(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			target: { value: 'https://github.com/example/missing' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		expect(await screen.findByText('导入预览失败')).toBeInTheDocument()
		expect(setAppSettingMock).not.toHaveBeenCalled()
	})

	it('在全局 Header 岛中只展示标题而不重复渲染旧页面头部', async () => {
		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		const heading = await screen.findByRole('heading', {
			level: 1,
			name: '导入 / 安装',
		})

		expect(screen.getByTestId('app-header-island')).toContainElement(heading)
		expect(screen.queryByTestId('page-header')).not.toBeInTheDocument()
		expect(screen.queryByRole('button', { name: '重新扫描' })).not.toBeInTheDocument()
		expect(screen.getByPlaceholderText('https://github.com/user/repo 或 user/repo')).toBeInTheDocument()
		expect(screen.getByTestId('install-github-entry-stage')).toBeInTheDocument()
		expect(screen.getByTestId('github-import-entry-card')).toBeInTheDocument()
		expect(screen.getByTestId('github-import-history-card')).toBeInTheDocument()
		expect(screen.getByTestId('install-source-rail')).toBeInTheDocument()
		expect(screen.getByTestId('install-source-rail')).toHaveClass('bg-white')
		expect(screen.getByTestId('install-source-rail')).toHaveClass('shadow-none')
		expect(screen.getByTestId('install-source-rail')).toHaveClass('self-start')
		expect(screen.getByTestId('install-source-rail')).not.toHaveClass('w-full')
		expect(screen.getByTestId('install-page-shell')).not.toHaveClass('py-1')
		expect(screen.getByTestId('install-page-shell')).not.toHaveClass('md:py-2')
		expect(screen.queryByTestId('install-main-card')).not.toBeInTheDocument()
		expect(screen.getByTestId('github-import-entry-card')).not.toContainElement(screen.getByTestId('install-source-rail'))
		expect(screen.getByRole('heading', { level: 2, name: 'Git 仓库地址' })).toBeInTheDocument()
		expect(screen.getByTestId('install-github-input-row')).toHaveClass('grid-cols-[minmax(0,1fr)_auto]')
		expect(screen.getByText('支持格式：')).toBeInTheDocument()
		expect(screen.getByText('https://github.com/user/repo 或直接写 user/repo')).toBeInTheDocument()
		expect(screen.getByText('https://github.com/user/repo/tree/main/skills/my-skill（指定子路径）')).toBeInTheDocument()
		expect(screen.queryByText('选择来源并识别 Skill')).not.toBeInTheDocument()
		expect(screen.queryByText('先识别候选 Skill，再补齐字段并确认导入。')).not.toBeInTheDocument()
		expect(screen.queryByText('GitHub 仓库 URL')).not.toBeInTheDocument()
		expect(screen.queryByText('导入流程')).not.toBeInTheDocument()
		expect(screen.queryByText('导入后操作')).not.toBeInTheDocument()
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

		fireEvent.change(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			target: { value: 'https://github.com/example/broken-skills' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		expect(await screen.findByText('Broken Skill')).toBeInTheDocument()
		expect(screen.getByText('不可安装：缺失字段 description；slug 冲突：broken-skill')).toBeInTheDocument()
		const disabledCard = screen.getByTestId('github-import-candidate-card-skills/broken')
		expect(disabledCard).toHaveAttribute('aria-disabled', 'true')
		fireEvent.click(disabledCard)
		expect(screen.getByRole('button', { name: '安装选中' })).toBeDisabled()
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

		fireEvent.change(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			target: { value: 'https://github.com/example/missing' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		expect(await screen.findByText('导入预览失败')).toBeInTheDocument()
		expect(screen.getByDisplayValue('https://github.com/example/missing')).toBeInTheDocument()
	})

	it('支持选择候选项、取消选择并安装选中项', async () => {
		inspectGithubRepositoryMock.mockResolvedValue({
			sourceType: 'github',
			sourceLabel: 'https://github.com/example/skills',
			candidates: [
				{
					relativePath: '',
					slug: 'skill-alpha',
					name: 'Skill Alpha',
					description: 'Alpha 描述',
					author: 'Stone',
					version: '1.0.0',
					readmePath: '/tmp/README.md',
					missingFields: [],
					conflicts: [],
				},
				{
					relativePath: 'skills/beta',
					slug: 'skill-beta',
					name: 'Skill Beta',
					description: 'Beta 描述',
					author: 'Stone',
					version: '1.0.0',
					readmePath: '/tmp/README.md',
					missingFields: [],
					conflicts: [],
				},
			],
		})
		importGithubSkillMock.mockResolvedValue({
			id: 'skill-alpha',
			slug: 'skill-alpha',
			name: 'Skill Alpha',
			version: '1.0.0',
			description: 'Alpha 描述',
			author: 'Stone',
			localPath: '/Users/test/.stoneskills/skills/skill-alpha',
			icon: null,
			readmePath: '/Users/test/.stoneskills/skills/skill-alpha/README.md',
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

		fireEvent.change(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			target: { value: 'https://github.com/example/skills' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		await screen.findByText('Skill Alpha')
		const alphaCard = screen.getByTestId('github-import-candidate-card-skill-alpha')
		const betaCard = screen.getByTestId('github-import-candidate-card-skills/beta')

		fireEvent.click(alphaCard)
		expect(alphaCard).toHaveAttribute('aria-pressed', 'true')
		expect(betaCard).toHaveAttribute('aria-pressed', 'false')
		expect(screen.getByRole('button', { name: '安装选中' })).not.toBeDisabled()
		expect(screen.getByRole('button', { name: '取消' })).not.toBeDisabled()

		fireEvent.click(screen.getByRole('button', { name: '取消' }))
		expect(alphaCard).toHaveAttribute('aria-pressed', 'false')
		expect(screen.getByRole('button', { name: '安装选中' })).toBeDisabled()

		fireEvent.click(alphaCard)
		fireEvent.click(betaCard)
		fireEvent.click(screen.getByRole('button', { name: '安装选中' }))

		await waitFor(() => {
			expect(importGithubSkillMock).toHaveBeenCalledTimes(2)
		})
		expect(importGithubSkillMock).toHaveBeenNthCalledWith(1, {
			url: 'https://github.com/example/skills',
			relativePath: '',
			slugOverride: null,
			nameOverride: null,
			descriptionOverride: null,
		})
		expect(importGithubSkillMock).toHaveBeenNthCalledWith(2, {
			url: 'https://github.com/example/skills',
			relativePath: 'skills/beta',
			slugOverride: null,
			nameOverride: null,
			descriptionOverride: null,
		})
	})

	it('结果态支持返回上一步并保留已输入的 GitHub 地址', async () => {
		inspectGithubRepositoryMock.mockResolvedValue({
			sourceType: 'github',
			sourceLabel: 'https://github.com/example/skills',
			candidates: [
				{
					relativePath: '',
					slug: 'skill-alpha',
					name: 'Skill Alpha',
					description: 'Alpha 描述',
					author: 'Stone',
					version: '1.0.0',
					readmePath: '/tmp/README.md',
					missingFields: [],
					conflicts: [],
				},
			],
		})

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.change(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			target: { value: 'https://github.com/example/skills' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		await screen.findByText('Skill Alpha')
		fireEvent.click(screen.getByRole('button', { name: '返回' }))

		expect(screen.queryByTestId('github-import-preview-root')).not.toBeInTheDocument()
		expect(screen.getByDisplayValue('https://github.com/example/skills')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: '识别仓库' })).toBeInTheDocument()
	})

	it('切换到本地目录时不会渲染 GitHub 结果态组件', async () => {
		inspectGithubRepositoryMock.mockResolvedValue({
			sourceType: 'github',
			sourceLabel: 'https://github.com/example/skills',
			candidates: [
				{
					relativePath: '',
					slug: 'skill-alpha',
					name: 'Skill Alpha',
					description: 'Alpha 描述',
					author: 'Stone',
					version: '1.0.0',
					readmePath: '/tmp/README.md',
					missingFields: [],
					conflicts: [],
				},
			],
		})

		render(
			<MemoryRouter initialEntries={['/install']}>
				<AppRouter />
			</MemoryRouter>,
		)

		fireEvent.change(await screen.findByPlaceholderText('https://github.com/user/repo 或 user/repo'), {
			target: { value: 'https://github.com/example/skills' },
		})
		fireEvent.click(screen.getByRole('button', { name: '识别仓库' }))

		await screen.findByText('Skill Alpha')
		fireEvent.click(screen.getByRole('tab', { name: '本地目录' }))

		expect(screen.queryByRole('button', { name: '安装全部' })).not.toBeInTheDocument()
		expect(screen.queryByText('Skill Alpha')).not.toBeInTheDocument()
		expect(screen.getByPlaceholderText('输入本地 Skill 目录')).toBeInTheDocument()
	})
})
