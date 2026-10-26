export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelTitle: string;
  channelId: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
}

export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  videoIds: string[];
  createdAt: number;
}

export interface WatchHistoryItem {
  videoId: string;
  video: YouTubeVideo;
  watchedAt: number;
  progressSeconds: number;
  durationSeconds: number;
  completed: boolean;
}

export interface SavedVideoMeta {
  videoId: string;
  isFavorite: boolean;
  notes: string;
  tags: string[];
  savedAt: number;
}

export interface Userscript {
  id: string;
  name: string;
  namespace?: string;
  version: string;
  description: string;
  code: string;
  enabled: boolean;
  match: string[];
  grant: string[];
  runAt: 'document-start' | 'document-end' | 'document-idle';
  permissions: string[];
  logs: { timestamp: number; type: 'log' | 'error' | 'warn'; message: string }[];
  lastModified: number;
}

export interface PluginItem {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  enabled: boolean;
  permissions: string[];
  settings: Record<string, any>;
  type: 'builtin' | 'community';
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  accentColor: string;
  density: 'compact' | 'comfortable' | 'spacious';
  sidebarCollapsed: boolean;
  gridColumns: number;
  youtubeApiKey: string;
  autoplay: boolean;
  featuredContentEnabled: boolean;
}
