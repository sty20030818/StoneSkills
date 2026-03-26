import { useEffect, useState } from 'react'

export type ResolvedTheme = 'light' | 'dark'

function readSystemTheme(): ResolvedTheme {
	if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
		return 'light'
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useResolvedTheme() {
	const [theme, setTheme] = useState<ResolvedTheme>(() => readSystemTheme())

	useEffect(() => {
		if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
			return
		}

		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
		const updateTheme = (matches: boolean) => {
			setTheme(matches ? 'dark' : 'light')
		}

		updateTheme(mediaQuery.matches)

		const handleChange = (event: MediaQueryListEvent) => {
			updateTheme(event.matches)
		}

		if (typeof mediaQuery.addEventListener === 'function') {
			mediaQuery.addEventListener('change', handleChange)

			return () => {
				mediaQuery.removeEventListener('change', handleChange)
			}
		}

		mediaQuery.addListener(handleChange)

		return () => {
			mediaQuery.removeListener(handleChange)
		}
	}, [])

	return theme
}
