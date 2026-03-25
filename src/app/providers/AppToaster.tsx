import { useEffect } from 'react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { useAppStore } from '@/stores/app-store'

export function AppToaster() {
	const toasts = useAppStore((state) => state.toasts)
	const dismissToast = useAppStore((state) => state.dismissToast)

	useEffect(() => {
		for (const item of toasts) {
			toast(item.title, {
				id: item.id,
				description: item.description,
			})
			dismissToast(item.id)
		}
	}, [dismissToast, toasts])

	return (
		<Toaster
			position='bottom-right'
			richColors
			closeButton
		/>
	)
}
