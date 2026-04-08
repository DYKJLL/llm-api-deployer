use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub version: String,
    pub settings: Settings,
    pub custom_model_sources: Vec<ModelSource>,
    pub recent_models: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub model_storage_path: String,
    pub language: String,
    #[serde(rename = "auto_start_ollama")]
    pub auto_start_ollama: bool,
    pub theme: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelSource {
    pub name: String,
    pub url: String,
    pub enabled: bool,
}
