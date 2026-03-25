#![cfg(target_os = "windows")]

use super::PlatformProfile;

pub fn profile() -> PlatformProfile {
    PlatformProfile {
        id: "windows",
        label: "Windows",
    }
}
