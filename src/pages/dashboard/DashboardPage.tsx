import { startDemoTask, writeTestLog } from '@/lib/tauri/commands'
import { normalizeCommandError } from '@/lib/tauri/errors'
import { usePageHeader } from '@/app/layout/PageHeaderContext'
import { useAppStore } from '@/stores/app-store'
import { Button } from '@/components/ui/button'
import { LoadingState } from '@/components/shared/LoadingState'
import { ErrorState } from '@/components/shared/ErrorState'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function DashboardPage() {
	const bootstrapStatus = useAppStore((state) => state.bootstrapStatus)
	const bootstrapPayload = useAppStore((state) => state.bootstrapPayload)
	const bootstrapError = useAppStore((state) => state.bootstrapError)
	const tasks = useAppStore((state) => state.tasks)
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

	const headerContent = usePageHeader(
		'把桌面骨架先做硬，再让业务能力长出来。',
		<>
			<Button onClick={handleLogWrite}>写入测试日志</Button>
			<Button
				variant='secondary'
				onClick={handleDemoTask}>
				触发演示任务
			</Button>
		</>,
	)

	return (
		<>
			{headerContent}
			{bootstrapStatus === 'loading' ? <LoadingState /> : null}
			{bootstrapStatus === 'error' && bootstrapError ? <ErrorState error={bootstrapError} /> : null}
			<section className='scrollbar-hidden h-full overflow-y-auto py-1 md:py-2'>
				<div className='grid gap-4 2xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]'>
					<Card className='border-border/70 shadow-sm'>
						<CardHeader>
							<CardTitle>Bootstrap Snapshot</CardTitle>
							<CardDescription>当前骨架启动后写入的关键状态摘要。</CardDescription>
						</CardHeader>
						<CardContent className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
							{[
								['应用版本', bootstrapPayload?.system.appVersion ?? '0.0.0'],
								['当前平台', bootstrapPayload?.system.platformLabel ?? '待识别'],
								['建议仓库', bootstrapPayload?.paths.suggestedRepositoryDir ? '就绪' : '待生成'],
								['任务总数', String(Object.keys(tasks).length)],
							].map(([label, value]) => (
								<div
									key={label}
									className='rounded-xl border border-border bg-muted/30 p-4'>
									<span className='text-xs font-medium tracking-wide text-muted-foreground uppercase'>{label}</span>
									<strong className='mt-3 block text-lg'>{value}</strong>
								</div>
							))}
						</CardContent>
					</Card>
					<Card className='border-border/70 shadow-sm'>
						<CardHeader>
							<CardTitle>Diagnostic Rail</CardTitle>
							<CardDescription>后续日志查看器和诊断面板会接在这一列。</CardDescription>
						</CardHeader>
						<CardContent className='flex flex-col gap-3'>
							{[
								['应用数据目录', bootstrapPayload?.paths.appDataDir ?? '待读取', 'Path'],
								['日志目录', bootstrapPayload?.paths.appLogDir ?? '待读取', 'Logs'],
								['启动时间', bootstrapPayload?.launchedAt ?? '待写入', 'Boot'],
							].map(([label, value, tag]) => (
								<div
									key={label}
									className='flex items-start justify-between gap-3 rounded-xl border border-border bg-background/80 p-4'>
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
				</div>
			</section>
		</>
	)
}
