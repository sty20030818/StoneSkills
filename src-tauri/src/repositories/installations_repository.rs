use rusqlite::{params, Connection};

use crate::app::errors::AppError;
use crate::models::domain::{InstallationRecord, InstallationStatus, InstallMode};

pub fn upsert_installation(
    connection: &Connection,
    installation: &InstallationRecord,
) -> Result<InstallationRecord, AppError> {
    connection.execute(
        r#"
        INSERT INTO installations (
            id, skill_id, target_id, install_mode, target_path, installed_version,
            status, last_error, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
        ON CONFLICT(skill_id, target_id) DO UPDATE SET
            install_mode = excluded.install_mode,
            target_path = excluded.target_path,
            installed_version = excluded.installed_version,
            status = excluded.status,
            last_error = excluded.last_error,
            updated_at = excluded.updated_at
        "#,
        params![
            installation.id,
            installation.skill_id,
            installation.target_id,
            installation.install_mode.as_str(),
            installation.target_path,
            installation.installed_version,
            installation.status.as_str(),
            installation.last_error,
            installation.created_at,
            installation.updated_at,
        ],
    )?;

    list_installations(connection)?
        .into_iter()
        .find(|item| item.skill_id == installation.skill_id && item.target_id == installation.target_id)
        .ok_or_else(|| {
            AppError::new(
                "db/not-found",
                "安装关系写入后未能读取回显",
                Some(format!("{}:{}", installation.skill_id, installation.target_id)),
                true,
            )
        })
}

pub fn list_installations(connection: &Connection) -> Result<Vec<InstallationRecord>, AppError> {
    let mut statement = connection.prepare(
        r#"
        SELECT
            id, skill_id, target_id, install_mode, target_path, installed_version,
            status, last_error, created_at, updated_at
        FROM installations
        ORDER BY updated_at DESC
        "#,
    )?;

    let iter = statement.query_map([], |row| {
        Ok(InstallationRecord {
            id: row.get(0)?,
            skill_id: row.get(1)?,
            target_id: row.get(2)?,
            install_mode: InstallMode::parse(row.get::<_, String>(3)?.as_str()).map_err(
                |error| {
                    rusqlite::Error::FromSqlConversionFailure(
                        3,
                        rusqlite::types::Type::Text,
                        Box::new(error),
                    )
                },
            )?,
            target_path: row.get(4)?,
            installed_version: row.get(5)?,
            status: InstallationStatus::parse(row.get::<_, String>(6)?.as_str()).map_err(
                |error| {
                    rusqlite::Error::FromSqlConversionFailure(
                        6,
                        rusqlite::types::Type::Text,
                        Box::new(error),
                    )
                },
            )?,
            last_error: row.get(7)?,
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
        })
    })?;

    iter.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}
