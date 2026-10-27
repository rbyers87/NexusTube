import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { VideoGrid } from './components/VideoGrid';
import { WatchView } from './components/WatchView';
import { LibraryView } from './components/LibraryView';
import { ScriptsView } from './components/ScriptsView';
import { ExtensionsView } from './components/ExtensionsView';
import { SettingsView } from './components/SettingsView';
import { DevToolsView } from './components/DevToolsView';
import { storage, DEFAULT_SETTINGS } from './services/storage';
import { searchYouTubeVideos, MOCK_VIDEOS } from './services/youtube';
import type { YouTubeVideo, SavedVideoMeta, Collection, Userscript, PluginItem, AppSettings } from './types';
import { Home, Library, History, Code2, Settings } from 'lucide-react';

export function App() {
  const [currentView, setCurrentView] = useState<string>('discover');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [videos, setVideos] = useState<YouTubeVideo[]>(MOCK_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isMock, setIsMock] = useState<boolean>(true);

  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [savedMetaMap, setSavedMetaMap] = useState<Record<string, SavedVideoMeta>>({});
  const [collections, setCollections] = useState<Collection[]>([]);
  const [watchLaterIds, setWatchLaterIds] = useState<string[]>([]);
  const [userscripts, setUserscripts] = useState<Userscript[]>([]);
  const [plugins, setPlugins] = useState<PluginItem[]>([]);

  useEffect(() => {
    async function loadData() {
      const s = await storage.getSettings();
      setSettings(s);
      setSidebarCollapsed(s.sidebarCollapsed);

      const meta = await storage.getSavedMetaMap();
      setSavedMetaMap(meta);

      const cols = await storage.getCollections();
      setCollections(cols);
      const watchLaterCol = cols.find(c => c.id === 'watch-later');
      if (watchLaterCol) {
        setWatchLaterIds(watchLaterCol.videoIds);
      }

      const scripts = await storage.getUserscripts();
      setUserscripts(scripts);

      const plugs = await storage.getPlugins();
      setPlugins(plugs);

      const res = await searchYouTubeVideos('', s.youtubeApiKey);
      setVideos(res.videos);
      setIsMock(res.isMock);
    }
    loadData();

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch((err) => {
          console.warn('Service worker registration failed:', err);
        });
      });
    }
  }, []);

  // Theme management effect
  useEffect(() => {
    const applyTheme = (themeMode: 'dark' | 'light' | 'system') => {
      const root = document.documentElement;
      if (themeMode === 'dark') {
        root.classList.add('dark');
      } else if (themeMode === 'light') {
        root.classList.remove('dark');
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    };

    applyTheme(settings.theme);

    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [settings.theme]);

  const handleSearchSubmit = async (query: string) => {
    const res = await searchYouTubeVideos(query, settings.youtubeApiKey);
    setVideos(res.videos);
    setIsMock(res.isMock);
    if (selectedVideo) setSelectedVideo(null);
    setCurrentView('discover');
  };

  const handleToggleFavorite = async (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const existing = savedMetaMap[videoId] || { videoId, isFavorite: false, notes: '', tags: [], savedAt: Date.now() };
    const updatedMeta: SavedVideoMeta = { ...existing, isFavorite: !existing.isFavorite };
    await storage.saveVideoMeta(updatedMeta);
    setSavedMetaMap(prev => ({ ...prev, [videoId]: updatedMeta }));
  };

  const handleToggleWatchLater = async (videoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const watchLaterCol = collections.find(c => c.id === 'watch-later') || {
      id: 'watch-later',
      name: 'Watch Later',
      description: 'Queued videos to watch',
      videoIds: [],
      createdAt: Date.now(),
    };

    const exists = watchLaterCol.videoIds.includes(videoId);
    const updatedIds = exists
      ? watchLaterCol.videoIds.filter(id => id !== videoId)
      : [...watchLaterCol.videoIds, videoId];

    const updatedCol = { ...watchLaterCol, videoIds: updatedIds };
    await storage.saveCollection(updatedCol);
    setWatchLaterIds(updatedIds);
    setCollections(prev => prev.map(c => c.id === updatedCol.id ? updatedCol : c));
  };

  const handleSaveMeta = async (meta: SavedVideoMeta) => {
    await storage.saveVideoMeta(meta);
    setSavedMetaMap(prev => ({ ...prev, [meta.videoId]: meta }));
  };

  const handleSaveSettings = async (newSettings: AppSettings) => {
    await storage.saveSettings(newSettings);
    setSettings(newSettings);
    setSidebarCollapsed(newSettings.sidebarCollapsed);
    if (newSettings.youtubeApiKey !== settings.youtubeApiKey) {
      const res = await searchYouTubeVideos(searchQuery, newSettings.youtubeApiKey);
      setVideos(res.videos);
      setIsMock(res.isMock);
    }
  };

  const handleSaveUserscript = async (script: Userscript) => {
    await storage.saveUserscript(script);
    const scripts = await storage.getUserscripts();
    setUserscripts(scripts);
  };

  const handleDeleteUserscript = async (id: string) => {
    await storage.deleteUserscript(id);
    const scripts = await storage.getUserscripts();
    setUserscripts(scripts);
  };

  const handleTogglePlugin = async (pluginId: string) => {
    const plugin = plugins.find(p => p.id === pluginId);
    if (!plugin) return;
    const updated = { ...plugin, enabled: !plugin.enabled };
    await storage.savePlugin(updated);
    const plugs = await storage.getPlugins();
    setPlugins(plugs);
  };

  const handleCreateCollection = async (name: string, description: string) => {
    const newCol: Collection = {
      id: 'col_' + Math.random().toString(36).substring(2, 9),
      name,
      description,
      videoIds: [],
      createdAt: Date.now(),
    };
    await storage.saveCollection(newCol);
    const cols = await storage.getCollections();
    setCollections(cols);
  };

  const handleExportData = async () => {
    const json = await storage.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexustube_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportData = async (jsonStr: string) => {
    const success = await storage.importAllData(jsonStr);
    if (success) {
      alert('Data restored successfully!');
      window.location.reload();
    } else {
      alert('Failed to restore data. Invalid backup file format.');
    }
  };

  const mobileNavItems = [
    { id: 'discover', label: 'Discover', icon: Home },
    { id: 'library', label: 'Library', icon: Library },
    { id: 'history', label: 'History', icon: History },
    { id: 'scripts', label: 'Scripts', icon: Code2 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 pb-20 md:pb-0 transition-colors">
      <div className="hidden md:flex">
        <Sidebar
          currentView={currentView}
          setCurrentView={(v) => {
            setSelectedVideo(null);
            setCurrentView(v);
          }}
          collapsed={sidebarCollapsed}
          setCollapsed={async (c) => {
            setSidebarCollapsed(c);
            await handleSaveSettings({ ...settings, sidebarCollapsed: c });
          }}
          accentColor={settings.accentColor}
        />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          apiKey={settings.youtubeApiKey}
          onOpenSettings={() => setCurrentView('settings')}
          isMock={isMock}
          accentColor={settings.accentColor}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto pb-24 md:pb-8">
          {selectedVideo ? (
            <WatchView
              video={selectedVideo}
              onBack={() => setSelectedVideo(null)}
              savedMeta={savedMetaMap[selectedVideo.id]}
              onSaveMeta={handleSaveMeta}
              isWatchLater={watchLaterIds.includes(selectedVideo.id)}
              onToggleWatchLater={handleToggleWatchLater}
              relatedVideos={videos.filter(v => v.id !== selectedVideo.id)}
              onSelectVideo={setSelectedVideo}
              accentColor={settings.accentColor}
            />
          ) : (
            <>
              {currentView === 'discover' && (
                <VideoGrid
                  videos={videos}
                  onSelectVideo={setSelectedVideo}
                  savedMetaMap={savedMetaMap}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleWatchLater={handleToggleWatchLater}
                  watchLaterIds={watchLaterIds}
                  gridColumns={settings.gridColumns}
                  isMock={isMock}
                  accentColor={settings.accentColor}
                />
              )}
              {currentView === 'library' && (
                <LibraryView
                  collections={collections}
                  savedMetaMap={savedMetaMap}
                  allVideos={[...videos, ...MOCK_VIDEOS]}
                  onSelectVideo={setSelectedVideo}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleWatchLater={handleToggleWatchLater}
                  watchLaterIds={watchLaterIds}
                  onCreateCollection={handleCreateCollection}
                  onExportData={handleExportData}
                  onImportData={handleImportData}
                  accentColor={settings.accentColor}
                />
              )}
              {currentView === 'history' && (
                <div className="space-y-6">
                  <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white">Watch History</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Recently played videos stored locally.</p>
                  </div>
                  <VideoGrid
                    videos={videos.slice(0, 4)}
                    onSelectVideo={setSelectedVideo}
                    savedMetaMap={savedMetaMap}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleWatchLater={handleToggleWatchLater}
                    watchLaterIds={watchLaterIds}
                    gridColumns={settings.gridColumns}
                    isMock={isMock}
                    accentColor={settings.accentColor}
                  />
                </div>
              )}
              {currentView === 'scripts' && (
                <ScriptsView
                  scripts={userscripts}
                  onSaveScript={handleSaveUserscript}
                  onDeleteScript={handleDeleteUserscript}
                  accentColor={settings.accentColor}
                />
              )}
              {currentView === 'extensions' && (
                <ExtensionsView
                  plugins={plugins}
                  onTogglePlugin={handleTogglePlugin}
                  accentColor={settings.accentColor}
                />
              )}
              {currentView === 'settings' && (
                <SettingsView
                  settings={settings}
                  onSaveSettings={handleSaveSettings}
                  accentColor={settings.accentColor}
                />
              )}
              {currentView === 'devtools' && (
                <DevToolsView accentColor={settings.accentColor} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <nav aria-label="Mobile Navigation" className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-40 px-2 py-2 flex items-center justify-around shadow-2xl">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setSelectedVideo(null);
                setCurrentView(item.id);
              }}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-colors ${
                isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive ? 'shadow-md' : ''
                }`}
                style={isActive ? { backgroundColor: settings.accentColor } : {}}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
export default App;
