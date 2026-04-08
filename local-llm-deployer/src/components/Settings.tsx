import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { invoke } from '@tauri-apps/api/core';
import type { AppConfig, ModelSource } from '../types';

export default function Settings() {
  const { t, i18n } = useTranslation();
  const [config, setConfig] = useState<AppConfig>({
    version: '1.0.0',
    settings: {
      modelStoragePath: '~/.ollama/models',
      language: i18n.language,
      autoStartOllama: true,
      theme: 'system',
    },
    customModelSources: [],
    recentModels: [],
  });
  const [newSource, setNewSource] = useState<ModelSource>({ name: '', url: '', enabled: true });
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    try {
      await invoke('save_config', { config });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error('Failed to save config:', e);
    }
  };

  const handleAddSource = () => {
    if (newSource.name && newSource.url) {
      setConfig({
        ...config,
        customModelSources: [...config.customModelSources, newSource],
      });
      setNewSource({ name: '', url: '', enabled: true });
    }
  };

  const handleRemoveSource = (index: number) => {
    setConfig({
      ...config,
      customModelSources: config.customModelSources.filter((_, i) => i !== index),
    });
  };

  const handleLanguageChange = (lang: string) => {
    setConfig({
      ...config,
      settings: { ...config.settings, language: lang },
    });
    i18n.changeLanguage(lang);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('settings.title')}</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('settings.modelStoragePath')}
          </label>
          <input
            type="text"
            value={config.settings.modelStoragePath}
            onChange={(e) => setConfig({
              ...config,
              settings: { ...config.settings, modelStoragePath: e.target.value },
            })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('settings.language')}
          </label>
          <select
            value={config.settings.language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="zh-CN">简体中文</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('settings.theme')}
          </label>
          <select
            value={config.settings.theme}
            onChange={(e) => setConfig({
              ...config,
              settings: { ...config.settings, theme: e.target.value as 'light' | 'dark' | 'system' },
            })}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            <option value="system">{t('settings.themeSystem')}</option>
            <option value="light">{t('settings.themeLight')}</option>
            <option value="dark">{t('settings.themeDark')}</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="autoStart"
            checked={config.settings.autoStartOllama}
            onChange={(e) => setConfig({
              ...config,
              settings: { ...config.settings, autoStartOllama: e.target.checked },
            })}
            className="w-4 h-4 text-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="autoStart" className="text-sm text-gray-700 dark:text-gray-300">
            {t('settings.autoStart')}
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">
          {t('settings.customSources')}
        </h3>

        <div className="space-y-3 mb-4">
          {config.customModelSources.map((source, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex-1">
                <p className="font-medium text-gray-800 dark:text-white">{source.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{source.url}</p>
              </div>
              <button
                onClick={() => handleRemoveSource(index)}
                className="px-3 py-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Source Name"
            value={newSource.name}
            onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <input
            type="text"
            placeholder="Source URL"
            value={newSource.url}
            onChange={(e) => setNewSource({ ...newSource, url: e.target.value })}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
          />
          <button
            onClick={handleAddSource}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('settings.addSource')}
          </button>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {saved ? t('common.success') : t('settings.save')}
        </button>
      </div>
    </div>
  );
}
