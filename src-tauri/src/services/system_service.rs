use tauri::AppHandle;

use crate::models::dto::SystemInfoDto;
use crate::platform;

pub fn get_system_info(app: &AppHandle) -> SystemInfoDto {
    let profile = platform::current_profile();

    SystemInfoDto {
        platform: profile.id.to_string(),
        platform_label: profile.label.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        app_version: app.package_info().version.to_string(),
    }
}
