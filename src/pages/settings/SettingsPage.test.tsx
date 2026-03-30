import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PageHeaderProvider } from '@/app/layout/PageHeaderContext'
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
				recentGithubRepositories: [],
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

	function renderPage() {
		return render(
			<PageHeaderProvider>
				<SettingsPage />
			</PageHeaderProvider>,
		)
	}

	it('展示真实仓库健康状态与缺失目录', () => {
		renderPage()

		expect(screen.getByTestId('settings-tab-rail')).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: '常规' })).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: '环境' })).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: '仓库' })).toBeInTheDocument()
		expect(screen.getByRole('tab', { name: '开发诊断' })).toBeInTheDocument()
		expect(screen.getByTestId('settings-tab-rail')).toHaveClass('bg-white')
		expect(screen.getByTestId('settings-tab-rail')).toHaveClass('shadow-none')
		expect(screen.getByTestId('settings-tab-rail')).not.toHaveClass('w-full')
		expect(screen.getByTestId('settings-tab-rail')).toHaveClass('self-start')
		expect(screen.getByTestId('settings-page-shell')).not.toHaveClass('py-1')
		expect(screen.getByTestId('settings-page-shell')).not.toHaveClass('md:py-2')
		expect(screen.getByTestId('settings-panel-card')).toBeInTheDocument()
		expect(screen.getByTestId('settings-panel-card')).toHaveClass('bg-white')
		expect(screen.getByTestId('settings-panel-card')).toHaveClass('shadow-none')
		expect(screen.getByTestId('settings-panel-body')).not.toHaveClass('pt-4')
		expect(screen.getByText('默认安装方式')).toBeInTheDocument()
	})

	it('点击修复仓库后会刷新仓库状态并写入成功 toast', async () => {
		repairRepositoryMock.mockResolvedValue({
			rootPath: '/Users/test/.stoneskills',
			status: 'healthy',
			missingDirectories: [],
			writable: true,
			message: '仓库目录可用',
		})

		renderPage()
		fireEvent.click(screen.getByRole('tab', { name: '仓库' }))
		expect(screen.getByText('仓库状态')).toBeInTheDocument()
		expect(screen.getByText('warning')).toBeInTheDocument()
		expect(screen.getByText('可写状态：可写')).toBeInTheDocument()
		expect(screen.getByText('缺失目录：cache、logs')).toBeInTheDocument()
		fireEvent.click(screen.getByRole('button', { name: '修复仓库' }))

		await waitFor(() => {
			expect(repairRepositoryMock).toHaveBeenCalledTimes(1)
		})

		expect(useAppStore.getState().repositoryHealthStatus).toBe('healthy')
		expect(useAppStore.getState().repositoryMissingDirectories).toEqual([])
		expect(useAppStore.getState().toasts.at(-1)?.title).toBe('仓库修复完成')
	})

	it('切换到开发诊断分组后仍可触发诊断动作', async () => {
		writeTestLogMock.mockResolvedValue({
			logFilePath: '/tmp/logs/app.log',
			appLogDir: '/tmp/logs',
			message: 'ok',
		})
		startDemoTaskMock.mockResolvedValue(undefined)

		renderPage()
		fireEvent.click(screen.getByRole('tab', { name: '开发诊断' }))

		fireEvent.click(screen.getByRole('button', { name: '写入测试日志' }))
		fireEvent.click(screen.getByRole('button', { name: '触发演示任务' }))

		await waitFor(() => {
			expect(writeTestLogMock).toHaveBeenCalledTimes(1)
			expect(startDemoTaskMock).toHaveBeenCalledTimes(1)
		})
	})
})
