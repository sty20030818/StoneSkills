use std::path::PathBuf;

use crate::app::errors::AppError;

pub fn ensure_dir(path: String) -> Result<PathBuf, AppError> {
    let dir = PathBuf::from(path);
    std::fs::create_dir_all(&dir)?;
    Ok(dir)
}
