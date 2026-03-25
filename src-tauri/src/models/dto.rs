use serde::Serialize;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfoDto {
    pub platform: String,
    pub platform_label: String,
    pub arch: String,
    pub app_version: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppPathsDto {
    pub app_data_dir: String,
    pub app_log_dir: String,
    pub suggested_repository_dir: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapPayloadDto {
    pub system: SystemInfoDto,
    pub paths: AppPathsDto,
    pub launched_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogWritePayloadDto {
    pub log_file_path: String,
    pub line_count: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DemoTaskAckDto {
    pub task_id: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskEventPayload {
    pub task_id: String,
    pub status: String,
    pub label: String,
    pub progress: u8,
    pub message: String,
    pub timestamp: String,
}
