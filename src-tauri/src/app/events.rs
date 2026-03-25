use tauri::{AppHandle, Emitter};

use crate::models::dto::TaskEventPayload;

pub const APP_READY_EVENT: &str = "app:ready";
pub const TASK_PROGRESS_EVENT: &str = "task:progress";
pub const TASK_COMPLETED_EVENT: &str = "task:completed";
pub const TASK_FAILED_EVENT: &str = "task:failed";

pub fn emit_app_ready(app: &AppHandle, payload: serde_json::Value) {
    let _ = app.emit(APP_READY_EVENT, payload);
}

pub fn emit_task_progress(app: &AppHandle, payload: &TaskEventPayload) {
    let _ = app.emit(TASK_PROGRESS_EVENT, payload);
}

pub fn emit_task_completed(app: &AppHandle, payload: &TaskEventPayload) {
    let _ = app.emit(TASK_COMPLETED_EVENT, payload);
}

#[allow(dead_code)]
pub fn emit_task_failed(app: &AppHandle, payload: &TaskEventPayload) {
    let _ = app.emit(TASK_FAILED_EVENT, payload);
}
