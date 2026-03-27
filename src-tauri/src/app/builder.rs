use tauri::Manager;
use tracing_subscriber::EnvFilter;

use crate::app::state::AppState;
use crate::commands::{app, logs, system};
use crate::database;

pub fn build_app() -> tauri::Builder<tauri::Wry> {
    init_tracing();

    tauri::Builder::default()
        .setup(|app| {
            let launched_at = chrono_like_now();
            app.manage(AppState::new(launched_at));
            let handle = app.handle();
            if let Ok(paths) = crate::services::path_service::get_app_paths(&handle) {
                let _ = crate::services::fs_service::ensure_dir(paths.app_log_dir.clone());
            }
            database::initialize_database(&handle)?;
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            app::bootstrap_app,
            app::start_demo_task,
            app::create_skill,
            app::update_skill,
            app::delete_skill,
            app::list_skills,
            app::upsert_target,
            app::list_targets,
            app::upsert_installation,
            app::list_installations,
            app::get_app_settings_snapshot,
            app::set_app_setting,
            app::get_repository_status,
            app::repair_repository,
            app::inspect_github_repository,
            app::inspect_local_directory,
            app::import_github_skill,
            app::import_local_skill,
            system::get_system_info,
            system::get_app_paths,
            logs::write_test_log
        ])
}

fn init_tracing() {
    let filter = EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info"));

    let _ = tracing_subscriber::fmt()
        .with_env_filter(filter)
        .with_target(false)
        .compact()
        .try_init();
}

fn chrono_like_now() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs();

    format!("{now}")
}
