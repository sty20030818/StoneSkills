mod app;
mod commands;
mod database;
mod models;
mod platform;
mod repositories;
mod services;

use app::builder::build_app;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = build_app();

    app.run(tauri::generate_context!())
        .expect("failed to run StoneSkills application");
}
