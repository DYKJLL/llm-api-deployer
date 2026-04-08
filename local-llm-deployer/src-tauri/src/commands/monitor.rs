use crate::models::{ModelStatus, ResourceUsage};
use nvml_wrapper::Nvml;
use std::process::Command;
use sysinfo::System;
use tauri::command;

pub async fn get_resource_usage_internal() -> Result<ResourceUsage, String> {
    let sys = System::new_all();

    let cpu_percent = sys.global_cpu_usage();
    let memory_used = sys.used_memory();
    let memory_total = sys.total_memory();

    let mut gpu_percent: Option<f64> = None;
    let mut gpu_memory_used: Option<u64> = None;
    let mut gpu_memory_total: Option<u64> = None;

    if let Ok(nvml) = Nvml::init() {
        if let Ok(device) = nvml.device_by_index(0) {
            if let Ok(utilization) = device.utilization_rates() {
                gpu_percent = Some(utilization.gpu as f64);
            }
            if let Ok(memory_info) = device.memory_info() {
                gpu_memory_used = Some(memory_info.used);
                gpu_memory_total = Some(memory_info.total);
            }
        }
    }

    Ok(ResourceUsage {
        cpu_percent,
        memory_used,
        memory_total,
        gpu_percent,
        gpu_memory_used,
        gpu_memory_total,
    })
}

pub async fn get_model_status_internal() -> Result<ModelStatus, String> {
    let running = is_model_running().await.unwrap_or(false);
    let model_id = get_current_model().await;
    let gpu_memory = if running { get_model_gpu_memory().await.ok() } else { None };
    let uptime = if running { get_model_uptime().await.ok() } else { None };

    Ok(ModelStatus {
        running,
        model_id,
        gpu_memory_bytes: gpu_memory,
        uptime_seconds: uptime,
    })
}

async fn is_model_running() -> Result<bool, String> {
    let output = Command::new("pgrep")
        .args(["-f", "ollama run"])
        .output()
        .map_err(|e| e.to_string())?;

    Ok(output.status.success())
}

async fn get_current_model() -> Option<String> {
    let output = Command::new("ps")
        .args(["aux"])
        .output()
        .ok()?;

    let stdout = String::from_utf8_lossy(&output.stdout);

    for line in stdout.lines() {
        if line.contains("ollama run") && !line.contains("grep") {
            let parts: Vec<&str> = line.split_whitespace().collect();
            for part in parts {
                if part.contains(":") && !part.starts_with("-") {
                    return Some(part.to_string());
                }
            }
        }
    }

    None
}

async fn get_model_gpu_memory() -> Result<u64, String> {
    if let Ok(nvml) = Nvml::init() {
        if let Ok(device) = nvml.device_by_index(0) {
            if let Ok(memory_info) = device.memory_info() {
                return Ok(memory_info.used);
            }
        }
    }
    Err("GPU memory info unavailable".to_string())
}

async fn get_model_uptime() -> Result<u64, String> {
    let output = Command::new("pgrep")
        .args(["-f", "ollama run"])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err("Model not running".to_string());
    }

    let pid_str = String::from_utf8_lossy(&output.stdout);
    let pid: u32 = pid_str.trim().parse().unwrap_or(0);

    if pid == 0 {
        return Err("Invalid PID".to_string());
    }

    let stat_output = Command::new("ps")
        .args(["-p", &pid.to_string(), "-o", "etime="])
        .output()
        .map_err(|e| e.to_string())?;

    if !stat_output.status.success() {
        return Err("Failed to get uptime".to_string());
    }

    let elapsed = String::from_utf8_lossy(&stat_output.stdout).trim().to_string();

    let parts: Vec<&str> = elapsed.split(':').collect();
    let seconds: u64 = match parts.len() {
        2 => {
            let mins: u64 = parts[0].parse().unwrap_or(0);
            let secs: u64 = parts[1].parse().unwrap_or(0);
            mins * 60 + secs
        }
        3 => {
            let hours: u64 = parts[0].parse().unwrap_or(0);
            let mins: u64 = parts[1].parse().unwrap_or(0);
            let secs: u64 = parts[2].parse().unwrap_or(0);
            hours * 3600 + mins * 60 + secs
        }
        _ => 0,
    };

    Ok(seconds)
}

#[command]
pub async fn get_resource_usage() -> Result<ResourceUsage, String> {
    get_resource_usage_internal().await
}

#[command]
pub async fn get_model_status() -> Result<ModelStatus, String> {
    get_model_status_internal().await
}
