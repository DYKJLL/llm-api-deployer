export interface CpuInfo {
  name: string;
  cores: number;
  threads: number;
  frequencyMhz: number;
}

export interface GpuInfo {
  name: string;
  vendor: string;
  memoryBytes: number;
  driverVersion: string;
  computeCapability: [number, number] | null;
}

export interface MemoryInfo {
  totalBytes: number;
  availableBytes: number;
}

export interface DiskInfo {
  totalBytes: number;
  availableBytes: number;
  mountPoint: string;
}

export interface SystemConfig {
  cpu: CpuInfo;
  gpu: GpuInfo[];
  memory: MemoryInfo;
  disk: DiskInfo;
  timestamp: string;
}

export interface OllamaStatus {
  running: boolean;
  version: string | null;
  models: ModelInfo[];
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  sizeBytes: number;
  quantization: string;
  parameters: number;
  vramRequiredBytes: number;
  description: string;
  downloadUrl: string;
  lastUsed: string | null;
  isDownloaded: boolean;
  isRunning: boolean;
}

export interface ApiInfo {
  apiAddress: string;
  apiKey: string | null;
  modelId: string | null;
  provider: string;
  providerVersion: string | null;
  endpoints: Endpoint[];
}

export interface Endpoint {
  path: string;
  method: string;
  description: string;
}

export interface VerifyResult {
  success: boolean;
  apiReachable: boolean;
  modelResponsive: boolean;
  errorMessage: string | null;
}

export interface ResourceUsage {
  cpuPercent: number;
  memoryUsed: number;
  memoryTotal: number;
  gpuPercent: number | null;
  gpuMemoryUsed: number | null;
  gpuMemoryTotal: number | null;
}

export interface ModelStatus {
  running: boolean;
  modelId: string | null;
  gpuMemoryBytes: number | null;
  uptimeSeconds: number | null;
}

export interface ModelRecommendation {
  model: ModelInfo;
  score: number;
  canRun: boolean;
  warnings: string[];
}

export interface DownloadProgress {
  modelId: string;
  bytesDownloaded: number;
  totalBytes: number;
  speed: number;
  percent: number;
}

export interface AppConfig {
  version: string;
  settings: {
    modelStoragePath: string;
    language: string;
    autoStartOllama: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  customModelSources: ModelSource[];
  recentModels: string[];
}

export interface ModelSource {
  name: string;
  url: string;
  enabled: boolean;
}
