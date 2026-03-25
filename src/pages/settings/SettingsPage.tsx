import { useState } from 'react'
import { PageScaffold } from '@/components/shared/PageScaffold'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/stores/app-store'

export function SettingsPage() {
	const [dialogOpen, setDialogOpen] = useState(false)
	const suggestedRepositoryRoot = useAppStore((state) => state.suggestedRepositoryRoot)

	return (
		<PageScaffold
			eyebrow='System Preferences'
			title='先把路径、日志和系统级开关的容器打好，再往里接真实设置项。'
			description='当前设置页主要验证 Dialog、状态读取和诊断入口占位。'
			actions={
				<Button
					variant='secondary'
					onClick={() => setDialogOpen(true)}>
					打开确认弹窗
				</Button>
			}>
			<section className='grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]'>
				<Card className='border-border/70 shadow-sm'>
					<CardHeader>
						<CardTitle>Environment Defaults</CardTitle>
						<CardDescription>路径、日志与系统级默认值入口。</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{[
							['建议仓库路径', suggestedRepositoryRoot ?? '待生成', 'Repo'],
							['日志入口', '当前阶段已打通文件日志写入能力，后续可以扩展为日志查看器。', 'Logs'],
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
				<Card className='border-border/70 shadow-sm'>
					<CardHeader>
						<CardTitle>Reserved Slots</CardTitle>
						<CardDescription>后续设置项会沿着这几个容器继续扩展。</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{[
							['默认安装方式', 'link / copy 策略预留。'],
							['自动检测开关', '目标工具与更新检测策略预留。'],
						].map(([label, value]) => (
							<div
								key={label}
								className='rounded-xl border border-border bg-muted/25 p-4'>
								<strong className='text-sm'>{label}</strong>
								<p className='mt-1 text-sm leading-6 text-muted-foreground'>{value}</p>
							</div>
						))}
					</CardContent>
				</Card>
			</section>
			<ConfirmDialog
				open={dialogOpen}
				title='确认弹窗骨架'
				description='这个对话框用于占位验证危险操作确认流。后续删除、覆盖和批量更新都会复用它。'
				onCancel={() => setDialogOpen(false)}
				onConfirm={() => setDialogOpen(false)}
			/>
		</PageScaffold>
	)
}
