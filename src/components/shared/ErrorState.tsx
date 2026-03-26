import type { CommandError } from '@/lib/tauri/contracts'
import { Button } from '@/components/ui/button'
import { BadgeAlertIcon } from '@/components/ui/badge-alert'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export function ErrorState({
	title = '出现可恢复异常',
	error,
	onRetry,
}: {
	title?: string
	error: CommandError
	onRetry?: () => void
}) {
	return (
		<Alert
			variant='destructive'
			className='gap-3'>
			<div
				data-slot='alert-icon'
				className='inline-flex items-center justify-center'>
				<BadgeAlertIcon size={16} />
			</div>
			<AlertTitle>{title}</AlertTitle>
			<AlertDescription className='flex flex-col gap-3'>
				<p>{error.message}</p>
				{error.details ? <p className='text-xs leading-5 opacity-80'>{error.details}</p> : null}
				{onRetry ? (
					<div>
						<Button
							variant='outline'
							onClick={onRetry}>
							重新尝试
						</Button>
					</div>
				) : null}
			</AlertDescription>
		</Alert>
	)
}
