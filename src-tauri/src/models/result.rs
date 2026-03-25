use serde::Serialize;

use crate::app::errors::AppError;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ApiResponse<T> {
    pub ok: bool,
    pub data: Option<T>,
    pub error: Option<AppError>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        Self {
            ok: true,
            data: Some(data),
            error: None,
        }
    }

    pub fn failure(error: AppError) -> Self {
        Self {
            ok: false,
            data: None,
            error: Some(error),
        }
    }
}
