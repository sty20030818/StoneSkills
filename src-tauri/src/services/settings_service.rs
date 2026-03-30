use tauri::AppHandle;

use crate::app::errors::AppError;
use crate::models::domain::{AppSettingsSnapshot, InstallMode};
use crate::models::dto::SetAppSettingInputDto;
use crate::repositories::settings_repository;
use crate::services::repository_service;

pub const REPOSITORY_ROOT_KEY: &str = "repository_root";
pub const DEFAULT_INSTALL_MODE_KEY: &str = "default_install_mode";
pub const AUTO_CHECK_UPDATES_KEY: &str = "auto_check_updates";
pub const GITHUB_TOKEN_KEY: &str = "github_token";
pub const SCAN_PATHS_KEY: &str = "scan_paths";
pub const LOG_LEVEL_KEY: &str = "log_level";
pub const RECENT_GITHUB_REPOSITORIES_KEY: &str = "recent_github_repositories";

pub fn ensure_default_settings(
    connection: &rusqlite::Connection,
    app: &AppHandle,
) -> Result<(), AppError> {
    let now = crate::services::registry_service::now_ts();
    let repository_root = repository_service::default_repository_root(app)?;

    settings_repository::set_setting_if_missing(
        connection,
        REPOSITORY_ROOT_KEY,
        &serde_json::Value::String(repository_root.display().to_string()),
        now,
    )?;
    settings_repository::set_setting_if_missing(
        connection,
        DEFAULT_INSTALL_MODE_KEY,
        &serde_json::Value::String("link".to_string()),
        now,
    )?;
    settings_repository::set_setting_if_missing(
        connection,
        AUTO_CHECK_UPDATES_KEY,
        &serde_json::Value::Bool(true),
        now,
    )?;
    settings_repository::set_setting_if_missing(
        connection,
        SCAN_PATHS_KEY,
        &serde_json::Value::Array(vec![]),
        now,
    )?;
    settings_repository::set_setting_if_missing(
        connection,
        LOG_LEVEL_KEY,
        &serde_json::Value::String("info".to_string()),
        now,
    )?;
    settings_repository::set_setting_if_missing(
        connection,
        RECENT_GITHUB_REPOSITORIES_KEY,
        &serde_json::Value::Array(vec![]),
        now,
    )?;

    Ok(())
}

pub fn get_settings_snapshot(
    connection: &rusqlite::Connection,
) -> Result<AppSettingsSnapshot, AppError> {
    Ok(AppSettingsSnapshot {
        repository_root: read_string_setting(connection, REPOSITORY_ROOT_KEY)?,
        default_install_mode: read_string_setting(connection, DEFAULT_INSTALL_MODE_KEY)?
            .map(|value| InstallMode::parse(&value))
            .transpose()?,
        auto_check_updates: read_bool_setting(connection, AUTO_CHECK_UPDATES_KEY)?,
        github_token: read_string_setting(connection, GITHUB_TOKEN_KEY)?,
        scan_paths: read_string_array_setting(connection, SCAN_PATHS_KEY)?.unwrap_or_default(),
        log_level: read_string_setting(connection, LOG_LEVEL_KEY)?,
        recent_github_repositories: read_string_array_setting(connection, RECENT_GITHUB_REPOSITORIES_KEY)?
            .unwrap_or_default(),
    })
}

pub fn set_setting(
    connection: &rusqlite::Connection,
    input: SetAppSettingInputDto,
) -> Result<crate::models::domain::AppSettingRecord, AppError> {
    settings_repository::set_setting(
        connection,
        &input.key,
        &input.value_json,
        crate::services::registry_service::now_ts(),
    )
}

fn read_string_setting(
    connection: &rusqlite::Connection,
    key: &str,
) -> Result<Option<String>, AppError> {
    settings_repository::get_setting(connection, key)?
        .map(|record| match record.value_json {
            serde_json::Value::String(value) => Ok(value),
            other => Err(AppError::new(
                "db/serialization-failed",
                "设置项类型不符合预期",
                Some(format!("{key}: {other}")),
                true,
            )),
        })
        .transpose()
}

fn read_bool_setting(
    connection: &rusqlite::Connection,
    key: &str,
) -> Result<Option<bool>, AppError> {
    settings_repository::get_setting(connection, key)?
        .map(|record| match record.value_json {
            serde_json::Value::Bool(value) => Ok(value),
            other => Err(AppError::new(
                "db/serialization-failed",
                "设置项类型不符合预期",
                Some(format!("{key}: {other}")),
                true,
            )),
        })
        .transpose()
}

fn read_string_array_setting(
    connection: &rusqlite::Connection,
    key: &str,
) -> Result<Option<Vec<String>>, AppError> {
    settings_repository::get_setting(connection, key)?
        .map(|record| match record.value_json {
            serde_json::Value::Array(values) => values
                .into_iter()
                .map(|value| match value {
                    serde_json::Value::String(item) => Ok(item),
                    other => Err(AppError::new(
                        "db/serialization-failed",
                        "设置项数组类型不符合预期",
                        Some(format!("{key}: {other}")),
                        true,
                    )),
                })
                .collect::<Result<Vec<_>, _>>(),
            other => Err(AppError::new(
                "db/serialization-failed",
                "设置项类型不符合预期",
                Some(format!("{key}: {other}")),
                true,
            )),
        })
        .transpose()
}
