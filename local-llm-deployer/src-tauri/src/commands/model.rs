use crate::commands::system::get_recommendations_internal;
use crate::models::{ModelInfo, ModelRecommendation, OllamaStatus};
use crate::commands::ollama;
use std::process::Command;
use tauri::command;

#[command]
pub async fn get_model_list() -> Result<Vec<ModelInfo>, String> {
    let local_models = crate::commands::ollama::list_local_models().await?;

    let known_models = get_known_models();

    let mut merged_models = Vec::new();

    for known in known_models {
        let is_downloaded = local_models.iter().any(|m| m.id == known.id);
        let is_running = local_models.iter().any(|m| m.id == known.id && m.is_running);

        merged_models.push(ModelInfo {
            is_downloaded,
            is_running,
            ..known
        });
    }

    for local in local_models {
        if !merged_models.iter().any(|m| m.id == local.id) {
            merged_models.push(local);
        }
    }

    Ok(merged_models)
}

fn get_known_models() -> Vec<ModelInfo> {
    vec![
        ModelInfo {
            id: "llama3:8b".to_string(),
            name: "Llama 3 8B".to_string(),
            provider: "ollama".to_string(),
            size_bytes: 4_661_224_448,
            quantization: "Q4_0".to_string(),
            parameters: 8_000_000_000,
            vram_required_bytes: 8_000_000_000,
            description: "Meta 最新开源模型，80亿参数".to_string(),
            download_url: "https://ollama.ai/library/llama3".to_string(),
            last_used: None,
            is_downloaded: false,
            is_running: false,
        },
        ModelInfo {
            id: "llama3:70b".to_string(),
            name: "Llama 3 70B".to_string(),
            provider: "ollama".to_string(),
            size_bytes: 39_000_000_000,
            quantization: "Q4_0".to_string(),
            parameters: 70_000_000_000,
            vram_required_bytes: 40_000_000_000,
            description: "Meta 最新开源模型，700亿参数".to_string(),
            download_url: "https://ollama.ai/library/llama3".to_string(),
            last_used: None,
            is_downloaded: false,
            is_running: false,
        },
        ModelInfo {
            id: "qwen2.5:7b".to_string(),
            name: "Qwen 2.5 7B".to_string(),
            provider: "ollama".to_string(),
            size_bytes: 4_500_000_000,
            quantization: "Q4_0".to_string(),
            parameters: 7_000_000_000,
            vram_required_bytes: 6_000_000_000,
            description: "阿里巴巴通义千问最新模型，70亿参数".to_string(),
            download_url: "https://ollama.ai/library/qwen2.5".to_string(),
            last_used: None,
            is_downloaded: false,
            is_running: false,
        },
        ModelInfo {
            id: "qwen2.5:14b".to_string(),
            name: "Qwen 2.5 14B".to_string(),
            provider: "ollama".to_string(),
            size_bytes: 9_000_000_000,
            quantization: "Q4_0".to_string(),
            parameters: 14_000_000_000,
            vram_required_bytes: 12_000_000_000,
            description: "阿里巴巴通义千问最新模型，140亿参数".to_string(),
            download_url: "https://ollama.ai/library/qwen2.5".to_string(),
            last_used: None,
            is_downloaded: false,
            is_running: false,
        },
        ModelInfo {
            id: "phi3:3.8b".to_string(),
            name: "Phi-3 3.8B".to_string(),
            provider: "ollama".to_string(),
            size_bytes: 2_300_000_000,
            quantization: "Q4_0".to_string(),
            parameters: 3_800_000_000,
            vram_required_bytes: 4_000_000_000,
            description: "微软 Phi-3 模型，小而强大".to_string(),
            download_url: "https://ollama.ai/library/phi3".to_string(),
            last_used: None,
            is_downloaded: false,
            is_running: false,
        },
        ModelInfo {
            id: "mistral:7b".to_string(),
            name: "Mistral 7B".to_string(),
            provider: "ollama".to_string(),
            size_bytes: 4_100_000_000,
            quantization: "Q4_0".to_string(),
            parameters: 7_000_000_000,
            vram_required_bytes: 6_000_000_000,
            description: "Mistral AI 出品的7B模型".to_string(),
            download_url: "https://ollama.ai/library/mistral".to_string(),
            last_used: None,
            is_downloaded: false,
            is_running: false,
        },
        ModelInfo {
            id: "codellama:7b".to_string(),
            name: "Code Llama 7B".to_string(),
            provider: "ollama".to_string(),
            size_bytes: 3_800_000_000,
            quantization: "Q4_0".to_string(),
            parameters: 7_000_000_000,
            vram_required_bytes: 6_000_000_000,
            description: "Meta 专用代码模型".to_string(),
            download_url: "https://ollama.ai/library/codellama".to_string(),
            last_used: None,
            is_downloaded: false,
            is_running: false,
        },
        ModelInfo {
            id: "gemma2:9b".to_string(),
            name: "Gemma 2 9B".to_string(),
            provider: "ollama".to_string(),
            size_bytes: 5_000_000_000,
            quantization: "Q4_0".to_string(),
            parameters: 9_000_000_000,
            vram_required_bytes: 8_000_000_000,
            description: "谷歌 Gemma 2 模型，90亿参数".to_string(),
            download_url: "https://ollama.ai/library/gemma2".to_string(),
            last_used: None,
            is_downloaded: false,
            is_running: false,
        },
    ]
}

#[command]
pub async fn get_recommendations() -> Result<Vec<ModelRecommendation>, String> {
    let config = crate::commands::system::detect_system_config().await?;
    Ok(get_recommendations_internal(&config))
}

#[command]
pub async fn download_model(model_id: String) -> Result<(), String> {
    if !crate::commands::ollama::is_ollama_installed() {
        return Err("请先安装 Ollama 才能下载模型".to_string());
    }
    
    let output = Command::new("ollama")
        .arg("pull")
        .arg(&model_id)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(())
}

#[command]
pub async fn start_model(model_id: String) -> Result<(), String> {
    let _child = Command::new("ollama")
        .arg("run")
        .arg(&model_id)
        .spawn()
        .map_err(|e| e.to_string())?;

    tokio::time::sleep(tokio::time::Duration::from_secs(2)).await;

    Ok(())
}

#[command]
pub async fn stop_model() -> Result<(), String> {
    let output = Command::new("pkill")
        .args(["-f", "ollama run"])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err("Failed to stop model".to_string());
    }

    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

    Ok(())
}

#[command]
pub async fn switch_model(new_model_id: String) -> Result<(), String> {
    stop_model().await?;
    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;
    start_model(new_model_id).await
}

#[command]
pub async fn delete_model(model_id: String) -> Result<(), String> {
    let output = Command::new("ollama")
        .arg("rm")
        .arg(&model_id)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(())
}
