import { beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from '@/stores/app-store'

describe('useAppStore', () => {
	beforeEach(() => {
		useAppStore.setState({
			toasts: [],
			tasks: {},
			latestTaskId: null,
			skills: [],
			skillsLoadStatus: 'idle',
			skillsError: null,
			settingsSnapshot: null,
			settingsLoadStatus: 'idle',
			settingsError: null,
		})
	})

	it('会写入并清理 toast', () => {
		useAppStore.getState().pushToast({
			title: '日志测试成功',
			description: '日志已写入。',
		})

		const createdToast = useAppStore.getState().toasts[0]

		expect(createdToast.title).toBe('日志测试成功')
		expect(createdToast.description).toBe('日志已写入。')

		useAppStore.getState().dismissToast(createdToast.id)

		expect(useAppStore.getState().toasts).toHaveLength(0)
	})

	it('会按 taskId 合并任务事件', () => {
		useAppStore.getState().upsertTaskEvent({
			taskId: 'bootstrap',
			label: 'Bootstrap',
			status: 'running',
			progress: 10,
			message: '正在启动',
			timestamp: '2026-03-25T10:00:00.000Z',
		})

		useAppStore.getState().upsertTaskEvent({
			taskId: 'bootstrap',
			label: 'Bootstrap',
			status: 'completed',
			progress: 100,
			message: '启动完成',
			timestamp: '2026-03-25T10:00:05.000Z',
		})

		expect(useAppStore.getState().latestTaskId).toBe('bootstrap')
		expect(useAppStore.getState().tasks.bootstrap.status).toBe('completed')
		expect(useAppStore.getState().tasks.bootstrap.progress).toBe(100)
	})

	it('会缓存 Skills 列表与设置快照', () => {
		useAppStore.getState().setSkillsReady([
			{
				id: 'skill-1',
				slug: 'frontend-guard',
				name: 'Frontend Guard',
				version: '1.0.0',
				description: '前端规则',
				author: 'Stone',
				localPath: '/tmp/frontend-guard',
				icon: null,
				readmePath: null,
				installMethod: 'link',
				checksum: null,
				status: 'ready',
				extraMetadataJson: null,
				tags: ['frontend'],
				sources: [],
				supportedTargets: [],
				createdAt: 1,
				updatedAt: 1,
				lastCheckedAt: null,
			},
		])
		useAppStore.getState().setSettingsReady({
			repositoryRoot: '/tmp/repository',
			defaultInstallMode: 'link',
			autoCheckUpdates: true,
			githubToken: null,
			scanPaths: [],
			logLevel: 'info',
		})

		expect(useAppStore.getState().skills).toHaveLength(1)
		expect(useAppStore.getState().skillsLoadStatus).toBe('ready')
		expect(useAppStore.getState().settingsSnapshot?.repositoryRoot).toBe('/tmp/repository')
		expect(useAppStore.getState().settingsLoadStatus).toBe('ready')
	})
})
