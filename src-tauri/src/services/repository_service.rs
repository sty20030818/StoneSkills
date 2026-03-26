use std::fs::{self, OpenOptions};
use std::path::{Path, PathBuf};

use tauri::AppHandle;

use crate::app::errors::AppError;
use crate::services::path_service;

pub const REPOSITORY_DIR_NAME: &str = ".stoneskills";
pub const STANDARD_DIRECTORIES: [&str; 6] = ["skills", "backups", "cache", "temp", "logs", "manifests"];

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RepositoryHealthStatus {
    Healthy,
    Warning,
    Broken,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RepositoryStatus {
    pub root_path: String,
    pub status: RepositoryHealthStatus,
    pub missing_directories: Vec<String>,
    pub writable: bool,
    pub message: Option<String>,
}

impl RepositoryHealthStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Healthy => "healthy",
            Self::Warning => "warning",
            Self::Broken => "broken",
        }
    }
}

pub fn default_repository_root(app: &AppHandle) -> Result<PathBuf, AppError> {
    Ok(default_repository_root_from_home(&path_service::get_home_dir(app)?))
}

pub fn get_repository_status(app: &AppHandle) -> Result<RepositoryStatus, AppError> {
    let root = default_repository_root(app)?;
    ensure_repository_initialized_at(&root)
}

pub fn repair_repository(app: &AppHandle) -> Result<RepositoryStatus, AppError> {
    let root = default_repository_root(app)?;
    repair_repository_at(&root)
}

pub fn default_repository_root_from_home(home_dir: &Path) -> PathBuf {
    home_dir.join(REPOSITORY_DIR_NAME)
}

pub fn ensure_repository_initialized_at(root: &Path) -> Result<RepositoryStatus, AppError> {
    ensure_root_directory(root)?;

    for entry in STANDARD_DIRECTORIES {
        fs::create_dir_all(root.join(entry))?;
    }

    check_repository_health_at(root)
}

pub fn check_repository_health_at(root: &Path) -> Result<RepositoryStatus, AppError> {
    let root_display = root.display().to_string();

    if !root.exists() {
        return Ok(RepositoryStatus {
            root_path: root_display,
            status: RepositoryHealthStatus::Broken,
            missing_directories: STANDARD_DIRECTORIES
                .iter()
                .map(|entry| (*entry).to_string())
                .collect(),
            writable: false,
            message: Some("仓库目录不存在".to_string()),
        });
    }

    if !root.is_dir() {
        return Ok(RepositoryStatus {
            root_path: root_display,
            status: RepositoryHealthStatus::Broken,
            missing_directories: vec![],
            writable: false,
            message: Some("仓库路径被文件占用，无法作为目录使用".to_string()),
        });
    }

    let missing_directories = STANDARD_DIRECTORIES
        .iter()
        .filter(|entry| !root.join(entry).is_dir())
        .map(|entry| (*entry).to_string())
        .collect::<Vec<_>>();

    let writable = is_directory_writable(root);

    let (status, message) = if !writable {
        (
            RepositoryHealthStatus::Broken,
            Some("仓库目录不可写".to_string()),
        )
    } else if !missing_directories.is_empty() {
        (
            RepositoryHealthStatus::Warning,
            Some("仓库目录结构不完整，可执行修复".to_string()),
        )
    } else {
        (
            RepositoryHealthStatus::Healthy,
            Some("仓库目录可用".to_string()),
        )
    };

    Ok(RepositoryStatus {
        root_path: root_display,
        status,
        missing_directories,
        writable,
        message,
    })
}

pub fn repair_repository_at(root: &Path) -> Result<RepositoryStatus, AppError> {
    ensure_root_directory(root)?;

    if !is_directory_writable(root) {
        return Err(AppError::new(
            "repository/not-writable",
            "仓库目录不可写，无法修复",
            Some(root.display().to_string()),
            true,
        ));
    }

    for entry in STANDARD_DIRECTORIES {
        fs::create_dir_all(root.join(entry))?;
    }

    check_repository_health_at(root)
}

fn ensure_root_directory(root: &Path) -> Result<(), AppError> {
    if root.exists() && !root.is_dir() {
        return Err(AppError::new(
            "repository/path-conflict",
            "仓库路径被文件占用，无法初始化",
            Some(root.display().to_string()),
            true,
        ));
    }

    fs::create_dir_all(root)?;
    Ok(())
}

fn is_directory_writable(root: &Path) -> bool {
    let probe_path = root.join(".stoneskills-write-probe");

    match OpenOptions::new()
        .create(true)
        .write(true)
        .truncate(true)
        .open(&probe_path)
    {
        Ok(_) => {
            let _ = fs::remove_file(probe_path);
            true
        }
        Err(_) => false,
    }
}

#[cfg(test)]
mod tests {
    use std::path::Path;

    use tempfile::TempDir;

    use super::{
        REPOSITORY_DIR_NAME, RepositoryHealthStatus, STANDARD_DIRECTORIES, check_repository_health_at,
        default_repository_root_from_home, ensure_repository_initialized_at, repair_repository_at,
    };

    #[test]
    fn default_repository_root_uses_home_directory_dot_stoneskills() {
        let home = Path::new("/tmp/stone-home");

        let root = default_repository_root_from_home(home);

        assert_eq!(root, home.join(REPOSITORY_DIR_NAME));
    }

    #[test]
    fn ensure_repository_initialized_creates_all_standard_directories() {
        let temp_dir = TempDir::new().expect("create temp dir");
        let root = temp_dir.path().join(REPOSITORY_DIR_NAME);

        let status = ensure_repository_initialized_at(&root).expect("initialize repository");

        assert_eq!(status.status, RepositoryHealthStatus::Healthy);
        assert!(status.writable);

        for entry in STANDARD_DIRECTORIES {
            assert!(root.join(entry).is_dir(), "missing directory: {entry}");
        }
    }

    #[test]
    fn check_repository_health_returns_warning_when_standard_directory_is_missing() {
        let temp_dir = TempDir::new().expect("create temp dir");
        let root = temp_dir.path().join(REPOSITORY_DIR_NAME);

        ensure_repository_initialized_at(&root).expect("initialize repository");
        std::fs::remove_dir_all(root.join("cache")).expect("remove cache dir");

        let status = check_repository_health_at(&root).expect("check health");

        assert_eq!(status.status, RepositoryHealthStatus::Warning);
        assert_eq!(status.missing_directories, vec!["cache".to_string()]);
    }

    #[test]
    fn repair_repository_recreates_missing_directories_and_returns_healthy() {
        let temp_dir = TempDir::new().expect("create temp dir");
        let root = temp_dir.path().join(REPOSITORY_DIR_NAME);

        ensure_repository_initialized_at(&root).expect("initialize repository");
        std::fs::remove_dir_all(root.join("logs")).expect("remove logs dir");

        let status = repair_repository_at(&root).expect("repair repository");

        assert_eq!(status.status, RepositoryHealthStatus::Healthy);
        assert!(root.join("logs").is_dir());
    }

    #[test]
    fn check_repository_health_returns_broken_when_root_path_is_a_file() {
        let temp_dir = TempDir::new().expect("create temp dir");
        let root = temp_dir.path().join(REPOSITORY_DIR_NAME);

        std::fs::write(&root, "occupied").expect("create occupying file");

        let status = check_repository_health_at(&root).expect("check health");

        assert_eq!(status.status, RepositoryHealthStatus::Broken);
        assert_eq!(status.message, Some("仓库路径被文件占用，无法作为目录使用".to_string()));
    }
}
