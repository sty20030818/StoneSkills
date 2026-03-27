import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
	getAppSettingsSnapshot,
	getRepositoryStatus,
	importGithubSkill,
	importLocalSkill,
	inspectGithubRepository,
	inspectLocalDirectory,
	listSkills,
	repairRepository,
} from '@/lib/tauri/commands'

const { invokeMock } = vi.hoisted(() => ({
	invokeMock: vi.fn(),
}))

vi.mock('@tauri-apps/api/core', () => ({
	invoke: invokeMock,
}))

describe('tauri commands', () => {
	beforeEach(() => {
		invokeMock.mockReset()
	})

	it('会读取 Skills 列表', async () => {
		invokeMock.mockResolvedValue({
			ok: true,
			data: [
				{
					id: 'skill-1',
					slug: 'frontend-guard',
					name: 'Frontend Guard',
					version: '1.0.0',
					description: null,
					author: null,
					localPath: '/tmp/frontend-guard',
					icon: null,
					readmePath: null,
					installMethod: 'link',
					checksum: null,
					status: 'ready',
					extraMetadataJson: null,
					tags: [],
					sources: [],
					supportedTargets: [],
					createdAt: 1,
					updatedAt: 1,
					lastCheckedAt: null,
				},
			],
			error: null,
		})

		const result = await listSkills()

		expect(result).toHaveLength(1)
		expect(invokeMock).toHaveBeenCalledWith('list_skills', undefined)
	})

	it('会读取设置快照', async () => {
		invokeMock.mockResolvedValue({
			ok: true,
			data: {
				repositoryRoot: '/tmp/repository',
				defaultInstallMode: 'link',
				autoCheckUpdates: true,
				githubToken: null,
				scanPaths: [],
				logLevel: 'info',
			},
			error: null,
		})

		const result = await getAppSettingsSnapshot()

		expect(result.repositoryRoot).toBe('/tmp/repository')
		expect(invokeMock).toHaveBeenCalledWith('get_app_settings_snapshot', undefined)
	})

	it('会读取仓库状态', async () => {
		invokeMock.mockResolvedValue({
			ok: true,
			data: {
				rootPath: '/Users/test/.stoneskills',
				status: 'warning',
				missingDirectories: ['cache'],
				writable: true,
				message: '仓库目录结构不完整，可执行修复',
			},
			error: null,
		})

		const result = await getRepositoryStatus()

		expect(result.status).toBe('warning')
		expect(invokeMock).toHaveBeenCalledWith('get_repository_status', undefined)
	})

	it('会触发仓库修复', async () => {
		invokeMock.mockResolvedValue({
			ok: true,
			data: {
				rootPath: '/Users/test/.stoneskills',
				status: 'healthy',
				missingDirectories: [],
				writable: true,
				message: '仓库目录可用',
			},
			error: null,
		})

		const result = await repairRepository()

		expect(result.status).toBe('healthy')
		expect(invokeMock).toHaveBeenCalledWith('repair_repository', undefined)
	})

	it('会读取 GitHub 仓库安装预览', async () => {
		invokeMock.mockResolvedValue({
			ok: true,
			data: {
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
			},
			error: null,
		})

		const result = await inspectGithubRepository('https://github.com/example/skills')

		expect(result.candidates).toHaveLength(1)
		expect(invokeMock).toHaveBeenCalledWith('inspect_github_repository', {
			input: { url: 'https://github.com/example/skills' },
		})
	})

	it('会读取本地目录导入预览', async () => {
		invokeMock.mockResolvedValue({
			ok: true,
			data: {
				sourceType: 'local',
				sourceLabel: '/tmp/skills/example',
				candidates: [
					{
						relativePath: '',
						slug: 'local-skill',
						name: 'Local Skill',
						description: '测试 Skill',
						author: 'Stone',
						version: '1.2.3',
						readmePath: '/tmp/README.md',
						missingFields: [],
						conflicts: [],
					},
				],
			},
			error: null,
		})

		const result = await inspectLocalDirectory('/tmp/skills/example')

		expect(result.sourceType).toBe('local')
		expect(invokeMock).toHaveBeenCalledWith('inspect_local_directory', {
			input: { path: '/tmp/skills/example' },
		})
	})

	it('会执行本地 Skill 导入', async () => {
		invokeMock.mockResolvedValue({
			ok: true,
			data: {
				id: 'skill-1',
				slug: 'local-skill',
				name: 'Local Skill',
				version: '1.2.3',
				description: '测试 Skill',
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
			},
			error: null,
		})

		const result = await importLocalSkill({
			path: '/tmp/skills/example',
			relativePath: '',
		})

		expect(result.slug).toBe('local-skill')
		expect(invokeMock).toHaveBeenCalledWith('import_local_skill', {
			input: {
				path: '/tmp/skills/example',
				relativePath: '',
				slugOverride: null,
				nameOverride: null,
				descriptionOverride: null,
			},
		})
	})

	it('会执行 GitHub Skill 导入', async () => {
		invokeMock.mockResolvedValue({
			ok: true,
			data: {
				id: 'skill-2',
				slug: 'github-skill',
				name: 'GitHub Skill',
				version: '2.0.0',
				description: '测试 GitHub Skill',
				author: 'Stone',
				localPath: '/Users/test/.stoneskills/skills/github-skill',
				icon: null,
				readmePath: '/Users/test/.stoneskills/skills/github-skill/README.md',
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
			},
			error: null,
		})

		const result = await importGithubSkill({
			url: 'https://github.com/example/skills',
			relativePath: 'skills/github-skill',
			slugOverride: 'github-skill',
			nameOverride: 'GitHub Skill',
			descriptionOverride: '测试 GitHub Skill',
		})

		expect(result.slug).toBe('github-skill')
		expect(invokeMock).toHaveBeenCalledWith('import_github_skill', {
			input: {
				url: 'https://github.com/example/skills',
				relativePath: 'skills/github-skill',
				slugOverride: 'github-skill',
				nameOverride: 'GitHub Skill',
				descriptionOverride: '测试 GitHub Skill',
			},
		})
	})
})
