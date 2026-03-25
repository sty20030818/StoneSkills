use std::sync::Mutex;

#[derive(Debug)]
pub struct AppState {
    pub launched_at: String,
    pub log_line_count: Mutex<u64>,
}

impl AppState {
    pub fn new(launched_at: String) -> Self {
        Self {
            launched_at,
            log_line_count: Mutex::new(0),
        }
    }
}
