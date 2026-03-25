use rusqlite::{params, Connection, OptionalExtension};

use crate::app::errors::AppError;
use crate::models::domain::AppSettingRecord;

pub fn set_setting(
    connection: &Connection,
    key: &str,
    value_json: &serde_json::Value,
    updated_at: i64,
) -> Result<AppSettingRecord, AppError> {
    let value_string = serde_json::to_string(value_json)?;

    connection.execute(
        r#"
        INSERT INTO app_settings (key, value_json, updated_at)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(key) DO UPDATE SET
            value_json = excluded.value_json,
            updated_at = excluded.updated_at
        "#,
        params![key, value_string, updated_at],
    )?;

    get_setting(connection, key)?.ok_or_else(|| {
        AppError::new(
            "db/not-found",
            "设置项写入后未能读取回显",
            Some(key.to_string()),
            true,
        )
    })
}

pub fn set_setting_if_missing(
    connection: &Connection,
    key: &str,
    value_json: &serde_json::Value,
    updated_at: i64,
) -> Result<(), AppError> {
    let value_string = serde_json::to_string(value_json)?;

    connection.execute(
        r#"
        INSERT INTO app_settings (key, value_json, updated_at)
        VALUES (?1, ?2, ?3)
        ON CONFLICT(key) DO NOTHING
        "#,
        params![key, value_string, updated_at],
    )?;

    Ok(())
}

pub fn get_setting(connection: &Connection, key: &str) -> Result<Option<AppSettingRecord>, AppError> {
    connection
        .query_row(
            "SELECT key, value_json, updated_at FROM app_settings WHERE key = ?1",
            params![key],
            |row| {
                let value_json_raw: String = row.get(1)?;

                Ok(AppSettingRecord {
                    key: row.get(0)?,
                    value_json: serde_json::from_str(&value_json_raw).map_err(|error| {
                        rusqlite::Error::FromSqlConversionFailure(
                            value_json_raw.len(),
                            rusqlite::types::Type::Text,
                            Box::new(error),
                        )
                    })?,
                    updated_at: row.get(2)?,
                })
            },
        )
        .optional()
        .map_err(Into::into)
}
