use serde::{Deserialize, Serialize};

use crate::app::errors::AppError;

macro_rules! string_enum {
    ($name:ident { $($variant:ident => $value:literal),+ $(,)? }) => {
        #[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
        #[serde(rename_all = "kebab-case")]
        pub enum $name {
            $($variant),+
        }

        impl $name {
            pub fn as_str(&self) -> &'static str {
                match self {
                    $(Self::$variant => $value),+
                }
            }

            pub fn parse(value: &str) -> Result<Self, AppError> {
                match value {
                    $($value => Ok(Self::$variant),)+
                    _ => Err(AppError::new(
                        "db/constraint-violation",
                        format!("无效的 {} 值", stringify!($name)),
                        Some(value.to_string()),
                        true,
                    )),
                }
            }
        }
    };
}

string_enum!(SkillStatus {
    Ready => "ready",
    Invalid => "invalid",
    Missing => "missing",
    Updating => "updating",
    Archived => "archived",
});

string_enum!(SourceType {
    Github => "github",
    Local => "local",
    Scan => "scan",
    Marketplace => "marketplace",
});

string_enum!(SupportLevel {
    Native => "native",
    Adapter => "adapter",
    Unknown => "unknown",
});

string_enum!(DetectStatus {
    Unknown => "unknown",
    Detected => "detected",
    Missing => "missing",
    Unsupported => "unsupported",
});

string_enum!(HealthStatus {
    Healthy => "healthy",
    Warning => "warning",
    Broken => "broken",
});

string_enum!(InstallMode {
    Link => "link",
    Copy => "copy",
});

string_enum!(InstallationStatus {
    Pending => "pending",
    Installed => "installed",
    Disabled => "disabled",
    Outdated => "outdated",
    Broken => "broken",
    Failed => "failed",
});

#[derive(Debug, Clone)]
pub struct SkillRecord {
    pub id: String,
    pub slug: String,
    pub name: String,
    pub version: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub local_path: String,
    pub icon: Option<String>,
    pub readme_path: Option<String>,
    pub install_method: InstallMode,
    pub checksum: Option<String>,
    pub status: SkillStatus,
    pub extra_metadata_json: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
    pub last_checked_at: Option<i64>,
}

#[derive(Debug, Clone)]
pub struct SkillSourceRecord {
    pub id: String,
    pub skill_id: String,
    pub source_type: SourceType,
    pub source_url: Option<String>,
    pub source_ref: Option<String>,
    pub source_commit: Option<String>,
    pub source_subpath: Option<String>,
    pub is_primary: bool,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone)]
pub struct SkillTargetSupportRecord {
    pub target_key: String,
    pub support_level: SupportLevel,
}

#[derive(Debug, Clone)]
pub struct SkillAggregate {
    pub skill: SkillRecord,
    pub sources: Vec<SkillSourceRecord>,
    pub tags: Vec<String>,
    pub supported_targets: Vec<SkillTargetSupportRecord>,
}

#[derive(Debug, Clone)]
pub struct TargetRecord {
    pub id: String,
    pub key: String,
    pub name: String,
    pub platform: Option<String>,
    pub detect_status: DetectStatus,
    pub install_path: Option<String>,
    pub adapter_type: Option<String>,
    pub enable_modes: Vec<String>,
    pub health_status: HealthStatus,
    pub last_detected_at: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone)]
pub struct InstallationRecord {
    pub id: String,
    pub skill_id: String,
    pub target_id: String,
    pub install_mode: InstallMode,
    pub target_path: String,
    pub installed_version: String,
    pub status: InstallationStatus,
    pub last_error: Option<String>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone)]
pub struct AppSettingRecord {
    pub key: String,
    pub value_json: serde_json::Value,
    pub updated_at: i64,
}

#[derive(Debug, Clone)]
pub struct AppSettingsSnapshot {
    pub repository_root: Option<String>,
    pub default_install_mode: Option<InstallMode>,
    pub auto_check_updates: Option<bool>,
    pub github_token: Option<String>,
    pub scan_paths: Vec<String>,
    pub log_level: Option<String>,
    pub recent_github_repositories: Vec<String>,
}
