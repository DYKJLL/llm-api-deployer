import type { DownloadProgress as DownloadProgressType } from '../types';

interface Props {
  progress: DownloadProgressType;
}

export default function DownloadProgress({ progress }: Props) {
  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return (mb / 1024).toFixed(2) + ' GB';
    }
    return mb.toFixed(2) + ' MB';
  };

  const formatSpeed = (bytesPerSecond: number) => {
    const mb = bytesPerSecond / (1024 * 1024);
    if (mb >= 1) {
      return mb.toFixed(2) + ' MB/s';
    }
    return (bytesPerSecond / 1024).toFixed(2) + ' KB/s';
  };

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
          正在下载: {progress.modelId}
        </span>
        <span className="text-sm text-blue-600 dark:text-blue-300">
          {progress.percent.toFixed(1)}%
        </span>
      </div>
      <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mb-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-blue-600 dark:text-blue-300">
        <span>
          {formatBytes(progress.bytesDownloaded)} / {formatBytes(progress.totalBytes)}
        </span>
        <span>{formatSpeed(progress.speed)}</span>
      </div>
    </div>
  );
}
