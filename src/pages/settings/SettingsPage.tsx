import { useState } from 'react'
import { repairRepository, startDemoTask, writeTestLog } from '@/lib/tauri/commands'
import { normalizeCommandError } from '@/lib/tauri/errors'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { PageScaffold } from '@/components/shared/PageScaffold'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/stores/app-store'

export function SettingsPage() {
	const [dialogOpen, setDialogOpen] = useState(false)
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
		<PageScaffold
			eyebrow='System Preferences'
			title='设置'
			description='只放长期偏好与系统配置，同时收纳开发与诊断入口，不承接高频治理任务。'
			actions={
				<Button
					variant='secondary'
					onClick={() => setDialogOpen(true)}>
					打开确认弹窗
				</Button>
			}>
			<section className='grid gap-4 2xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,1fr)]'>
				<div className='grid gap-4'>
					<Card className='rounded-[1.5rem] bg-card/84'>
						<CardHeader>
							<CardTitle>长期偏好</CardTitle>
							<CardDescription>设置页只承载会长期存在的系统偏好和默认行为。</CardDescription>
						</CardHeader>
						<CardContent className='grid gap-3 md:grid-cols-2'>
							{[
								['通用', '默认安装方式、日志级别、基础偏好'],
								['扫描与路径', '仓库根目录、扫描目录与默认路径'],
								['AI 工具配置', '本地工具路径、环境提示与连接状态'],
								['更新策略', '自动检查、提示频率与默认行为'],
								['界面偏好', '默认视图、信息密度与界面呈现'],
								['关于', '版本信息、环境概况与项目说明'],
							].map(([label, value]) => (
								<div
									key={label}
									className='rounded-[1.35rem] border border-border/80 bg-muted/38 p-4'>
									<strong className='text-sm'>{label}</strong>
									<p className='mt-1 text-sm leading-6 text-muted-foreground'>{value}</p>
								</div>
							))}
						</CardContent>
					</Card>
					<Card className='rounded-[1.5rem] bg-card/84'>
						<CardHeader>
							<CardTitle>当前环境</CardTitle>
							<CardDescription>当前设备和项目的默认路径、日志与系统快照。</CardDescription>
						</CardHeader>
						<CardContent className='flex flex-col gap-3'>
							{[
								[
									'仓库路径',
									repositoryRoot ?? settingsSnapshot?.repositoryRoot ?? suggestedRepositoryRoot ?? '待生成',
									'Repo',
								],
								['日志入口', bootstrapPayload?.paths.appLogDir ?? '当前阶段已打通文件日志写入能力', 'Logs'],
							].map(([label, value, tag]) => (
								<div
									key={label}
									className='flex items-start justify-between gap-3 rounded-[1.35rem] border border-border/80 bg-background/82 p-4'>
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
						</CardContent>
					</Card>
					<Card className='rounded-[1.5rem] bg-card/84'>
						<CardHeader>
							<CardTitle>仓库状态</CardTitle>
							<CardDescription>固定使用用户目录下的默认仓库，并展示实时健康状态。</CardDescription>
						</CardHeader>
						<CardContent className='flex flex-col gap-3'>
							<div className='rounded-[1.35rem] border border-border/80 bg-background/82 p-4'>
								<div className='flex items-start justify-between gap-3'>
									<div className='min-w-0'>
										<strong className='text-sm'>健康状态</strong>
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
						</CardContent>
					</Card>
				</div>
				<div className='grid gap-4'>
					<Card className='rounded-[1.5rem] bg-card/84'>
						<CardHeader>
							<CardTitle>开发与诊断</CardTitle>
							<CardDescription>原先独立 Dashboard 承担的验证能力统一收纳在这里。</CardDescription>
						</CardHeader>
						<CardContent className='flex flex-col gap-3'>
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
						</CardContent>
					</Card>
					<Card className='rounded-[1.5rem] bg-card/84'>
						<CardHeader>
							<CardTitle>默认行为</CardTitle>
							<CardDescription>
								设置页仍然保留全局默认项，但不承接临时处理任务。界面会随系统主题自动切换浅色与深色模式。
							</CardDescription>
						</CardHeader>
						<CardContent className='flex flex-col gap-3'>
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
							].map(([label, value]) => (
								<div
									key={label}
									className='rounded-[1.35rem] border border-border/80 bg-muted/38 p-4'>
									<strong className='text-sm'>{label}</strong>
									<p className='mt-1 text-sm leading-6 text-muted-foreground'>{value}</p>
								</div>
							))}
						</CardContent>
					</Card>
				</div>
			</section>
			<ConfirmDialog
				open={dialogOpen}
				title='确认弹窗骨架'
				description='危险操作确认流会在设置与工作台中复用这个对话框。'
				onCancel={() => setDialogOpen(false)}
				onConfirm={() => setDialogOpen(false)}
			/>
		</PageScaffold>
	)
}
