import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { SystemConfig, OllamaStatus, ApiInfo, VerifyResult, ResourceUsage, ModelStatus } from '../types';

interface AppState {
  systemConfig: SystemConfig | null;
  ollamaStatus: OllamaStatus | null;
  apiInfo: ApiInfo | null;
  isLoading: boolean;
  error: string | null;

  detectSystemConfig: () => Promise<void>;
  getOllamaStatus: () => Promise<void>;
  installOllama: () => Promise<void>;
  startOllama: () => Promise<void>;
  stopOllama: () => Promise<void>;
  generateApiInfo: () => Promise<void>;
  verifyApiInfo: () => Promise<VerifyResult>;
  getResourceUsage: () => Promise<ResourceUsage>;
  getModelStatus: () => Promise<ModelStatus>;
}

export const useAppStore = create<AppState>((set, get) => ({
  systemConfig: null,
  ollamaStatus: null,
  apiInfo: null,
  isLoading: false,
  error: null,

  detectSystemConfig: async () => {
    set({ isLoading: true, error: null });
    try {
      const config = await invoke<SystemConfig>('detect_system_config');
      set({ systemConfig: config, isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  getOllamaStatus: async () => {
    try {
      const status = await invoke<OllamaStatus>('get_ollama_status');
      set({ ollamaStatus: status });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  installOllama: async () => {
    set({ isLoading: true, error: null });
    try {
      await invoke('install_ollama');
      await get().getOllamaStatus();
      set({ isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  startOllama: async () => {
    set({ isLoading: true, error: null });
    try {
      await invoke('start_ollama');
      await get().getOllamaStatus();
      set({ isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  stopOllama: async () => {
    set({ isLoading: true, error: null });
    try {
      await invoke('stop_ollama');
      await get().getOllamaStatus();
      set({ isLoading: false });
    } catch (e) {
      set({ error: String(e), isLoading: false });
    }
  },

  generateApiInfo: async () => {
    try {
      const info = await invoke<ApiInfo>('generate_api_info');
      set({ apiInfo: info });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  verifyApiInfo: async () => {
    try {
      const result = await invoke<VerifyResult>('verify_api_info');
      return result;
    } catch (e) {
      set({ error: String(e) });
      return { success: false, apiReachable: false, modelResponsive: false, errorMessage: String(e) };
    }
  },

  getResourceUsage: async () => {
    try {
      const usage = await invoke<ResourceUsage>('get_resource_usage');
      return usage;
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },

  getModelStatus: async () => {
    try {
      const status = await invoke<ModelStatus>('get_model_status');
      return status;
    } catch (e) {
      set({ error: String(e) });
      throw e;
    }
  },
}));
