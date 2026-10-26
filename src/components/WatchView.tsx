import React, { useState } from 'react';
import type { YouTubeVideo, SavedVideoMeta } from '../types';
import { ArrowLeft, Heart, Clock, Tag, Save, ExternalLink } from 'lucide-react';

interface WatchViewProps {
  video: YouTubeVideo;
  onBack: () => void;
  savedMeta?: SavedVideoMeta;
  onSaveMeta: (meta: SavedVideoMeta) => void;
  isWatchLater: boolean;
  onToggleWatchLater: (videoId: string) => void;
  relatedVideos: YouTubeVideo[];
  onSelectVideo: (video: YouTubeVideo) => void;
  accentColor: string;
}

export const WatchView: React.FC<WatchViewProps> = ({
  video,
  onBack,
  savedMeta,
  onSaveMeta,
  isWatchLater,
  onToggleWatchLater,
  relatedVideos,
  onSelectVideo,
  accentColor,
}) => {
  const [notes, setNotes] = useState(savedMeta?.notes || '');
  const [tags, setTags] = useState<string[]>(savedMeta?.tags || []);
  const [newTagInput, setNewTagInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(savedMeta?.isFavorite || false);
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSaveNotes = () => {
    onSaveMeta({
      videoId: video.id,
      isFavorite,
      notes,
      tags,
      savedAt: savedMeta?.savedAt || Date.now(),
    });
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleToggleFavorite = () => {
    const nextFav = !isFavorite;
    setIsFavorite(nextFav);
    onSaveMeta({
      videoId: video.id,
      isFavorite: nextFav,
      notes,
      tags,
      savedAt: savedMeta?.savedAt || Date.now(),
    });
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim() || tags.includes(newTagInput.trim())) return;
    const updated = [...tags, newTagInput.trim()];
    setTags(updated);
    setNewTagInput('');
    onSaveMeta({
      videoId: video.id,
      isFavorite,
      notes,
      tags: updated,
      savedAt: savedMeta?.savedAt || Date.now(),
    });
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updated = tags.filter(t => t !== tagToRemove);
    setTags(updated);
    onSaveMeta({
      videoId: video.id,
      isFavorite,
      notes,
      tags: updated,
      savedAt: savedMeta?.savedAt || Date.now(),
    });
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-200 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Feed</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onToggleWatchLater(video.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors ${
              isWatchLater
                ? 'bg-purple-500/10 border-purple-500/30 text-purple-300'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{isWatchLater ? 'In Watch Later' : 'Watch Later'}</span>
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-medium transition-colors ${
              isFavorite
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-gray-900 border-gray-800 text-gray-300 hover:bg-gray-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${video.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-800 hover:bg-gray-800 text-gray-300 text-xs font-medium transition-colors"
            title="Open on YouTube website"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">YouTube.com</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&enablejsapi=1`}
              title={video.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <h1 className="text-xl font-bold text-gray-100 leading-snug">{video.title}</h1>
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-800 text-sm">
              <div>
                <h3 className="font-semibold text-gray-200">{video.channelTitle}</h3>
                <span className="text-xs text-gray-400">Published: {new Date(video.publishedAt).toLocaleDateString()}</span>
              </div>
              <div className="text-xs text-gray-400 font-mono">
                {video.viewCount ? `${video.viewCount} views` : 'Official Player API'}
              </div>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">{video.description}</p>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-200">Personal Notes & Tags</h2>
              {savedStatus && <span className="text-xs text-emerald-400 font-medium">Saved to IndexedDB!</span>}
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags & Categories
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-300 border border-purple-500/30"
                  >
                    <span>{tag}</span>
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-400 transition-colors ml-1 font-bold"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <form onSubmit={handleAddTag} className="inline-flex items-center">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    placeholder="+ Add tag..."
                    className="bg-gray-950 border border-gray-800 rounded-xl px-3 py-1 text-xs text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500"
                  />
                </form>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs text-gray-400 font-medium">Personal Notes / Timestamps</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Write private notes, key takeaways, or timestamps here..."
                className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-y"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all"
                style={{ backgroundColor: accentColor }}
              >
                <Save className="w-4 h-4" />
                <span>Save Notes</span>
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-bold text-gray-200">Related & Recommended</h2>
          <div className="space-y-3">
            {relatedVideos.map((rv) => (
              <div
                key={rv.id}
                onClick={() => onSelectVideo(rv)}
                className="flex gap-3 bg-gray-900 border border-gray-800 rounded-xl p-2.5 hover:border-gray-700 cursor-pointer transition-all group"
              >
                <img
                  src={rv.thumbnailUrl}
                  alt={rv.title}
                  className="w-28 aspect-video object-cover rounded-lg shrink-0 bg-gray-950"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-gray-200 line-clamp-2 group-hover:text-purple-300 transition-colors leading-snug mb-1">
                    {rv.title}
                  </h4>
                  <p className="text-[11px] text-gray-400 truncate">{rv.channelTitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
