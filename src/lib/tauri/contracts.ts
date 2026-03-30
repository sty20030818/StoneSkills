export interface CommandError {
	code: string
	message: string
	details?: string | null
	recoverable: boolean
}

export interface CommandResponse<T> {
	ok: boolean
	data: T | null
	error: CommandError | null
}

export interface SystemInfo {
	platform: string
	platformLabel: string
	arch: string
	appVersion: string
}

export interface AppPaths {
	appDataDir: string
	appLogDir: string
	suggestedRepositoryDir: string
}

export interface BootstrapPayload {
	system: SystemInfo
	paths: AppPaths
	launchedAt: string
}

export interface SkillSource {
	id: string
	sourceType: string
	sourceUrl: string | null
	sourceRef: string | null
	sourceCommit: string | null
	sourceSubpath: string | null
	isPrimary: boolean
}

export interface SkillTargetSupport {
	targetKey: string
	supportLevel: string
}

export interface Skill {
	id: string
	slug: string
	name: string
	version: string
	description: string | null
	author: string | null
	localPath: string
	icon: string | null
	readmePath: string | null
	installMethod: string
	checksum: string | null
	status: string
	extraMetadataJson: string | null
	tags: string[]
	sources: SkillSource[]
	supportedTargets: SkillTargetSupport[]
	createdAt: number
	updatedAt: number
	lastCheckedAt: number | null
}

export interface Target {
	id: string
	key: string
	name: string
	platform: string | null
	detectStatus: 'unknown' | 'detected' | 'missing' | 'unsupported'
	installPath: string | null
	adapterType: string | null
	enableModes: string[]
	healthStatus: 'healthy' | 'warning' | 'broken'
	lastDetectedAt: number | null
	createdAt: number
	updatedAt: number
}

export interface Installation {
	id: string
	skillId: string
	targetId: string
	installMode: string
	targetPath: string
	installedVersion: string
	status: string
	lastError: string | null
	createdAt: number
	updatedAt: number
}

export interface AppSettingsSnapshot {
	repositoryRoot: string | null
	defaultInstallMode: string | null
	autoCheckUpdates: boolean | null
	githubToken: string | null
	scanPaths: string[]
	logLevel: string | null
	recentGithubRepositories: string[]
}

export interface AppSetting {
	key: string
	valueJson: unknown
	updatedAt: number
}

export interface RepositoryStatus {
	rootPath: string
	status: 'healthy' | 'warning' | 'broken'
	missingDirectories: string[]
	writable: boolean
	message: string | null
}

export interface SkillImportCandidate {
	relativePath: string
	slug: string
	name: string
	description: string | null
	author: string | null
	version: string
	readmePath: string | null
	missingFields: string[]
	conflicts: string[]
}

export interface SkillImportPreview {
	sourceType: 'github' | 'local'
	sourceLabel: string
	candidates: SkillImportCandidate[]
}

export interface LogWritePayload {
	logFilePath: string
	lineCount: number
}

export type TaskStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface TaskEventPayload {
	taskId: string
	status: TaskStatus
	label: string
	progress: number
	message: string
	timestamp: string
}
