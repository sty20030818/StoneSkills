use std::fs::OpenOptions;
use std::io::Write;
use std::path::PathBuf;

use tauri::AppHandle;

use crate::app::errors::AppError;
use crate::models::dto::{AppPathsDto, LogWritePayloadDto};
use crate::services::{fs_service, path_service};

pub fn write_test_log(
    app: &AppHandle,
    line_count: u64,
) -> Result<LogWritePayloadDto, AppError> {
    let paths = path_service::get_app_paths(app)?;
    let log_dir = fs_service::ensure_dir(paths.app_log_dir.clone())?;
    let log_file_path = ensure_log_file(log_dir)?;
    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .open(&log_file_path)?;
    let line = format!("StoneSkills bootstrap log line #{line_count}\n");
    file.write_all(line.as_bytes())?;

    Ok(LogWritePayloadDto {
        log_file_path: log_file_path.display().to_string(),
        line_count,
    })
}

pub fn snapshot_paths(app: &AppHandle) -> Result<AppPathsDto, AppError> {
    path_service::get_app_paths(app)
}

fn ensure_log_file(log_dir: PathBuf) -> Result<PathBuf, AppError> {
    let path = log_dir.join("stoneskills.log");
    if !path.exists() {
        let _ = OpenOptions::new().create(true).write(true).open(&path)?;
    }
    Ok(path)
}
