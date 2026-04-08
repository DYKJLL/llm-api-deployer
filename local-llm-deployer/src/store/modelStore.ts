import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';
import type { ModelInfo, ModelRecommendation, DownloadProgress } from '../types';

interface ModelState {
  models: ModelInfo[];
  recommendations: ModelRecommendation[];
  currentDownload: DownloadProgress | null;
  isDownloading: boolean;
  error: string | null;

  fetchModels: () => Promise<void>;
  getRecommendations: () => Promise<void>;
  downloadModel: (modelId: string) => Promise<void>;
  startModel: (modelId: string) => Promise<void>;
  stopModel: () => Promise<void>;
  switchModel: (modelId: string) => Promise<void>;
  deleteModel: (modelId: string) => Promise<void>;
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: [],
  recommendations: [],
  currentDownload: null,
  isDownloading: false,
  error: null,

  fetchModels: async () => {
    try {
      const models = await invoke<ModelInfo[]>('get_model_list');
      set({ models });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  getRecommendations: async () => {
    try {
      const recommendations = await invoke<ModelRecommendation[]>('get_recommendations');
      set({ recommendations });
    } catch (e) {
      set({ error: String(e) });
    }
  },

  downloadModel: async (modelId: string) => {
    set({ isDownloading: true, error: null, currentDownload: { modelId, bytesDownloaded: 0, totalBytes: 0, speed: 0, percent: 0 } });
    try {
      await invoke('download_model', { modelId });
      set({ isDownloading: false, currentDownload: null });
      await get().fetchModels();
    } catch (e) {
      set({ error: String(e), isDownloading: false, currentDownload: null });
    }
  },

  startModel: async (modelId: string) => {
    try {
      await invoke('start_model', { modelId });
      await get().fetchModels();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  stopModel: async () => {
    try {
      await invoke('stop_model');
      await get().fetchModels();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  switchModel: async (modelId: string) => {
    try {
      await invoke('switch_model', { newModelId: modelId });
      await get().fetchModels();
    } catch (e) {
      set({ error: String(e) });
    }
  },

  deleteModel: async (modelId: string) => {
    try {
      await invoke('delete_model', { modelId });
      await get().fetchModels();
    } catch (e) {
      set({ error: String(e) });
    }
  },
}));
