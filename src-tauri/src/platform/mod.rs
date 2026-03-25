pub mod common;
pub mod macos;
pub mod windows;

#[derive(Debug, Clone)]
pub struct PlatformProfile {
    pub id: &'static str,
    pub label: &'static str,
}

pub fn current_profile() -> PlatformProfile {
    #[cfg(target_os = "macos")]
    {
        return macos::profile();
    }

    #[cfg(target_os = "windows")]
    {
        return windows::profile();
    }

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        return common::fallback_profile();
    }
}
