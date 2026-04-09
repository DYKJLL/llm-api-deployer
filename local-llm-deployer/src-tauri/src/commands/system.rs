use crate::models::{CpuInfo, DiskInfo, GpuInfo, MemoryInfo, ModelInfo, ModelRecommendation, SystemConfig};
use chrono::Utc;
use nvml_wrapper::Nvml;
use std::process::Command;
use sysinfo::{System, Disks};
use tauri::command;

pub fn detect_cpu() -> Result<CpuInfo, String> {
    let sys = System::new_all();

    let cpus = sys.cpus();
    let cpu_name = cpus.first().map(|c| c.brand().to_string()).unwrap_or_else(|| "Unknown CPU".to_string());
    let cores = sys.physical_core_count().unwrap_or(0) as u32;
    let threads = cpus.len() as u32;
    let frequency = cpus.first().map(|c| c.frequency()).unwrap_or(0) as u64;

    Ok(CpuInfo {
        name: cpu_name,
        cores,
        threads,
        frequency_mhz: frequency,
    })
}

pub fn detect_gpu() -> Result<Vec<GpuInfo>, String> {
    let mut gpus = Vec::new();

    if let Ok(nvml) = Nvml::init() {
        if let Ok(device_count) = nvml.device_count() {
            for i in 0..device_count {
                if let Ok(device) = nvml.device_by_index(i) {
                    let name = device.name().unwrap_or_else(|_| "Unknown GPU".to_string());
                    let memory = device.memory_info().map(|m| m.total).unwrap_or(0);
                    let driver_version = nvml.sys_driver_version().unwrap_or_else(|_| "Unknown".to_string());
                    
                    let compute_cap = device.cuda_compute_capability().ok().map(|cc| (cc.major as u32, cc.minor as u32));
                    
                    gpus.push(GpuInfo {
                        name,
                        vendor: "NVIDIA".to_string(),
                        memory_bytes: memory,
                        driver_version,
                        compute_capability: compute_cap,
                    });
                }
            }
        }
    }

    if gpus.is_empty() {
        if let Ok(output) = Command::new("lspci").arg("-v").arg("-mm").output() {
            let lspci_output = String::from_utf8_lossy(&output.stdout);
            if lspci_output.contains("VGA") || lspci_output.contains("3D") {
                gpus.push(GpuInfo {
                    name: "GPU (details unavailable)".to_string(),
                    vendor: "Unknown".to_string(),
                    memory_bytes: 0,
                    driver_version: "Unknown".to_string(),
                    compute_capability: None,
                });
            }
        }
    }

    Ok(gpus)
}

pub fn detect_memory() -> Result<MemoryInfo, String> {
    let sys = System::new_all();

    let total = sys.total_memory();
    let available = sys.available_memory();

    Ok(MemoryInfo {
        total_bytes: total,
        available_bytes: available,
    })
}

pub fn detect_disk() -> Result<DiskInfo, String> {
    let disks = Disks::new_with_refreshed_list();

    let disk = disks.list().first();

    if let Some(disk) = disk {
        let total = disk.total_space();
        let available = disk.available_space();
        let mount = disk.mount_point().to_string_lossy().to_string();

        Ok(DiskInfo {
            total_bytes: total,
            available_bytes: available,
            mount_point: mount,
        })
    } else {
        Ok(DiskInfo {
            total_bytes: 0,
            available_bytes: 0,
            mount_point: "/".to_string(),
        })
    }
}

#[command]
pub async fn detect_system_config() -> Result<SystemConfig, String> {
    let cpu = detect_cpu()?;
    let gpu = detect_gpu()?;
    let memory = detect_memory()?;
    let disk = detect_disk()?;

    Ok(SystemConfig {
        cpu,
        gpu,
        memory,
        disk,
        timestamp: Utc::now().to_rfc3339(),
    })
}

pub fn get_recommendations_internal(config: &SystemConfig) -> Vec<ModelRecommendation> {
    let available_vram: u64 = config.gpu.iter().map(|g| g.memory_bytes).sum();
    let available_ram = config.memory.available_bytes;

    let all_models = get_known_models();

    let mut recommendations = Vec::new();

    for model in all_models {
        let score = calculate_compatibility_score(&model, available_vram, available_ram);

        if score > 0.0 {
            let warnings = get_warnings(&model, available_vram, available_ram);
            recommendations.push(ModelRecommendation {
                model,
                score,
                can_run: score >= 0.8,
                warnings,
            });
        }
    }

    recommendations.sort_by(|a, b| b.score.partial_cmp(&a.score).unwrap());
    recommendations
}

fn calculate_compatibility_score(model: &ModelInfo, available_vram: u64, available_ram: u64) -> f64 {
    let vram_ratio = if model.vram_required_bytes > 0 {
        (available_vram as f64 / model.vram_required_bytes as f64).min(1.0)
    } else {
        1.0
    };

    let ram_ratio = if model.parameters > 0 {
        let required_ram = model.parameters * 2;
        (available_ram as f64 / required_ram as f64).min(1.0)
    } else {
        1.0
    };

    vram_ratio * 0.7 + ram_ratio * 0.3
}

fn get_warnings(model: &ModelInfo, available_vram: u64, available_ram: u64) -> Vec<String> {
    let mut warnings = Vec::new();

    if model.vram_required_bytes > 0 && available_vram < model.vram_required_bytes {
        warnings.push(format!(
            "VRAM may be insufficient: model requires ~{}GB",
            model.vram_required_bytes / (1024 * 1024 * 1024)
        ));
    }

    let required_ram = model.parameters * 2;
    if available_ram < required_ram {
        warnings.push(format!(
            "RAM may be insufficient: model requires ~{}GB",
            required_ram / (1024 * 1024 * 1024)
        ));
    }

    warnings
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
