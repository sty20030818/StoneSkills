import { fireEvent, render, screen } from '@testing-library/react'
import React, { useImperativeHandle } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

const startAnimation = vi.fn()
const stopAnimation = vi.fn()

vi.mock('@/lib/constants/navigation', () => {
	const MockIcon = React.forwardRef(function MockIcon(
		props: React.HTMLAttributes<HTMLDivElement>,
		ref,
	) {
		useImperativeHandle(ref, () => ({
			startAnimation,
			stopAnimation,
		}))

		return (
			<div
				data-testid='mock-nav-icon'
				className={props.className}
			/>
		)
	})

	return {
		NAV_ITEMS: [
			{
				to: '/skills',
				label: '我的 Skills',
				icon: MockIcon,
			},
			{
				to: '/install',
				label: '安装 / 导入',
				icon: MockIcon,
			},
		],
	}
})

import { Sidebar } from '@/app/layout/Sidebar'

describe('Sidebar', () => {
	it('导航岛与主岛同色，图标无背景，并在整项 hover 时触发图标动画', () => {
		render(
			<MemoryRouter initialEntries={['/skills']}>
				<Sidebar />
			</MemoryRouter>,
		)

		const sidebar = screen.getByTestId('app-sidebar')
		const activeLink = screen.getByRole('link', { name: '我的 Skills' })
		const idleLink = screen.getByRole('link', { name: '安装 / 导入' })
		const icons = screen.getAllByTestId('mock-nav-icon')

		expect(sidebar).toHaveClass('bg-(--shell-panel-bg)')
		expect(activeLink).toHaveClass('min-h-12')
		expect(activeLink).toHaveClass('text-primary')
		expect(icons[0]).toHaveClass('group-aria-current-page:text-primary')
		expect(icons[0]?.parentElement).not.toHaveClass('bg-(--shell-sidebar-icon-bg)')
		expect(icons[0]?.parentElement).not.toHaveClass('border-(--shell-border-subtle)')

		fireEvent.mouseEnter(idleLink)
		expect(startAnimation).toHaveBeenCalledTimes(1)

		fireEvent.mouseLeave(idleLink)
		expect(stopAnimation).toHaveBeenCalledTimes(1)
	})
})
