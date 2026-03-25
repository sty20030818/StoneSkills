import { invoke } from "@tauri-apps/api/core";
import type {
  BootstrapPayload,
  CommandResponse,
  LogWritePayload,
  SystemInfo,
  AppPaths,
} from "@/lib/tauri/contracts";
import { TauriCommandError } from "@/lib/tauri/errors";

async function callCommand<T>(
  command: string,
  args?: Record<string, unknown>,
): Promise<T> {
  const response = await invoke<CommandResponse<T>>(command, args);

  if (!response.ok || !response.data) {
    throw new TauriCommandError(
      response.error ?? {
        code: "backend/empty-response",
        message: `命令 ${command} 返回空结果`,
        details: null,
        recoverable: true,
      },
    );
  }

  return response.data;
}

export function bootstrapApp() {
  return callCommand<BootstrapPayload>("bootstrap_app");
}

export function getSystemInfo() {
  return callCommand<SystemInfo>("get_system_info");
}

export function getAppPaths() {
  return callCommand<AppPaths>("get_app_paths");
}

export function writeTestLog() {
  return callCommand<LogWritePayload>("write_test_log");
}

export function startDemoTask() {
  return callCommand<{ taskId: string }>("start_demo_task");
}
