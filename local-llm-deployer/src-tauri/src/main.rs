#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod commands;
mod models;
mod utils;

use commands::{model, monitor, ollama, system};
use tracing_subscriber::{fmt, prelude::*, EnvFilter};

fn main() {
    tracing_subscriber::registry()
        .with(fmt::layer())
        .with(EnvFilter::from_default_env().add_directive(tracing::Level::INFO.into()))
        .init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            system::detect_system_config,
            ollama::get_ollama_status,
            ollama::install_ollama,
            ollama::start_ollama,
            ollama::stop_ollama,
            model::get_model_list,
            model::get_recommendations,
            model::download_model,
            model::start_model,
            model::stop_model,
            model::switch_model,
            model::delete_model,
            monitor::get_resource_usage,
            monitor::get_model_status,
            commands::api::generate_api_info,
            commands::api::verify_api_info,
            commands::config::save_config,
            commands::config::load_config,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
