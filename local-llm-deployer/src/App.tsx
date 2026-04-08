import { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import ModelList from './components/ModelList';
import { useAppStore } from './store/appStore';
import { useTranslation } from 'react-i18next';

function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'models' | 'settings'>('dashboard');
  const { detectSystemConfig, isLoading } = useAppStore();
  const { t } = useTranslation();

  useEffect(() => {
    detectSystemConfig();
  }, [detectSystemConfig]);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 p-4">
        <h1 className="text-xl font-bold text-gray-800 dark:text-white mb-8">
          {t('app.title')}
        </h1>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t('nav.dashboard')}
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentView('models')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                currentView === 'models'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t('nav.models')}
            </button>
          </li>
          <li>
            <button
              onClick={() => setCurrentView('settings')}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                currentView === 'settings'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {t('nav.settings')}
            </button>
          </li>
        </ul>
      </nav>

      <main className="flex-1 overflow-auto p-6">
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        {!isLoading && currentView === 'dashboard' && <Dashboard />}
        {!isLoading && currentView === 'models' && <ModelList />}
        {!isLoading && currentView === 'settings' && <Settings />}
      </main>
    </div>
  );
}

export default App;
