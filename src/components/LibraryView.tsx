import React, { useState } from 'react';
import type { Collection, SavedVideoMeta, YouTubeVideo } from '../types';
import { VideoCard } from './VideoCard';
import { Library, Heart, Clock, FolderPlus, Download, Upload } from 'lucide-react';

interface LibraryViewProps {
  collections: Collection[];
  savedMetaMap: Record<string, SavedVideoMeta>;
  allVideos: YouTubeVideo[];
  onSelectVideo: (video: YouTubeVideo) => void;
  onToggleFavorite: (videoId: string, e: React.MouseEvent) => void;
  onToggleWatchLater: (videoId: string, e: React.MouseEvent) => void;
  watchLaterIds: string[];
  onCreateCollection: (name: string, description: string) => void;
  onExportData: () => void;
  onImportData: (jsonStr: string) => void;
  accentColor: string;
}

export const LibraryView: React.FC<LibraryViewProps> = ({
  collections,
  savedMetaMap,
  allVideos,
  onSelectVideo,
  onToggleFavorite,
  onToggleWatchLater,
  watchLaterIds,
  onCreateCollection,
  onExportData,
  onImportData,
  accentColor,
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchLater' | 'collections'>('favorites');
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [showNewColModal, setShowNewColModal] = useState(false);

  const favoriteVideoIds = Object.entries(savedMetaMap)
    .filter(([_, meta]) => meta.isFavorite)
    .map(([id]) => id);

  const favoriteVideos = allVideos.filter(v => favoriteVideoIds.includes(v.id));
  const watchLaterVideos = allVideos.filter(v => watchLaterIds.includes(v.id));

  const handleCreateColSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    onCreateCollection(newColName.trim(), newColDesc.trim());
    setNewColName('');
    setNewColDesc('');
    setShowNewColModal(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) onImportData(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Library className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Personal Content Library</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your favorites, watch later queue, and local IndexedDB backups.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onExportData}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold border border-gray-300 dark:border-gray-700 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Backup Data</span>
          </button>
          <label className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 text-xs font-semibold border border-gray-300 dark:border-gray-700 transition-colors shadow-sm cursor-pointer">
            <Upload className="w-4 h-4" />
            <span>Restore Backup</span>
            <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab('favorites')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'favorites' ? 'text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          style={activeTab === 'favorites' ? { backgroundColor: accentColor } : {}}
        >
          <Heart className="w-4 h-4" />
          <span>Favorites ({favoriteVideos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('watchLater')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'watchLater' ? 'text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          style={activeTab === 'watchLater' ? { backgroundColor: accentColor } : {}}
        >
          <Clock className="w-4 h-4" />
          <span>Watch Later ({watchLaterVideos.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('collections')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            activeTab === 'collections' ? 'text-white shadow-md' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
          style={activeTab === 'collections' ? { backgroundColor: accentColor } : {}}
        >
          <Library className="w-4 h-4" />
          <span>Collections ({collections.length})</span>
        </button>
      </div>

      {activeTab === 'favorites' && (
        <div className="space-y-4">
          {favoriteVideos.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
              <Heart className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-300">No favorite videos yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click the heart icon on any video card to add it to favorites.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteVideos.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onSelectVideo={onSelectVideo}
                  savedMeta={savedMetaMap[video.id]}
                  onToggleFavorite={onToggleFavorite}
                  onToggleWatchLater={onToggleWatchLater}
                  isWatchLater={watchLaterIds.includes(video.id)}
                  accentColor={accentColor}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'watchLater' && (
        <div className="space-y-4">
          {watchLaterVideos.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
              <Clock className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-300">Your Watch Later queue is empty</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Click the clock icon on any video card to save it for later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchLaterVideos.map(video => (
                <VideoCard
                  key={video.id}
                  video={video}
                  onSelectVideo={onSelectVideo}
                  savedMeta={savedMetaMap[video.id]}
                  onToggleFavorite={onToggleFavorite}
                  onToggleWatchLater={onToggleWatchLater}
                  isWatchLater={watchLaterIds.includes(video.id)}
                  accentColor={accentColor}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'collections' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-base font-bold text-gray-900 dark:text-gray-200">Custom Collections</h2>
            <button
              onClick={() => setShowNewColModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all"
              style={{ backgroundColor: accentColor }}
            >
              <FolderPlus className="w-4 h-4" />
              <span>New Collection</span>
            </button>
          </div>

          {showNewColModal && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Create New Collection</h3>
              <form onSubmit={handleCreateColSubmit} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 block">Collection Name</label>
                  <input
                    type="text"
                    value={newColName}
                    onChange={(e) => setNewColName(e.target.value)}
                    placeholder="e.g. TypeScript Masterclass, Coding Chill"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 block">Description</label>
                  <input
                    type="text"
                    value={newColDesc}
                    onChange={(e) => setNewColDesc(e.target.value)}
                    placeholder="Optional description..."
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewColModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    Create Collection
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {collections.map(col => (
              <div key={col.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-lg flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{col.name}</h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{col.videoIds.length} videos</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{col.description || 'No description provided.'}</p>
                </div>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                  <span>Created {new Date(col.createdAt).toLocaleDateString()}</span>
                  <span className="text-purple-600 dark:text-purple-400 font-medium">Local IndexedDB</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
