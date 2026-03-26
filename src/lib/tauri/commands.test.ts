import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppSettingsSnapshot, getRepositoryStatus, listSkills, repairRepository } from '@/lib/tauri/commands'

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
})
