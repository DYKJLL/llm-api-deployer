import { useEffect, useState } from 'react';
import { useAppStore } from '../store/appStore';
import type { ResourceUsage } from '../types';

export default function ResourceMonitor() {
  const { getResourceUsage, getModelStatus } = useAppStore();
  const [usage, setUsage] = useState<ResourceUsage | null>(null);
  const [modelUptime, setModelUptime] = useState<number | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const u = await getResourceUsage();
        setUsage(u);
        const status = await getModelStatus();
        setModelUptime(status.uptimeSeconds);
      } catch (e) {
        console.error('Failed to fetch resource usage:', e);
      }
    };

    fetchUsage();
    const interval = setInterval(fetchUsage, 2000);
    return () => clearInterval(interval);
  }, [getResourceUsage, getModelStatus]);

  const formatBytes = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    return gb.toFixed(2) + ' GB';
  };

  const formatUptime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">Resource Monitor</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-300">CPU</span>
            <span className="text-gray-800 dark:text-white">{usage?.cpuPercent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${usage?.cpuPercent || 0}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-300">Memory</span>
            <span className="text-gray-800 dark:text-white">
              {usage ? formatBytes(usage.memoryUsed) + ' / ' + formatBytes(usage.memoryTotal) : '-'}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: usage ? (usage.memoryUsed / usage.memoryTotal) * 100 : 0 }}
            />
          </div>
        </div>

        {usage?.gpuPercent !== null && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">GPU</span>
              <span className="text-gray-800 dark:text-white">{usage?.gpuPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${usage?.gpuPercent || 0}%` }}
              />
            </div>
          </div>
        )}

        {modelUptime !== null && (
          <div className="col-span-full">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-300">Model Uptime</span>
              <span className="text-gray-800 dark:text-white">{formatUptime(modelUptime)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
