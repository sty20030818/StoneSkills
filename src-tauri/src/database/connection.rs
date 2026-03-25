use std::path::Path;

use rusqlite::Connection;
use tauri::AppHandle;

use crate::app::errors::AppError;
use crate::services::path_service;

pub fn open_app_database(app: &AppHandle) -> Result<Connection, AppError> {
    let path = path_service::get_database_path(app)?;
    open_connection(path)
}

pub fn open_connection(path: impl AsRef<Path>) -> Result<Connection, AppError> {
    let path = path.as_ref();

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let mut connection = Connection::open(path)?;
    configure_connection(&mut connection)?;

    Ok(connection)
}

pub(crate) fn configure_connection(connection: &mut Connection) -> Result<(), AppError> {
    connection.execute_batch(
        r#"
        PRAGMA foreign_keys = ON;
        PRAGMA journal_mode = WAL;
        PRAGMA synchronous = NORMAL;
        "#,
    )?;

    Ok(())
}
