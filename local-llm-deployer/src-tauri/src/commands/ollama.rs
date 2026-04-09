use crate::models::{ModelInfo, OllamaStatus};
use std::process::Command;
use tauri::command;

pub async fn is_ollama_running() -> Result<bool, String> {
    let output = Command::new("pgrep")
        .args(["-f", "ollama serve"])
        .output()
        .map_err(|e| e.to_string())?;

    Ok(output.status.success())
}

pub fn get_ollama_version() -> Result<String, String> {
    let output = Command::new("ollama")
        .arg("--version")
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err("Ollama not found".to_string());
    }

    let version = String::from_utf8_lossy(&output.stdout).trim().to_string();
    Ok(version)
}

pub fn is_ollama_installed() -> bool {
    Command::new("ollama")
        .arg("--version")
        .output()
        .map(|output| output.status.success())
        .unwrap_or(false)
}

pub async fn list_local_models() -> Result<Vec<ModelInfo>, String> {
    let output = Command::new("ollama")
        .arg("list")
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut models = Vec::new();

    for line in stdout.lines().skip(1) {
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() >= 2 {
            let id = parts[0].to_string();
            let size_str = parts[1];

            let size_bytes = parse_size_string(size_str);

            let model = ModelInfo {
                id: id.clone(),
                name: id.clone(),
                provider: "ollama".to_string(),
                size_bytes,
                quantization: "Q4_0".to_string(),
                parameters: estimate_parameters(&id),
                vram_required_bytes: estimate_vram(&id),
                description: format!("Local model: {}", id),
                download_url: format!("https://ollama.ai/library/{}", id.split(':').next().unwrap_or(&id)),
                last_used: None,
                is_downloaded: true,
                is_running: false,
            };

            models.push(model);
        }
    }

    Ok(models)
}

fn parse_size_string(size_str: &str) -> u64 {
    let size_str = size_str.to_uppercase();
    let multiplier: u64;

    if size_str.ends_with("G") {
        multiplier = 1024 * 1024 * 1024;
    } else if size_str.ends_with("M") {
        multiplier = 1024 * 1024;
    } else if size_str.ends_with("K") {
        multiplier = 1024;
    } else {
        return 0;
    }

    let num_str = &size_str[..size_str.len() - 1];
    let num: f64 = num_str.parse().unwrap_or(0.0);

    (num * multiplier as f64) as u64
}

fn estimate_parameters(model_id: &str) -> u64 {
    let lower = model_id.to_lowercase();

    if lower.contains("70b") {
        70_000_000_000
    } else if lower.contains("34b") {
        34_000_000_000
    } else if lower.contains("30b") {
        30_000_000_000
    } else if lower.contains("14b") {
        14_000_000_000
    } else if lower.contains("13b") {
        13_000_000_000
    } else if lower.contains("7b") {
        7_000_000_000
    } else if lower.contains("3.8b") || lower.contains("3b") {
        3_800_000_000
    } else if lower.contains("1b") || lower.contains("1.3b") {
        1_300_000_000
    } else {
        7_000_000_000
    }
}

fn estimate_vram(model_id: &str) -> u64 {
    let lower = model_id.to_lowercase();

    if lower.contains("70b") {
        48_000_000_000
    } else if lower.contains("34b") {
        24_000_000_000
    } else if lower.contains("30b") {
        20_000_000_000
    } else if lower.contains("14b") {
        12_000_000_000
    } else if lower.contains("13b") {
        10_000_000_000
    } else if lower.contains("7b") {
        6_000_000_000
    } else if lower.contains("3.8b") || lower.contains("3b") {
        4_000_000_000
    } else if lower.contains("1b") || lower.contains("1.3b") {
        2_000_000_000
    } else {
        6_000_000_000
    }
}

pub async fn get_ollama_status_internal() -> Result<OllamaStatus, String> {
    let running = is_ollama_running().await.unwrap_or(false);
    let version = get_ollama_version().ok();
    let models = list_local_models().await.unwrap_or_default();

    Ok(OllamaStatus {
        running,
        version,
        models,
    })
}

#[command]
pub async fn get_ollama_status() -> Result<OllamaStatus, String> {
    get_ollama_status_internal().await
}

#[command]
pub async fn install_ollama() -> Result<(), String> {
    if get_ollama_version().is_ok() {
        return Ok(());
    }

    let (platform, arch) = detect_platform_and_arch();

    let download_url = format!(
        "https://github.com/ollama/ollama/releases/download/v0.1.38/ollama-{}-{}.tgz",
        platform, arch
    );

    let install_dir = dirs::home_dir()
        .unwrap_or_else(|| std::path::PathBuf::from("/usr/local"))
        .join(".local")
        .join("bin");

    std::fs::create_dir_all(&install_dir).map_err(|e| e.to_string())?;

    let archive_path = install_dir.join("ollama.tar.gz");

    println!("Downloading Ollama from: {}", download_url);

    let response = reqwest::get(&download_url).await.map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("Download failed: {}", response.status()));
    }

    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    std::fs::write(&archive_path, &bytes).map_err(|e| e.to_string())?;

    println!("Downloaded Ollama to: {:?}", archive_path);

    Ok(())
}

fn detect_platform_and_arch() -> (&'static str, &'static str) {
    let platform = if cfg!(target_os = "macos") {
        "darwin"
    } else if cfg!(target_os = "linux") {
        "linux"
    } else if cfg!(target_os = "windows") {
        "windows"
    } else {
        "linux"
    };

    let arch = if cfg!(target_arch = "x86_64") {
        "amd64"
    } else if cfg!(target_arch = "aarch64") || cfg!(target_arch = "arm64") {
        "arm64"
    } else {
        "amd64"
    };

    (platform, arch)
}

#[command]
pub async fn start_ollama() -> Result<(), String> {
    if is_ollama_running().await? {
        return Ok(());
    }

    let child = Command::new("ollama")
        .arg("serve")
        .spawn()
        .map_err(|e| e.to_string())?;

    tokio::time::sleep(tokio::time::Duration::from_secs(3)).await;

    Ok(())
}

#[command]
pub async fn stop_ollama() -> Result<(), String> {
    let output = Command::new("pkill")
        .args(["-f", "ollama serve"])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err("Failed to stop Ollama".to_string());
    }

    tokio::time::sleep(tokio::time::Duration::from_secs(1)).await;

    Ok(())
}
