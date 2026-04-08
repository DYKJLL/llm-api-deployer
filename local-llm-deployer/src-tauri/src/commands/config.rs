use crate::models::AppConfig;
use std::fs;
use std::path::PathBuf;
use tauri::command;

fn get_config_path() -> PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("local-llm-deployer");

    if !config_dir.exists() {
        let _ = fs::create_dir_all(&config_dir);
    }

    config_dir.join("config.json")
}

#[command]
pub async fn save_config(config: AppConfig) -> Result<(), String> {
    let config_path = get_config_path();
    let json = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(config_path, json).map_err(|e| e.to_string())
}

#[command]
pub async fn load_config() -> Result<AppConfig, String> {
    let config_path = get_config_path();

    if !config_path.exists() {
        return Ok(AppConfig {
            version: "1.0.0".to_string(),
            settings: crate::models::Settings {
                model_storage_path: "~/.ollama/models".to_string(),
                language: "zh-CN".to_string(),
                auto_start_ollama: true,
                theme: "system".to_string(),
            },
            custom_model_sources: vec![],
            recent_models: vec![],
        });
    }

    let content = fs::read_to_string(config_path).map_err(|e| e.to_string())?;
    serde_json::from_str(&content).map_err(|e| e.to_string())
}
