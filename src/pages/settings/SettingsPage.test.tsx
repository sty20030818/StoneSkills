import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { useAppStore } from '@/stores/app-store'

const { repairRepositoryMock, startDemoTaskMock, writeTestLogMock } = vi.hoisted(() => ({
	repairRepositoryMock: vi.fn(),
	startDemoTaskMock: vi.fn(),
	writeTestLogMock: vi.fn(),
}))

vi.mock('@/lib/tauri/commands', () => ({
	repairRepository: repairRepositoryMock,
	startDemoTask: startDemoTaskMock,
	writeTestLog: writeTestLogMock,
}))

describe('SettingsPage', () => {
	beforeEach(() => {
		repairRepositoryMock.mockReset()
		startDemoTaskMock.mockReset()
		writeTestLogMock.mockReset()

		useAppStore.setState({
			toasts: [],
			repositoryRoot: '/Users/test/.stoneskills',
			suggestedRepositoryRoot: '/Users/test/.stoneskills',
			repositoryHealthStatus: 'warning',
			repositoryMissingDirectories: ['cache', 'logs'],
			repositoryWritable: true,
			repositoryMessage: '仓库目录结构不完整，可执行修复',
			settingsSnapshot: {
				repositoryRoot: '/Users/test/.stoneskills',
				defaultInstallMode: 'link',
				autoCheckUpdates: true,
				githubToken: null,
				scanPaths: [],
				logLevel: 'info',
			},
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
					suggestedRepositoryDir: '/Users/test/.stoneskills',
				},
				launchedAt: '2026-03-26T10:00:00.000Z',
			},
		})
	})

	it('展示真实仓库健康状态与缺失目录', () => {
		render(<SettingsPage />)

		expect(screen.getByText('仓库状态')).toBeInTheDocument()
		expect(screen.getByText('warning')).toBeInTheDocument()
		expect(screen.getByText('可写状态：可写')).toBeInTheDocument()
		expect(screen.getByText('缺失目录：cache、logs')).toBeInTheDocument()
	})

	it('点击修复仓库后会刷新仓库状态并写入成功 toast', async () => {
		repairRepositoryMock.mockResolvedValue({
			rootPath: '/Users/test/.stoneskills',
			status: 'healthy',
			missingDirectories: [],
			writable: true,
			message: '仓库目录可用',
		})

		render(<SettingsPage />)
		fireEvent.click(screen.getByRole('button', { name: '修复仓库' }))

		await waitFor(() => {
			expect(repairRepositoryMock).toHaveBeenCalledTimes(1)
		})

		expect(useAppStore.getState().repositoryHealthStatus).toBe('healthy')
		expect(useAppStore.getState().repositoryMissingDirectories).toEqual([])
		expect(useAppStore.getState().toasts.at(-1)?.title).toBe('仓库修复完成')
	})
})
