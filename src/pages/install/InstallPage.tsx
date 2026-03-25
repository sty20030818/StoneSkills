import { PageScaffold } from '@/components/shared/PageScaffold'
import { EmptyState } from '@/components/shared/EmptyState'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function InstallPage() {
	return (
		<PageScaffold
			eyebrow='Import Channels'
			title='安装入口只有一个，但来源和后续动作会被统一编排。'
			description='这里会承接 GitHub 安装、本地导入和扫描导入三条路径。当前先把页面骨架和信息层级固定下来。'>
			<section className='grid gap-4 2xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.95fr)]'>
				<EmptyState
					title='安装向导待接入'
					description='下一阶段会把元数据预览、冲突提示、安装方式和立即启用入口放在这里。'
				/>
				<Card className='border-border/70 shadow-sm'>
					<CardHeader>
						<CardTitle>Flow Notes</CardTitle>
						<CardDescription>三条安装入口最终都会汇入同一套确认流。</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{[
							['GitHub', '仓库解析、结构识别、版本绑定。'],
							['本地目录', '复制或引用原目录，必要时补齐最小元数据。'],
							['扫描导入', '常见目录与自定义路径统一纳入确认流。'],
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
		</PageScaffold>
	)
}
