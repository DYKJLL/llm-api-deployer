import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useModelStore } from '../store/modelStore';
import DownloadProgress from './DownloadProgress';

export default function ModelList() {
  const { t } = useTranslation();
  const { models, fetchModels, downloadModel, startModel, stopModel, deleteModel, isDownloading, currentDownload } = useModelStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<'all' | 'downloaded' | 'running'>('all');

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const filteredModels = models.filter((model) => {
    const matchesSearch = model.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      model.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filter === 'all' ||
      (filter === 'downloaded' && model.isDownloaded) ||
      (filter === 'running' && model.isRunning);
    return matchesSearch && matchesFilter;
  });

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb >= 1) return gb.toFixed(2) + ' GB';
    const mb = bytes / (1024 * 1024);
    return mb.toFixed(2) + ' MB';
  };

  const formatParameters = (params: number) => {
    if (params >= 1e9) return (params / 1e9).toFixed(1) + 'B';
    if (params >= 1e6) return (params / 1e6).toFixed(1) + 'M';
    return params.toString();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{t('models.title')}</h2>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder={t('models.search')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
        >
          <option value="all">{t('models.all')}</option>
          <option value="downloaded">{t('models.downloaded')}</option>
          <option value="running">{t('models.running')}</option>
        </select>
      </div>

      {isDownloading && currentDownload && (
        <DownloadProgress progress={currentDownload} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filteredModels.map((model) => (
          <div
            key={model.id}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow p-4 ${
              model.isRunning ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-medium text-gray-800 dark:text-white">{model.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{model.id}</p>
              </div>
              <div className="flex gap-2">
                {model.isRunning ? (
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded">
                    {t('models.running')}
                  </span>
                ) : model.isDownloaded ? (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded">
                    {t('models.downloaded')}
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs rounded">
                    {t('models.notDownloaded')}
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              {model.description}
            </p>

            <div className="grid grid-cols-3 gap-2 text-sm mb-4">
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t('models.parameters')}</span>
                <p className="text-gray-800 dark:text-white font-medium">{formatParameters(model.parameters)}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t('models.size')}</span>
                <p className="text-gray-800 dark:text-white font-medium">{formatBytes(model.sizeBytes)}</p>
              </div>
              <div>
                <span className="text-gray-500 dark:text-gray-400">{t('models.vramRequired')}</span>
                <p className="text-gray-800 dark:text-white font-medium">
                  {model.vramRequiredBytes > 0 ? formatBytes(model.vramRequiredBytes) : '-'}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              {!model.isDownloaded ? (
                <button
                  onClick={() => downloadModel(model.id)}
                  disabled={isDownloading}
                  className="flex-1 px-3 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors disabled:opacity-50"
                >
                  {t('models.download')}
                </button>
              ) : model.isRunning ? (
                <>
                  <button
                    onClick={stopModel}
                    className="flex-1 px-3 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    {t('models.stop')}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startModel(model.id)}
                    className="flex-1 px-3 py-1.5 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    {t('models.start')}
                  </button>
                  <button
                    onClick={() => deleteModel(model.id)}
                    className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white text-sm rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    {t('models.delete')}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredModels.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">{t('models.noModels')}</p>
        </div>
      )}
    </div>
  );
}
