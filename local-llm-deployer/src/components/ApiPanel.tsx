import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/appStore';
import type { VerifyResult } from '../types';

interface Props {
  onVerified?: () => void;
}

export default function ApiPanel({ onVerified }: Props) {
  const { t } = useTranslation();
  const { apiInfo, generateApiInfo, verifyApiInfo } = useAppStore();
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    const result = await verifyApiInfo();
    setVerifyResult(result);
    setIsVerifying(false);
    if (result.success && onVerified) {
      onVerified();
    }
  };

  const handleCopyConfig = async () => {
    if (!apiInfo) return;

    const config = {
      apiAddress: apiInfo.apiAddress,
      apiKey: apiInfo.apiKey,
      modelId: apiInfo.modelId,
      provider: apiInfo.provider,
      providerVersion: apiInfo.providerVersion,
      endpoints: apiInfo.endpoints.map((e) => ({
        path: e.path,
        method: e.method,
        description: e.description,
      })),
    };

    await navigator.clipboard.writeText(JSON.stringify(config, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!apiInfo) {
    generateApiInfo();
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('dashboard.apiInfo')}</h3>
        <p className="text-gray-600 dark:text-gray-300">Loading API information...</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-4">{t('dashboard.apiInfo')}</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">API Address</label>
            <p className="font-mono text-sm text-gray-800 dark:text-white">{apiInfo.apiAddress}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Provider</label>
            <p className="text-sm text-gray-800 dark:text-white">{apiInfo.provider}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Model ID</label>
            <p className="font-mono text-sm text-gray-800 dark:text-white">{apiInfo.modelId || '-'}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">Version</label>
            <p className="text-sm text-gray-800 dark:text-white">{apiInfo.providerVersion || '-'}</p>
          </div>
        </div>

        <div>
          <label className="text-sm text-gray-500 dark:text-gray-400 mb-2 block">Endpoints</label>
          <div className="space-y-2">
            {apiInfo.endpoints.map((endpoint) => (
              <div key={endpoint.path} className="flex items-center gap-2 text-sm">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  endpoint.method === 'GET'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                }`}>
                  {endpoint.method}
                </span>
                <span className="font-mono text-gray-800 dark:text-white">{endpoint.path}</span>
                <span className="text-gray-500 dark:text-gray-400">- {endpoint.description}</span>
              </div>
            ))}
          </div>
        </div>

        {verifyResult && (
          <div className={`p-4 rounded-lg ${
            verifyResult.success
              ? 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200'
              : 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'
          }`}>
            <div className="font-medium">
              {verifyResult.success ? 'API Verified Successfully' : 'API Verification Failed'}
            </div>
            {verifyResult.errorMessage && (
              <div className="text-sm mt-1">{verifyResult.errorMessage}</div>
            )}
            <div className="text-sm mt-2">
              <div>API Reachable: {verifyResult.apiReachable ? 'Yes' : 'No'}</div>
              <div>Model Responsive: {verifyResult.modelResponsive ? 'Yes' : 'No'}</div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isVerifying ? 'Verifying...' : t('dashboard.verifyApi')}
          </button>
          <button
            onClick={handleCopyConfig}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {copied ? 'Copied!' : t('dashboard.copyConfig')}
          </button>
        </div>
      </div>
    </div>
  );
}
