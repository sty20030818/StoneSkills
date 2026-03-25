import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AppRouter } from '@/app/router/AppRouter'

describe('AppRouter', () => {
	it('会把根路径重定向到总览页', async () => {
		render(
			<MemoryRouter initialEntries={['/']}>
				<AppRouter />
			</MemoryRouter>,
		)

		expect(
			await screen.findByRole('heading', {
				level: 1,
				name: '把桌面骨架先做硬，再让业务能力长出来。',
			}),
		).toBeInTheDocument()
	})
})
