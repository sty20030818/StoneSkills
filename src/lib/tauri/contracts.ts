export interface CommandError {
  code: string;
  message: string;
  details?: string | null;
  recoverable: boolean;
}

export interface CommandResponse<T> {
  ok: boolean;
  data: T | null;
  error: CommandError | null;
}

export interface SystemInfo {
  platform: string;
  platformLabel: string;
  arch: string;
  appVersion: string;
}

export interface AppPaths {
  appDataDir: string;
  appLogDir: string;
  suggestedRepositoryDir: string;
}

export interface BootstrapPayload {
  system: SystemInfo;
  paths: AppPaths;
  launchedAt: string;
}

export interface LogWritePayload {
  logFilePath: string;
  lineCount: number;
}

export type TaskStatus =
  | "queued"
  | "running"
  | "completed"
  | "failed";

export interface TaskEventPayload {
  taskId: string;
  status: TaskStatus;
  label: string;
  progress: number;
  message: string;
  timestamp: string;
}
