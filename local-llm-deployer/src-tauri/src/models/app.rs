use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SystemConfig {
    pub cpu: CpuInfo,
    pub gpu: Vec<GpuInfo>,
    pub memory: MemoryInfo,
    pub disk: DiskInfo,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CpuInfo {
    pub name: String,
    pub cores: u32,
    pub threads: u32,
    pub frequency_mhz: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct GpuInfo {
    pub name: String,
    pub vendor: String,
    pub memory_bytes: u64,
    pub driver_version: String,
    pub compute_capability: Option<(u32, u32)>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MemoryInfo {
    pub total_bytes: u64,
    pub available_bytes: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiskInfo {
    pub total_bytes: u64,
    pub available_bytes: u64,
    pub mount_point: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OllamaStatus {
    pub running: bool,
    pub version: Option<String>,
    pub models: Vec<ModelInfo>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelInfo {
    pub id: String,
    pub name: String,
    pub provider: String,
    pub size_bytes: u64,
    pub quantization: String,
    pub parameters: u64,
    pub vram_required_bytes: u64,
    pub description: String,
    pub download_url: String,
    pub last_used: Option<String>,
    #[serde(rename = "is_downloaded")]
    pub is_downloaded: bool,
    #[serde(rename = "is_running")]
    pub is_running: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelRecommendation {
    pub model: ModelInfo,
    pub score: f64,
    pub can_run: bool,
    pub warnings: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceUsage {
    pub cpu_percent: f32,
    pub memory_used: u64,
    pub memory_total: u64,
    pub gpu_percent: Option<f64>,
    pub gpu_memory_used: Option<u64>,
    pub gpu_memory_total: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelStatus {
    pub running: bool,
    pub model_id: Option<String>,
    pub gpu_memory_bytes: Option<u64>,
    pub uptime_seconds: Option<u64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub model_id: String,
    pub bytes_downloaded: u64,
    pub total_bytes: u64,
    pub speed: u64,
    pub percent: f64,
}
