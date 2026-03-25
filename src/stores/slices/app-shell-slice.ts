export interface ToastItem {
	id: string
	title: string
	description: string
}

export interface AppShellSlice {
	sidebarCollapsed: boolean
	toasts: ToastItem[]
	toggleSidebar: () => void
	pushToast: (input: Omit<ToastItem, 'id'>) => void
	dismissToast: (id: string) => void
}

export const createAppShellSlice = (set: SetStore<AppShellSlice>) => ({
	sidebarCollapsed: false,
	toasts: [] as ToastItem[],
	toggleSidebar: () =>
		set((state) => ({
			sidebarCollapsed: !state.sidebarCollapsed,
		})),
	pushToast: (input: Omit<ToastItem, 'id'>) =>
		set((state) => ({
			toasts: [
				...state.toasts,
				{
					id: crypto.randomUUID(),
					...input,
				},
			].slice(-4),
		})),
	dismissToast: (id: string) =>
		set((state) => ({
			toasts: state.toasts.filter((toast) => toast.id !== id),
		})),
})
