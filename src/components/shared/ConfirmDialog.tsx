import type { PropsWithChildren } from 'react'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface ConfirmDialogProps extends PropsWithChildren {
	open: boolean
	title: string
	description: string
	confirmLabel?: string
	cancelLabel?: string
	onConfirm?: () => void
	onCancel: () => void
}

export function ConfirmDialog({
	open,
	title,
	description,
	children,
	confirmLabel = '确认',
	cancelLabel = '取消',
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	if (!open) {
		return null
	}

	return (
		<AlertDialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					onCancel()
				}
			}}>
			<AlertDialogContent className='max-w-md'>
				<AlertDialogHeader className='items-start text-left'>
					<div className='rounded-full border border-warning-border bg-warning-bg px-2.5 py-1 text-[11px] font-medium tracking-[0.14em] text-warning uppercase'>
						危险操作预留
					</div>
					<AlertDialogTitle>{title}</AlertDialogTitle>
					<AlertDialogDescription>{description}</AlertDialogDescription>
				</AlertDialogHeader>
				{children ? <div className='text-sm text-muted-foreground'>{children}</div> : null}
				<AlertDialogFooter>
					<AlertDialogCancel onClick={onCancel}>{cancelLabel}</AlertDialogCancel>
					<AlertDialogAction onClick={onConfirm}>{confirmLabel}</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	)
}
