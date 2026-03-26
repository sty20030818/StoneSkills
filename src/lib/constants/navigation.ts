import type { ForwardRefExoticComponent, HTMLAttributes, RefAttributes } from 'react'
import { BoxIcon } from '@/components/ui/box'
import { DownloadIcon } from '@/components/ui/download'
import { HammerIcon } from '@/components/ui/hammer'
import { SettingsIcon } from '@/components/ui/settings'

export interface AnimatedIconHandle {
	startAnimation: () => void
	stopAnimation: () => void
}

type AnimatedIconComponent = ForwardRefExoticComponent<
	HTMLAttributes<HTMLDivElement> & {
		size?: number
	} & RefAttributes<AnimatedIconHandle>
>

export interface NavItem {
	to: string
	label: string
	icon: AnimatedIconComponent
}

export const NAV_ITEMS = [
	{
		to: '/skills',
		label: '我的 Skills',
		icon: BoxIcon,
	},
	{
		to: '/install',
		label: '安装 / 导入',
		icon: DownloadIcon,
	},
	{
		to: '/tools',
		label: 'AI 工具',
		icon: HammerIcon,
	},
	{
		to: '/settings',
		label: '设置',
		icon: SettingsIcon,
	},
] as const satisfies NavItem[]
