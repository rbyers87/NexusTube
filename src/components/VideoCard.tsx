import React from 'react';
import type { YouTubeVideo, SavedVideoMeta } from '../types';
import { Play, Heart, Clock } from 'lucide-react';

interface VideoCardProps {
  video: YouTubeVideo;
  onSelectVideo: (video: YouTubeVideo) => void;
  savedMeta?: SavedVideoMeta;
  onToggleFavorite: (videoId: string, e: React.MouseEvent) => void;
  onToggleWatchLater: (videoId: string, e: React.MouseEvent) => void;
  isWatchLater?: boolean;
  accentColor: string;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onSelectVideo,
  savedMeta,
  onToggleFavorite,
  onToggleWatchLater,
  isWatchLater,
  accentColor,
}) => {
  const isFav = savedMeta?.isFavorite || false;

  return (
    <div
      onClick={() => onSelectVideo(video)}
      className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden group hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-xl cursor-pointer flex flex-col"
    >
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-950 overflow-hidden">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div
            className="w-12 h-12 rounded-full text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform"
            style={{ backgroundColor: accentColor }}
          >
            <Play className="w-5 h-5 fill-current ml-0.5" />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-xs px-2 py-0.5 rounded font-mono">
            {video.duration}
          </span>
        )}
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors leading-snug mb-1">
            {video.title}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{video.channelTitle}</p>
        </div>

        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-800/80 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{video.viewCount ? `${video.viewCount} views` : 'Public Video'}</span>
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={(e) => onToggleWatchLater(video.id, e)}
              className={`p-1.5 rounded-lg transition-colors ${
                isWatchLater ? 'text-purple-600 dark:text-purple-400 bg-purple-500/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title={isWatchLater ? 'In Watch Later' : 'Add to Watch Later'}
            >
              <Clock className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => onToggleFavorite(video.id, e)}
              className={`p-1.5 rounded-lg transition-colors ${
                isFav ? 'text-rose-500 bg-rose-500/10' : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              title={isFav ? 'Favorited' : 'Add to Favorites'}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
