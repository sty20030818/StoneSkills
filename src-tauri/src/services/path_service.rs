use tauri::{AppHandle, Manager};

use crate::app::errors::AppError;
use crate::models::dto::AppPathsDto;

pub fn get_app_paths(app: &AppHandle) -> Result<AppPathsDto, AppError> {
    let path = app.path();
    let app_data_dir = path
        .app_data_dir()
        .map_err(|error| AppError::new("system/path-app-data", "无法解析应用数据目录", Some(error.to_string()), true))?;
    let app_log_dir = path
        .app_log_dir()
        .map_err(|error| AppError::new("system/path-app-log", "无法解析日志目录", Some(error.to_string()), true))?;
    let suggested_repository_dir = app_data_dir.join("repository");

    Ok(AppPathsDto {
        app_data_dir: app_data_dir.display().to_string(),
        app_log_dir: app_log_dir.display().to_string(),
        suggested_repository_dir: suggested_repository_dir.display().to_string(),
    })
}
