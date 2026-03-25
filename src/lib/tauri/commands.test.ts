import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getAppSettingsSnapshot, listSkills } from '@/lib/tauri/commands'

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
})
