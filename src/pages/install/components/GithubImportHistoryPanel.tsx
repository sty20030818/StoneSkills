import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface GithubImportHistoryPanelProps {
	repositories: string[]
	disabled: boolean
	onSelect: (repository: string) => void
}

export function GithubImportHistoryPanel({
	repositories,
	disabled,
	onSelect,
}: GithubImportHistoryPanelProps) {
	return (
		<Card
			data-testid='github-import-history-card'
			className='min-h-0 flex-1 rounded-[1.9rem] border-border/70 bg-white shadow-none'>
			<CardContent className='flex min-h-0 flex-1 flex-col gap-3 pt-1'>
				<div className='shrink-0 px-1'>
					<h3 className='text-base font-semibold tracking-[-0.03em] text-foreground'>历史仓库</h3>
				</div>
				<div
					data-testid='github-import-history-list-shell'
					aria-busy={disabled}
					className={cn(
						'scrollbar-hidden min-h-0 flex-1 overflow-y-auto pb-1',
						disabled ? 'pointer-events-none opacity-60' : '',
					)}>
					<div className='grid gap-3'>
						{repositories.length > 0 ? (
							repositories.map((repository) => (
								<button
									key={repository}
									type='button'
									disabled={disabled}
									onClick={() => onSelect(repository)}
									className='line-clamp-1 w-full rounded-[1.35rem] border border-border/70 bg-white px-4 py-4 text-left text-sm text-foreground transition-colors hover:border-primary/35 hover:bg-primary/4'>
									{repository}
								</button>
							))
						) : (
							<div className='rounded-[1.35rem] border border-dashed border-border/70 px-4 py-6 text-sm text-muted-foreground'>
								暂无历史仓库，成功识别过的 GitHub 仓库会出现在这里。
							</div>
						)}
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
