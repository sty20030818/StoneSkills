export const NAV_ITEMS = [
	{
		to: '/skills',
		label: '我的 Skills',
		description: '默认首页与治理工作台',
		badge: 'SK',
	},
	{
		to: '/install',
		label: '安装 / 导入',
		description: '导入来源、检测预览与安装确认',
		badge: 'IN',
	},
	{
		to: '/tools',
		label: 'AI 工具',
		description: '环境概览、工具连接与轻量修复',
		badge: 'AI',
	},
	{
		to: '/settings',
		label: '设置',
		description: '长期偏好与开发诊断入口',
		badge: 'ST',
	},
] as const
