import { invoke } from '@tauri-apps/api/core'
import type {
	AppPaths,
	AppSetting,
	AppSettingsSnapshot,
	BootstrapPayload,
	CommandResponse,
	Installation,
	LogWritePayload,
	RepositoryStatus,
	Skill,
	SystemInfo,
	Target,
} from '@/lib/tauri/contracts'
import { TauriCommandError } from '@/lib/tauri/errors'

async function callCommand<T>(command: string, args?: Record<string, unknown>): Promise<T> {
	const response = await invoke<CommandResponse<T>>(command, args)

	if (!response.ok || !response.data) {
		throw new TauriCommandError(
			response.error ?? {
				code: 'backend/empty-response',
				message: `命令 ${command} 返回空结果`,
				details: null,
				recoverable: true,
			},
		)
	}

	return response.data
}

export function bootstrapApp() {
	return callCommand<BootstrapPayload>('bootstrap_app')
}

export function getSystemInfo() {
	return callCommand<SystemInfo>('get_system_info')
}

export function getAppPaths() {
	return callCommand<AppPaths>('get_app_paths')
}

export function writeTestLog() {
	return callCommand<LogWritePayload>('write_test_log')
}

export function startDemoTask() {
	return callCommand<{ taskId: string }>('start_demo_task')
}

export function listSkills() {
	return callCommand<Skill[]>('list_skills')
}

export function listTargets() {
	return callCommand<Target[]>('list_targets')
}

export function listInstallations() {
	return callCommand<Installation[]>('list_installations')
}

export function getAppSettingsSnapshot() {
	return callCommand<AppSettingsSnapshot>('get_app_settings_snapshot')
}

export function getRepositoryStatus() {
	return callCommand<RepositoryStatus>('get_repository_status')
}

export function repairRepository() {
	return callCommand<RepositoryStatus>('repair_repository')
}

export function setAppSetting(key: string, valueJson: unknown) {
	return callCommand<AppSetting>('set_app_setting', {
		input: {
			key,
			valueJson,
		},
	})
}
