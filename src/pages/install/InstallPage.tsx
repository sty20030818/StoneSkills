import { EmptyState } from '@/components/shared/EmptyState'
import { PageScaffold } from '@/components/shared/PageScaffold'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function InstallPage() {
	return (
		<PageScaffold
			eyebrow='Skill Import Flow'
			title='导入 / 安装'
			description='从 GitHub、本地目录或自动扫描中导入 Skill，并在安装前确认支持范围、依赖和潜在冲突。'>
			<section className='grid gap-4 2xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.9fr)]'>
				<div className='grid gap-4'>
					<Card className='rounded-[1.5rem] bg-card/84'>
						<CardHeader>
							<CardTitle>步骤流</CardTitle>
							<CardDescription>导入流程固定为来源选择、检测预览、安装确认三段。</CardDescription>
						</CardHeader>
						<CardContent className='grid gap-3 md:grid-cols-3'>
							{[
								['Step 1', '选择来源', 'GitHub、本地目录、自动扫描'],
								['Step 2', '检测预览', '名称、版本、工具支持、依赖、冲突'],
								['Step 3', '安装确认', '选择安装方式并返回工作台'],
							].map(([step, title, text]) => (
								<div
									key={step}
									className='rounded-[1.35rem] border border-border/80 bg-muted/38 p-4'>
									<Badge variant='info'>{step}</Badge>
									<strong className='mt-2 block text-sm'>{title}</strong>
									<p className='mt-1 text-sm leading-6 text-muted-foreground'>{text}</p>
								</div>
							))}
						</CardContent>
					</Card>
					<EmptyState
						title='安装向导待接入'
						description='下一阶段会把真实的仓库解析、结构识别、预览检查和确认动作接入这里。'
					/>
				</div>
				<Card className='rounded-[1.5rem] bg-card/84'>
					<CardHeader>
						<CardTitle>来源入口</CardTitle>
						<CardDescription>无论入口从哪里来，最终都会汇入同一套确认流。</CardDescription>
					</CardHeader>
					<CardContent className='flex flex-col gap-3'>
						{[
							['GitHub 仓库', '仓库解析、结构识别、版本绑定与安装预览。'],
							['本地目录', '引用或复制本地 Skill，并补齐最小元数据。'],
							['自动扫描', '扫描常见目录后纳入同一套检测与确认流程。'],
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
			</section>
		</PageScaffold>
	)
}
