use rusqlite::{params, Connection};

use crate::app::errors::AppError;
use crate::models::domain::{DetectStatus, HealthStatus, TargetRecord};

pub fn upsert_target(connection: &Connection, target: &TargetRecord) -> Result<TargetRecord, AppError> {
    connection.execute(
        r#"
        INSERT INTO targets (
            id, key, name, platform, detect_status, install_path, adapter_type,
            enable_modes_json, health_status, last_detected_at, created_at, updated_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
        ON CONFLICT(key) DO UPDATE SET
            name = excluded.name,
            platform = excluded.platform,
            detect_status = excluded.detect_status,
            install_path = excluded.install_path,
            adapter_type = excluded.adapter_type,
            enable_modes_json = excluded.enable_modes_json,
            health_status = excluded.health_status,
            last_detected_at = excluded.last_detected_at,
            updated_at = excluded.updated_at
        "#,
        params![
            target.id,
            target.key,
            target.name,
            target.platform,
            target.detect_status.as_str(),
            target.install_path,
            target.adapter_type,
            serde_json::to_string(&target.enable_modes)?,
            target.health_status.as_str(),
            target.last_detected_at,
            target.created_at,
            target.updated_at,
        ],
    )?;

    list_targets(connection)?
        .into_iter()
        .find(|item| item.key == target.key)
        .ok_or_else(|| AppError::new("db/not-found", "目标工具写入后未能读取回显", Some(target.key.clone()), true))
}

pub fn list_targets(connection: &Connection) -> Result<Vec<TargetRecord>, AppError> {
    let mut statement = connection.prepare(
        r#"
        SELECT
            id, key, name, platform, detect_status, install_path, adapter_type,
            enable_modes_json, health_status, last_detected_at, created_at, updated_at
        FROM targets
        ORDER BY name ASC
        "#,
    )?;

    let iter = statement.query_map([], |row| {
        let enable_modes_json: String = row.get(7)?;

        Ok(TargetRecord {
            id: row.get(0)?,
            key: row.get(1)?,
            name: row.get(2)?,
            platform: row.get(3)?,
            detect_status: DetectStatus::parse(row.get::<_, String>(4)?.as_str()).map_err(
                |error| {
                    rusqlite::Error::FromSqlConversionFailure(
                        4,
                        rusqlite::types::Type::Text,
                        Box::new(error),
                    )
                },
            )?,
            install_path: row.get(5)?,
            adapter_type: row.get(6)?,
            enable_modes: serde_json::from_str(&enable_modes_json).map_err(|error| {
                rusqlite::Error::FromSqlConversionFailure(
                    enable_modes_json.len(),
                    rusqlite::types::Type::Text,
                    Box::new(error),
                )
            })?,
            health_status: HealthStatus::parse(row.get::<_, String>(8)?.as_str()).map_err(
                |error| {
                    rusqlite::Error::FromSqlConversionFailure(
                        8,
                        rusqlite::types::Type::Text,
                        Box::new(error),
                    )
                },
            )?,
            last_detected_at: row.get(9)?,
            created_at: row.get(10)?,
            updated_at: row.get(11)?,
        })
    })?;

    iter.collect::<Result<Vec<_>, _>>().map_err(Into::into)
}
