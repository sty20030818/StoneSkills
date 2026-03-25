use serde::Serialize;
use std::fmt::{Display, Formatter};

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppError {
    pub code: String,
    pub message: String,
    pub details: Option<String>,
    pub recoverable: bool,
}

impl AppError {
    pub fn new(
        code: impl Into<String>,
        message: impl Into<String>,
        details: Option<String>,
        recoverable: bool,
    ) -> Self {
        Self {
            code: code.into(),
            message: message.into(),
            details,
            recoverable,
        }
    }
}

impl From<std::io::Error> for AppError {
    fn from(value: std::io::Error) -> Self {
        Self::new(
            "system/io-error",
            "文件系统访问失败",
            Some(value.to_string()),
            true,
        )
    }
}

impl From<rusqlite::Error> for AppError {
    fn from(value: rusqlite::Error) -> Self {
        Self::new(
            "db/query-failed",
            "数据库访问失败",
            Some(value.to_string()),
            true,
        )
    }
}

impl From<rusqlite_migration::Error> for AppError {
    fn from(value: rusqlite_migration::Error) -> Self {
        Self::new(
            "db/migration-failed",
            "数据库迁移失败",
            Some(value.to_string()),
            false,
        )
    }
}

impl From<serde_json::Error> for AppError {
    fn from(value: serde_json::Error) -> Self {
        Self::new(
            "db/serialization-failed",
            "数据库字段序列化失败",
            Some(value.to_string()),
            true,
        )
    }
}

impl Display for AppError {
    fn fmt(&self, f: &mut Formatter<'_>) -> std::fmt::Result {
        match &self.details {
            Some(details) => write!(f, "{}: {}", self.message, details),
            None => write!(f, "{}", self.message),
        }
    }
}

impl std::error::Error for AppError {}
