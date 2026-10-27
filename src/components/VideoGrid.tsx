import React from 'react';
import type { YouTubeVideo, SavedVideoMeta } from '../types';
import { VideoCard } from './VideoCard';
import { Sparkles, Film } from 'lucide-react';

interface VideoGridProps {
  videos: YouTubeVideo[];
  onSelectVideo: (video: YouTubeVideo) => void;
  savedMetaMap: Record<string, SavedVideoMeta>;
  onToggleFavorite: (videoId: string, e: React.MouseEvent) => void;
  onToggleWatchLater: (videoId: string, e: React.MouseEvent) => void;
  watchLaterIds: string[];
  gridColumns: number;
  isMock: boolean;
  accentColor: string;
}

export const VideoGrid: React.FC<VideoGridProps> = ({
  videos,
  onSelectVideo,
  savedMetaMap,
  onToggleFavorite,
  onToggleWatchLater,
  watchLaterIds,
  gridColumns,
  isMock,
  accentColor,
}) => {
  const getGridClass = (cols: number) => {
    switch (cols) {
      case 2: return 'grid-cols-1 sm:grid-cols-2';
      case 4: return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 3:
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    }
  };

  return (
    <div className="space-y-6">
      {isMock && (
        <div
          className="rounded-2xl p-6 relative overflow-hidden text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl border border-gray-200 dark:border-gray-800"
          style={{ background: `linear-gradient(135deg, #1f2028 0%, #111827 100%)` }}
        >
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NexusTube PWA Experience</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Your Independent YouTube Platform</h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              Explore public videos, organize favorites in local IndexedDB, run sandboxed userscripts, and customize every layout parameter without ads or tracking.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-3">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg text-white"
              style={{ backgroundColor: accentColor }}
            >
              <Film className="w-8 h-8" />
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
          {isMock ? 'Curated Discover Feed' : 'Search Results'} ({videos.length})
        </h2>
      </div>

      {videos.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm">
          <Film className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">No videos found</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try searching for a different keyword or topic.</p>
        </div>
      ) : (
        <div className={`grid ${getGridClass(gridColumns)} gap-6`}>
          {videos.map((video) => (
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
  );
};
