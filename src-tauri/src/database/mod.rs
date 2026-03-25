pub mod connection;
pub mod migrations;

use tauri::AppHandle;

use crate::app::errors::AppError;
use crate::services::settings_service;

pub fn initialize_database(app: &AppHandle) -> Result<(), AppError> {
    let mut connection = connection::open_app_database(app)?;
    migrations::apply(&mut connection)?;
    settings_service::ensure_default_settings(&connection, app)?;
    Ok(())
}
