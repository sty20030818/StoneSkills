use tauri::AppHandle;

use crate::models::{dto::{AppPathsDto, SystemInfoDto}, result::ApiResponse};
use crate::services::{path_service, system_service};

#[tauri::command]
pub fn get_system_info(app: AppHandle) -> ApiResponse<SystemInfoDto> {
    ApiResponse::success(system_service::get_system_info(&app))
}

#[tauri::command]
pub fn get_app_paths(app: AppHandle) -> ApiResponse<AppPathsDto> {
    match path_service::get_app_paths(&app) {
        Ok(paths) => ApiResponse::success(paths),
        Err(error) => ApiResponse::failure(error),
    }
}
