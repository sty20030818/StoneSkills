use tauri::{AppHandle, State};
use tokio::time::{sleep, Duration};

use crate::app::{errors::AppError, events, state::AppState};
use crate::database::connection;
use crate::models::{
    dto::{
        AppSettingDto, AppSettingsSnapshotDto, BootstrapPayloadDto, CreateSkillInputDto,
        DeleteAckDto, DemoTaskAckDto, ImportGithubSkillInputDto, ImportLocalSkillInputDto,
        InspectGithubRepositoryInputDto, InspectLocalDirectoryInputDto, InstallationDto,
        RepositoryStatusDto, SetAppSettingInputDto, SkillDto, SkillImportPreviewDto, TargetDto,
        TaskEventPayload, UpdateSkillInputDto, UpsertInstallationInputDto, UpsertTargetInputDto,
    },
    result::ApiResponse,
};
use crate::services::{
    log_service, registry_service, repository_service, settings_service, skill_install_service,
    system_service,
};

#[tauri::command]
pub fn bootstrap_app(
    app: AppHandle,
    state: State<'_, AppState>,
) -> ApiResponse<BootstrapPayloadDto> {
    let system = system_service::get_system_info(&app);
    let paths = match log_service::snapshot_paths(&app) {
        Ok(paths) => paths,
        Err(error) => return ApiResponse::failure(error),
    };

    let payload = BootstrapPayloadDto {
        system,
        paths,
        launched_at: state.launched_at.clone(),
    };

    if let Ok(json) = serde_json::to_value(&payload) {
        events::emit_app_ready(&app, json);
    }

    ApiResponse::success(payload)
}

#[tauri::command]
pub fn start_demo_task(app: AppHandle) -> ApiResponse<DemoTaskAckDto> {
    let task_id = format!(
        "demo-task-{}",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis())
            .unwrap_or(0)
    );
    let ack = DemoTaskAckDto {
        task_id: task_id.clone(),
    };

    tauri::async_runtime::spawn(async move {
        let label = "基础事件桥接演示".to_string();
        let started = TaskEventPayload {
            task_id: task_id.clone(),
            status: "running".into(),
            label: label.clone(),
            progress: 10,
            message: "演示任务已启动，正在验证事件桥接。".into(),
            timestamp: now_string(),
        };
        events::emit_task_progress(&app, &started);

        sleep(Duration::from_millis(350)).await;
        let middle = TaskEventPayload {
            task_id: task_id.clone(),
            status: "running".into(),
            label: label.clone(),
            progress: 68,
            message: "Rust 已经向前端推送中间进度。".into(),
            timestamp: now_string(),
        };
        events::emit_task_progress(&app, &middle);

        sleep(Duration::from_millis(350)).await;
        let completed = TaskEventPayload {
            task_id,
            status: "completed".into(),
            label,
            progress: 100,
            message: "事件链路验证完成，任务中心已经可以接线后续安装/扫描流程。".into(),
            timestamp: now_string(),
        };
        events::emit_task_completed(&app, &completed);
    });

    ApiResponse::success(ack)
}

