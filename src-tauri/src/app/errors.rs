use serde::Serialize;

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
