import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import { useModelStore } from '../store/modelStore';
import ApiPanel from './ApiPanel';
import ResourceMonitor from './ResourceMonitor';

export default function Dashboard() {
  const { t } = useTranslation();
  const { systemConfig, ollamaStatus, getOllamaStatus, installOllama, startOllama, stopOllama } = useAppStore();
  const { recommendations, getRecommendations } = useModelStore();

  useEffect(() => {
    getOllamaStatus();
    getRecommendations();
  }, [getOllamaStatus, getRecommendations]);

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('dashboard.systemInfo')}</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.cpu')}</h3>
          <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
            {systemConfig?.cpu.name || '-'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {systemConfig?.cpu.cores} {t('dashboard.cores') || 'cores'} / {systemConfig?.cpu.threads} threads
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.memory')}</h3>
          <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
            {systemConfig ? formatBytes(systemConfig.memory.totalBytes) : '-'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {systemConfig ? formatBytes(systemConfig.memory.availableBytes) + ' ' + t('dashboard.available') || 'available' : ''}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.gpu')}</h3>
          {systemConfig?.gpu && systemConfig.gpu.length > 0 ? (
            systemConfig.gpu.map((gpu, idx) => (
              <div key={idx}>
                <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">{gpu.name}</p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {formatBytes(gpu.memoryBytes)} VRAM
                </p>
              </div>
            ))
          ) : (
            <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">-</p>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('dashboard.disk')}</h3>
          <p className="mt-1 text-lg font-semibold text-gray-800 dark:text-white">
            {systemConfig ? formatBytes(systemConfig.disk.totalBytes) : '-'}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {systemConfig ? formatBytes(systemConfig.disk.availableBytes) + ' ' + t('dashboard.available') || 'available' : ''}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('dashboard.ollamaStatus')}</h3>
        <div className="flex items-center gap-4">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            ollamaStatus?.running
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {ollamaStatus?.running ? t('dashboard.running') : t('dashboard.stopped')}
          </span>
          {ollamaStatus?.version && (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {t('dashboard.version')}: {ollamaStatus.version}
            </span>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          {!ollamaStatus?.running ? (
            <>
              {!ollamaStatus?.version ? (
                <button
                  onClick={installOllama}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {t('dashboard.installOllama')}
                </button>
              ) : (
                <button
                  onClick={startOllama}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  {t('dashboard.startOllama')}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={stopOllama}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              {t('dashboard.stopOllama')}
            </button>
          )}
        </div>
      </div>

      {ollamaStatus?.running && (
        <>
          <ResourceMonitor />
          <ApiPanel />
        </>
      )}

      {recommendations.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('dashboard.recommendations')}</h3>
          <div className="space-y-3">
            {recommendations.slice(0, 5).map((rec) => (
              <div
                key={rec.model.id}
                className={`p-4 rounded-lg border ${
                  rec.canRun
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-800 dark:text-white">{rec.model.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{rec.model.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rec.canRun
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {rec.canRun ? 'Recommended' : 'May have limitations'}
                  </span>
                </div>
                {rec.warnings.length > 0 && (
                  <div className="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
                    {rec.warnings.join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