#[tauri::command]
pub fn list_skills(app: AppHandle) -> ApiResponse<Vec<SkillDto>> {
    let connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match registry_service::list_skills(&connection) {
        Ok(skills) => ApiResponse::success(skills.into_iter().map(Into::into).collect()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn create_skill(app: AppHandle, input: CreateSkillInputDto) -> ApiResponse<SkillDto> {
    let mut connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match registry_service::create_skill(&mut connection, input) {
        Ok(skill) => ApiResponse::success(skill.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn update_skill(app: AppHandle, input: UpdateSkillInputDto) -> ApiResponse<SkillDto> {
    let mut connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match registry_service::update_skill(&mut connection, input) {
        Ok(skill) => ApiResponse::success(skill.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn delete_skill(app: AppHandle, skill_id: String) -> ApiResponse<DeleteAckDto> {
    let mut connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match registry_service::delete_skill(&mut connection, &skill_id) {
        Ok(()) => ApiResponse::success(DeleteAckDto { id: skill_id }),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn list_targets(app: AppHandle) -> ApiResponse<Vec<TargetDto>> {
    let connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match registry_service::list_targets(&connection) {
        Ok(targets) => ApiResponse::success(targets.into_iter().map(Into::into).collect()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn upsert_target(app: AppHandle, input: UpsertTargetInputDto) -> ApiResponse<TargetDto> {
    let connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match registry_service::upsert_target(&connection, input) {
        Ok(target) => ApiResponse::success(target.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn list_installations(app: AppHandle) -> ApiResponse<Vec<InstallationDto>> {
    let connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match registry_service::list_installations(&connection) {
        Ok(items) => ApiResponse::success(items.into_iter().map(Into::into).collect()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn upsert_installation(
    app: AppHandle,
    input: UpsertInstallationInputDto,
) -> ApiResponse<InstallationDto> {
    let connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match registry_service::upsert_installation(&connection, input) {
        Ok(item) => ApiResponse::success(item.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn get_app_settings_snapshot(app: AppHandle) -> ApiResponse<AppSettingsSnapshotDto> {
    let connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match settings_service::get_settings_snapshot(&connection) {
        Ok(snapshot) => ApiResponse::success(snapshot.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn set_app_setting(app: AppHandle, input: SetAppSettingInputDto) -> ApiResponse<AppSettingDto> {
    let connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };

    match settings_service::set_setting(&connection, input) {
        Ok(setting) => ApiResponse::success(setting.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn get_repository_status(app: AppHandle) -> ApiResponse<RepositoryStatusDto> {
    match repository_service::get_repository_status(&app) {
        Ok(status) => ApiResponse::success(status.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn repair_repository(app: AppHandle) -> ApiResponse<RepositoryStatusDto> {
    match repository_service::repair_repository(&app) {
        Ok(status) => ApiResponse::success(status.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn inspect_github_repository(
    app: AppHandle,
    input: InspectGithubRepositoryInputDto,
) -> ApiResponse<SkillImportPreviewDto> {
    let connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };
    let repository_root = match repository_service::default_repository_root(&app) {
        Ok(path) => path,
        Err(error) => return ApiResponse::failure(error),
    };

    match skill_install_service::inspect_github_repository(
        &connection,
        &repository_root,
        &input.url,
    ) {
        Ok(candidates) => ApiResponse::success(SkillImportPreviewDto {
            source_type: "github".to_string(),
            source_label: input.url,
            candidates: candidates.into_iter().map(Into::into).collect(),
        }),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn inspect_local_directory(
    app: AppHandle,
    input: InspectLocalDirectoryInputDto,
) -> ApiResponse<SkillImportPreviewDto> {
    let connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };
    let repository_root = match repository_service::default_repository_root(&app) {
        Ok(path) => path,
        Err(error) => return ApiResponse::failure(error),
    };

    match skill_install_service::inspect_source_directory(
        &connection,
        &repository_root,
        std::path::Path::new(&input.path),
    ) {
        Ok(candidates) => ApiResponse::success(SkillImportPreviewDto {
            source_type: "local".to_string(),
            source_label: input.path,
            candidates: candidates.into_iter().map(Into::into).collect(),
        }),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn import_github_skill(
    app: AppHandle,
    input: ImportGithubSkillInputDto,
) -> ApiResponse<SkillDto> {
    let mut connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };
    let repository_root = match repository_service::default_repository_root(&app) {
        Ok(path) => path,
        Err(error) => return ApiResponse::failure(error),
    };

    match skill_install_service::import_github_candidate(
        &mut connection,
        &repository_root,
        &input.url,
        &input.relative_path,
        crate::services::skill_install_service::SkillImportOverrides {
            slug: input.slug_override,
            name: input.name_override,
            description: input.description_override,
        },
    ) {
        Ok(skill) => ApiResponse::success(skill.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

#[tauri::command]
pub fn import_local_skill(
    app: AppHandle,
    input: ImportLocalSkillInputDto,
) -> ApiResponse<SkillDto> {
    let mut connection = match connection::open_app_database(&app) {
        Ok(connection) => connection,
        Err(error) => return ApiResponse::failure(error),
    };
    let repository_root = match repository_service::default_repository_root(&app) {
        Ok(path) => path,
        Err(error) => return ApiResponse::failure(error),
    };

    match skill_install_service::import_local_candidate(
        &mut connection,
        &repository_root,
        std::path::Path::new(&input.path),
        &input.relative_path,
        crate::services::skill_install_service::SkillImportOverrides {
            slug: input.slug_override,
            name: input.name_override,
            description: input.description_override,
        },
    ) {
        Ok(skill) => ApiResponse::success(skill.into()),
        Err(error) => ApiResponse::failure(error),
    }
}

fn now_string() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|d| d.as_secs().to_string())
        .unwrap_or_else(|_| "0".into())
}

#[allow(dead_code)]
fn _app_error(message: &str) -> AppError {
    AppError::new("app/generic", message, None, true)
}
