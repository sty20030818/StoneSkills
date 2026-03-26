use serde::{Deserialize, Serialize};

use crate::models::domain::{
    AppSettingRecord, AppSettingsSnapshot, InstallationRecord, SkillAggregate, SkillSourceRecord,
    SkillTargetSupportRecord, TargetRecord,
};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemInfoDto {
    pub platform: String,
    pub platform_label: String,
    pub arch: String,
    pub app_version: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppPathsDto {
    pub app_data_dir: String,
    pub app_log_dir: String,
    pub suggested_repository_dir: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BootstrapPayloadDto {
    pub system: SystemInfoDto,
    pub paths: AppPathsDto,
    pub launched_at: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LogWritePayloadDto {
    pub log_file_path: String,
    pub line_count: u64,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DemoTaskAckDto {
    pub task_id: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TaskEventPayload {
    pub task_id: String,
    pub status: String,
    pub label: String,
    pub progress: u8,
    pub message: String,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillSourceDto {
    pub id: String,
    pub source_type: String,
    pub source_url: Option<String>,
    pub source_ref: Option<String>,
    pub source_commit: Option<String>,
    pub source_subpath: Option<String>,
    pub is_primary: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillTargetSupportDto {
    pub target_key: String,
    pub support_level: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SkillDto {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub local_path: String,
    pub icon: Option<String>,
    pub readme_path: Option<String>,
    pub install_method: String,
    pub checksum: Option<String>,
    pub status: String,
    pub extra_metadata_json: Option<String>,
    pub tags: Vec<String>,
    pub sources: Vec<SkillSourceDto>,
    pub supported_targets: Vec<SkillTargetSupportDto>,
    pub created_at: i64,
    pub updated_at: i64,
    pub last_checked_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSkillInputDto {
    pub slug: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub local_path: String,
    pub icon: Option<String>,
    pub readme_path: Option<String>,
    pub install_method: String,
    pub checksum: Option<String>,
    pub status: String,
    pub extra_metadata_json: Option<String>,
    pub tags: Vec<String>,
    pub sources: Vec<CreateSkillSourceInputDto>,
    pub supported_targets: Vec<CreateSkillTargetSupportInputDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSkillInputDto {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub local_path: String,
    pub icon: Option<String>,
    pub readme_path: Option<String>,
    pub install_method: String,
    pub checksum: Option<String>,
    pub status: String,
    pub extra_metadata_json: Option<String>,
    pub tags: Vec<String>,
    pub sources: Vec<CreateSkillSourceInputDto>,
    pub supported_targets: Vec<CreateSkillTargetSupportInputDto>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSkillSourceInputDto {
    pub source_type: String,
    pub source_url: Option<String>,
    pub source_ref: Option<String>,
    pub source_commit: Option<String>,
    pub source_subpath: Option<String>,
    pub is_primary: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSkillTargetSupportInputDto {
    pub target_key: String,
    pub support_level: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TargetDto {
    pub id: String,
    pub key: String,
    pub name: String,
    pub platform: Option<String>,
    pub detect_status: String,
    pub install_path: Option<String>,
    pub adapter_type: Option<String>,
    pub enable_modes: Vec<String>,
    pub health_status: String,
    pub last_detected_at: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertTargetInputDto {
    pub key: String,
    pub name: String,
    pub platform: Option<String>,
    pub detect_status: String,
    pub install_path: Option<String>,
    pub adapter_type: Option<String>,
    pub enable_modes: Vec<String>,
    pub health_status: String,
    pub last_detected_at: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstallationDto {
    pub id: String,
    pub skill_id: String,
    pub target_id: String,
    pub install_mode: String,
    pub target_path: String,
    pub installed_version: String,
    pub status: String,
    pub last_error: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpsertInstallationInputDto {
    pub skill_id: String,
    pub target_id: String,
    pub install_mode: String,
    pub target_path: String,
    pub installed_version: String,
    pub status: String,
    pub last_error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettingDto {
    pub key: String,
    pub value_json: serde_json::Value,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppSettingsSnapshotDto {
    pub repository_root: Option<String>,
    pub default_install_mode: Option<String>,
    pub auto_check_updates: Option<bool>,
    pub github_token: Option<String>,
    pub scan_paths: Vec<String>,
    pub log_level: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RepositoryStatusDto {
    pub root_path: String,
    pub status: String,
    pub missing_directories: Vec<String>,
    pub writable: bool,
    pub message: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SetAppSettingInputDto {
    pub key: String,
    pub value_json: serde_json::Value,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteAckDto {
    pub id: String,
}

impl From<SkillSourceRecord> for SkillSourceDto {
    fn from(value: SkillSourceRecord) -> Self {
        Self {
            id: value.id,
            source_type: value.source_type.as_str().to_string(),
            source_url: value.source_url,
            source_ref: value.source_ref,
            source_commit: value.source_commit,
            source_subpath: value.source_subpath,
            is_primary: value.is_primary,
        }
    }
}

impl From<SkillTargetSupportRecord> for SkillTargetSupportDto {
    fn from(value: SkillTargetSupportRecord) -> Self {
        Self {
            target_key: value.target_key,
            support_level: value.support_level.as_str().to_string(),
        }
    }
}

impl From<SkillAggregate> for SkillDto {
    fn from(value: SkillAggregate) -> Self {
        Self {
            id: value.skill.id,
            slug: value.skill.slug,
            name: value.skill.name,
            version: value.skill.version,
            description: value.skill.description,
            author: value.skill.author,
            local_path: value.skill.local_path,
            icon: value.skill.icon,
            readme_path: value.skill.readme_path,
            install_method: value.skill.install_method.as_str().to_string(),
            checksum: value.skill.checksum,
            status: value.skill.status.as_str().to_string(),
            extra_metadata_json: value.skill.extra_metadata_json,
            tags: value.tags,
            sources: value.sources.into_iter().map(Into::into).collect(),
            supported_targets: value.supported_targets.into_iter().map(Into::into).collect(),
            created_at: value.skill.created_at,
            updated_at: value.skill.updated_at,
            last_checked_at: value.skill.last_checked_at,
        }
    }
}

impl From<TargetRecord> for TargetDto {
    fn from(value: TargetRecord) -> Self {
        Self {
            id: value.id,
            key: value.key,
            name: value.name,
            platform: value.platform,
            detect_status: value.detect_status.as_str().to_string(),
            install_path: value.install_path,
            adapter_type: value.adapter_type,
            enable_modes: value.enable_modes,
            health_status: value.health_status.as_str().to_string(),
            last_detected_at: value.last_detected_at,
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

impl From<InstallationRecord> for InstallationDto {
    fn from(value: InstallationRecord) -> Self {
        Self {
            id: value.id,
            skill_id: value.skill_id,
            target_id: value.target_id,
            install_mode: value.install_mode.as_str().to_string(),
            target_path: value.target_path,
            installed_version: value.installed_version,
            status: value.status.as_str().to_string(),
            last_error: value.last_error,
            created_at: value.created_at,
            updated_at: value.updated_at,
        }
    }
}

impl From<AppSettingRecord> for AppSettingDto {
    fn from(value: AppSettingRecord) -> Self {
        Self {
            key: value.key,
            value_json: value.value_json,
            updated_at: value.updated_at,
        }
    }
}

impl From<AppSettingsSnapshot> for AppSettingsSnapshotDto {
    fn from(value: AppSettingsSnapshot) -> Self {
        Self {
            repository_root: value.repository_root,
            default_install_mode: value.default_install_mode.map(|mode| mode.as_str().to_string()),
            auto_check_updates: value.auto_check_updates,
            github_token: value.github_token,
            scan_paths: value.scan_paths,
            log_level: value.log_level,
        }
    }
}

impl From<crate::services::repository_service::RepositoryStatus> for RepositoryStatusDto {
    fn from(value: crate::services::repository_service::RepositoryStatus) -> Self {
        Self {
            root_path: value.root_path,
            status: value.status.as_str().to_string(),
            missing_directories: value.missing_directories,
            writable: value.writable,
            message: value.message,
        }
    }
}
