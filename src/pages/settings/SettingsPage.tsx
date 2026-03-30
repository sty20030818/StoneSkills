import { useState } from 'react'
import { repairRepository, startDemoTask, writeTestLog } from '@/lib/tauri/commands'
import { normalizeCommandError } from '@/lib/tauri/errors'
import { usePageHeader } from '@/app/layout/PageHeaderContext'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAppStore } from '@/stores/app-store'

type SettingsTab = 'general' | 'environment' | 'repository' | 'diagnostics'

export function SettingsPage() {
	const [dialogOpen, setDialogOpen] = useState(false)
	const [activeTab, setActiveTab] = useState<SettingsTab>('general')
	const suggestedRepositoryRoot = useAppStore((state) => state.suggestedRepositoryRoot)
	const settingsSnapshot = useAppStore((state) => state.settingsSnapshot)
	const repositoryRoot = useAppStore((state) => state.repositoryRoot)
	const repositoryHealthStatus = useAppStore((state) => state.repositoryHealthStatus)
	const repositoryMissingDirectories = useAppStore((state) => state.repositoryMissingDirectories)
	const repositoryWritable = useAppStore((state) => state.repositoryWritable)
	const repositoryMessage = useAppStore((state) => state.repositoryMessage)
	const setRepositoryStatus = useAppStore((state) => state.setRepositoryStatus)
	const bootstrapPayload = useAppStore((state) => state.bootstrapPayload)
	const pushToast = useAppStore((state) => state.pushToast)
	const headerContent = usePageHeader(
		'设置',
		<Button
			variant='secondary'
			onClick={() => setDialogOpen(true)}>
			打开确认弹窗
		</Button>,
	)

	const handleLogWrite = async () => {
		try {
			const result = await writeTestLog()
			pushToast({
				title: '日志测试成功',
				description: `已写入 ${result.logFilePath}`,
			})
		} catch (error) {
			const normalized = normalizeCommandError(error)
			pushToast({
				title: '日志写入失败',
				description: normalized.message,
			})
		}
	}

	const handleDemoTask = async () => {
		try {
			await startDemoTask()
		} catch (error) {
			const normalized = normalizeCommandError(error)
			pushToast({
				title: '演示任务启动失败',
				description: normalized.message,
			})
		}
	}

	const handleRepositoryRepair = async () => {
		try {
			const result = await repairRepository()
			setRepositoryStatus(result)
			pushToast({
				title: '仓库修复完成',
				description: result.message ?? '默认仓库目录结构已恢复。',
			})
		} catch (error) {
			const normalized = normalizeCommandError(error)
			pushToast({
				title: '仓库修复失败',
				description: normalized.message,
			})
		}
	}

	return (
		<>
			{headerContent}
			<div
				data-testid='settings-page-shell'
				className='flex h-full min-h-0 flex-col gap-3'>
				<Tabs
					value={activeTab}
					onValueChange={(value) => setActiveTab(value as SettingsTab)}
					className='flex min-h-0 flex-1 flex-col gap-3'>
					<TabsList
						data-testid='settings-tab-rail'
						className='h-12 self-start justify-start rounded-full border border-border/70 bg-white p-1 shadow-none'>
						<TabsTrigger
							value='general'
							onClick={() => setActiveTab('general')}>
							常规
						</TabsTrigger>
						<TabsTrigger
							value='environment'
							onClick={() => setActiveTab('environment')}>
							环境
						</TabsTrigger>
						<TabsTrigger
							value='repository'
							onClick={() => setActiveTab('repository')}>
							仓库
						</TabsTrigger>
						<TabsTrigger
							value='diagnostics'
							onClick={() => setActiveTab('diagnostics')}>
							开发诊断
						</TabsTrigger>
					</TabsList>

					<Card
						data-testid='settings-panel-card'
						className='min-h-0 flex-1 rounded-[1.8rem] border-border/70 bg-white shadow-none'>
						<CardContent
							data-testid='settings-panel-body'
							className='scrollbar-hidden h-full overflow-y-auto'>
							<TabsContent
								value='general'
								className='mt-0'>
								<div className='grid gap-4'>
									<div className='grid gap-3 md:grid-cols-2'>
										{[
											['默认安装方式', settingsSnapshot?.defaultInstallMode ?? '待配置'],
											[
												'自动更新检查',
												settingsSnapshot?.autoCheckUpdates == null
													? '待配置'
													: settingsSnapshot.autoCheckUpdates
														? '已开启'
														: '已关闭',
											],
											['主题模式', '跟随系统'],
											['日志级别', settingsSnapshot?.logLevel ?? '待配置'],
										].map(([label, value]) => (
											<div
												key={label}
												className='rounded-[1.35rem] border border-border/80 bg-white p-4'>
												<strong className='text-sm'>{label}</strong>
												<p className='mt-1 text-sm leading-6 text-muted-foreground'>{value}</p>
											</div>
										))}
									</div>
									<div className='rounded-[1.35rem] border border-border/80 bg-white p-4'>
										<strong className='text-sm'>说明</strong>
										<p className='mt-1 text-sm leading-6 text-muted-foreground'>
											设置页只保留长期偏好和默认行为，不承接高频治理动作。
										</p>
									</div>
								</div>
							</TabsContent>

							<TabsContent
								value='environment'
								className='mt-0'>
								<div className='grid gap-3'>
									{[
										[
											'仓库路径',
											repositoryRoot ?? settingsSnapshot?.repositoryRoot ?? suggestedRepositoryRoot ?? '待生成',
											'Repo',
										],
										['日志入口', bootstrapPayload?.paths.appLogDir ?? '当前阶段已打通文件日志写入能力', 'Logs'],
										['应用版本', bootstrapPayload?.system.appVersion ?? '待识别', 'App'],
										['当前平台', bootstrapPayload?.system.platformLabel ?? '待识别', 'Platform'],
									].map(([label, value, tag]) => (
										<div
											key={label}
											className='flex items-start justify-between gap-3 rounded-[1.35rem] border border-border/80 bg-white p-4'>
											<div className='min-w-0'>
												<strong className='text-sm'>{label}</strong>
												<p className='mt-1 break-all text-sm leading-6 text-muted-foreground'>{value}</p>
											</div>
											<Badge
												variant='outline'
												className='rounded-xl'>
												{tag}
											</Badge>
										</div>
									))}
								</div>
							</TabsContent>

							<TabsContent
								value='repository'
								className='mt-0'>
								<div className='grid gap-4'>
									<div className='rounded-[1.35rem] border border-border/80 bg-white p-4'>
										<div className='flex items-start justify-between gap-3'>
											<div className='min-w-0'>
												<strong className='text-sm'>仓库状态</strong>
												<p className='mt-1 text-sm leading-6 text-muted-foreground'>
													{repositoryMessage ?? '等待仓库状态返回'}
												</p>
											</div>
											<Badge
												variant='outline'
												className='rounded-xl'>
												{repositoryHealthStatus ?? 'unknown'}
											</Badge>
										</div>
										<div className='mt-3 grid gap-2 text-sm text-muted-foreground'>
											<p>可写状态：{repositoryWritable == null ? '未知' : repositoryWritable ? '可写' : '不可写'}</p>
											<p>
												缺失目录：
												{repositoryMissingDirectories.length > 0 ? repositoryMissingDirectories.join('、') : '无'}
											</p>
										</div>
									</div>
									<div className='flex flex-wrap gap-2'>
										<Button
											variant='secondary'
											onClick={handleRepositoryRepair}>
											修复仓库
										</Button>
									</div>
								</div>
							</TabsContent>

							<TabsContent
								value='diagnostics'
								className='mt-0'>
								<div className='grid gap-4'>
									<div className='rounded-[1.35rem] border border-info-border bg-info-bg p-4 text-info'>
										<strong className='text-sm'>开发态入口</strong>
										<p className='mt-1 text-sm leading-6 text-info/85'>
											用于日志写入测试、任务事件演示和桥接链路验证，不进入正式一级导航。
										</p>
									</div>
									<div className='flex flex-wrap gap-2'>
										<Button onClick={handleLogWrite}>写入测试日志</Button>
										<Button
											variant='secondary'
											onClick={handleDemoTask}>
											触发演示任务
										</Button>
									</div>
								</div>
							</TabsContent>
						</CardContent>
					</Card>
				</Tabs>
				<ConfirmDialog
					open={dialogOpen}
					title='确认弹窗骨架'
					description='危险操作确认流会在设置与工作台中复用这个对话框。'
					onCancel={() => setDialogOpen(false)}
					onConfirm={() => setDialogOpen(false)}
				/>
			</div>
		</>
	)
}
