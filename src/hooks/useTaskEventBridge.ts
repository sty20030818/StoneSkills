import { useEffect } from 'react'
import { listenTaskEvents } from '@/lib/tauri/events'
import { useAppStore } from '@/stores/app-store'

export function useTaskEventBridge() {
	const upsertTaskEvent = useAppStore((state) => state.upsertTaskEvent)
	const pushToast = useAppStore((state) => state.pushToast)

	useEffect(() => {
		let cleanup: (() => void) | null = null

		const setup = async () => {
			cleanup = await listenTaskEvents((payload) => {
				upsertTaskEvent(payload)

				if (payload.status === 'completed' || payload.status === 'failed') {
					pushToast({
						title: payload.label,
						description: payload.message,
					})
				}
			})
		}

		void setup()

		return () => {
			cleanup?.()
		}
	}, [pushToast, upsertTaskEvent])
}
