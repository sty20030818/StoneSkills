import { render, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { AppProviders } from '@/app/providers/AppProviders'

vi.mock('@/hooks/useAppBootstrap', () => ({
	useAppBootstrap: () => undefined,
}))

vi.mock('@/hooks/useTaskEventBridge', () => ({
	useTaskEventBridge: () => undefined,
}))

describe('AppProviders', () => {
	const originalMatchMedia = window.matchMedia

	beforeEach(() => {
		document.documentElement.classList.remove('dark')
		document.documentElement.removeAttribute('data-theme')
	})

	afterEach(() => {
		window.matchMedia = originalMatchMedia
	})

	it('会根据系统主题偏好同步深色模式 class', async () => {
		window.matchMedia = vi.fn().mockImplementation((query: string) => ({
			matches: query === '(prefers-color-scheme: dark)',
			media: query,
			onchange: null,
			addEventListener: vi.fn(),
			removeEventListener: vi.fn(),
			addListener: vi.fn(),
			removeListener: vi.fn(),
			dispatchEvent: vi.fn(),
		})) as typeof window.matchMedia

		render(<AppProviders />)

		await waitFor(() => {
			expect(document.documentElement.classList.contains('dark')).toBe(true)
			expect(document.documentElement.dataset.theme).toBe('dark')
		})
	})
})
