use tauri::{AppHandle, State};

use crate::app::state::AppState;
use crate::models::{dto::LogWritePayloadDto, result::ApiResponse};
use crate::services::log_service;

#[tauri::command]
pub fn write_test_log(
    app: AppHandle,
    state: State<'_, AppState>,
) -> ApiResponse<LogWritePayloadDto> {
    let next_count = {
        let mut count = match state.log_line_count.lock() {
            Ok(lock) => lock,
            Err(_) => {
                return ApiResponse::failure(crate::app::errors::AppError::new(
                    "logs/state-lock",
                    "日志状态锁不可用",
                    None,
                    true,
                ))
            }
        };
        *count += 1;
        *count
    };

    match log_service::write_test_log(&app, next_count) {
        Ok(result) => ApiResponse::success(result),
        Err(error) => ApiResponse::failure(error),
    }
}
