import type { SkillImportCandidate } from '@/lib/tauri/contracts'
import { CheckIcon } from '@/components/ui/check'
import { cn } from '@/lib/utils'

interface GithubImportCandidateCardProps {
	candidate: SkillImportCandidate
	selected: boolean
	disabled: boolean
	installing: boolean
	reasonText: string | null
	onToggle: () => void
}

export function GithubImportCandidateCard({
	candidate,
	selected,
	disabled,
	installing,
	reasonText,
	onToggle,
}: GithubImportCandidateCardProps) {
	const cardKey = candidate.relativePath || candidate.slug

	return (
		<button
			type='button'
			data-testid={`github-import-candidate-card-${cardKey}`}
			aria-pressed={disabled ? undefined : selected}
			aria-disabled={disabled}
			disabled={disabled || installing}
			onClick={onToggle}
			className={cn(
				'grid w-full gap-3 rounded-[1.5rem] border bg-white p-5 text-left transition-all',
				disabled
					? 'cursor-not-allowed border-border/60 bg-muted/25 text-muted-foreground opacity-70'
					: 'cursor-pointer border-border/70 hover:border-primary/35 hover:bg-primary/4',
				selected
					? 'border-primary bg-primary/6 shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-primary)_24%,transparent)]'
					: '',
			)}>
			<div className='flex items-start justify-between gap-3'>
				<div className='space-y-2'>
					<h3 className='line-clamp-1 text-lg font-semibold tracking-[-0.03em] text-foreground'>{candidate.name}</h3>
					<p
						className={cn(
							'line-clamp-3 text-sm leading-6',
							disabled ? 'text-muted-foreground' : 'text-muted-foreground',
						)}>
						{candidate.description ?? '当前候选项缺少描述信息。'}
					</p>
				</div>
				<span
					data-testid={`github-import-selection-indicator-${cardKey}`}
					className={cn(
						'mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors',
						disabled
							? 'border-border/70 bg-transparent'
							: selected
								? 'border-primary bg-primary'
								: 'border-border/80 bg-white',
					)}>
					{selected && !disabled ? (
						<CheckIcon
							data-testid={`github-import-selection-check-${cardKey}`}
							className='text-white'
							size={12}
						/>
					) : null}
				</span>
			</div>
			{reasonText ? <p className='text-sm leading-6 text-muted-foreground'>{`不可安装：${reasonText}`}</p> : null}
		</button>
	)
}
