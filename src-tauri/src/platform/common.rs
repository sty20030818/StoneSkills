#![cfg(not(any(target_os = "macos", target_os = "windows")))]

use super::PlatformProfile;

pub fn fallback_profile() -> PlatformProfile {
    PlatformProfile {
        id: std::env::consts::OS,
        label: "Unsupported",
    }
}
