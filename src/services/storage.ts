import type { Collection, WatchHistoryItem, SavedVideoMeta, Userscript, PluginItem, AppSettings } from '../types';

const DB_NAME = 'NexusTubeDB';
const DB_VERSION = 1;

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  accentColor: '#c084fc',
  density: 'comfortable',
  sidebarCollapsed: false,
  gridColumns: 3,
  youtubeApiKey: '',
  autoplay: true,
  featuredContentEnabled: true,
  sponsorBlockEnabled: true,
};

export const DEFAULT_PLUGINS: PluginItem[] = [
  {
    id: 'sponsor-block-lite',
    name: 'SponsorBlock Lite',
    version: '1.0.0',
    description: 'Local reminder and marker plugin for skipping intro segments in custom player.',
    author: 'NexusTube Team',
    enabled: true,
    permissions: ['player:control', 'ui:overlay'],
    settings: { skipIntros: true },
    type: 'builtin',
  },
  {
    id: 'quick-notes-widget',
    name: 'Quick Notes Widget',
    version: '1.2.0',
    description: 'Adds a sidebar notepad for jotting down timestamps while watching.',
    author: 'NexusTube Team',
    enabled: true,
    permissions: ['storage:local', 'ui:sidebar'],
    settings: { autoSave: true },
    type: 'builtin',
  },
];

export const DEFAULT_USERSCRIPTS: Userscript[] = [
  {
    id: 'sample-script-1',
    name: 'NexusTube Dark Dimmer',
    namespace: 'https://nexustube.local',
    version: '1.1',
    description: 'Dims background lights and highlights active video cards during playback.',
    enabled: false,
    match: ['*://*/*'],
    grant: ['GM_getValue', 'GM_setValue', 'GM_notification'],
    runAt: 'document-end',
    permissions: ['dom:read'],
    code: `// ==UserScript==
// @name         NexusTube Dark Dimmer
// @namespace    https://nexustube.local
// @version      1.1
// @description  Dims background lights and highlights active video cards during playback.
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

(function() {
    'use strict';
    console.log('[NexusTube Userscript] Dark Dimmer loaded successfully.');
})();`,
    logs: [
      { timestamp: Date.now() - 3600000, type: 'log', message: 'Script initialized successfully in sandbox.' }
    ],
    lastModified: Date.now() - 3600000,
  },
];

class StorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.indexedDB) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('settings')) {
            db.createObjectStore('settings');
          }
          if (!db.objectStoreNames.contains('history')) {
            db.createObjectStore('history', { keyPath: 'videoId' });
          }
          if (!db.objectStoreNames.contains('savedMeta')) {
            db.createObjectStore('savedMeta', { keyPath: 'videoId' });
          }
          if (!db.objectStoreNames.contains('collections')) {
            db.createObjectStore('collections', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('userscripts')) {
            db.createObjectStore('userscripts', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('plugins')) {
            db.createObjectStore('plugins', { keyPath: 'id' });
          }
        };
      });
    }
  }

  private async getDB(): Promise<IDBDatabase | null> {
    if (!this.dbPromise) return null;
    try {
      return await this.dbPromise;
    } catch {
      return null;
    }
  }

  async getSettings(): Promise<AppSettings> {
    const db = await this.getDB();
    if (!db) {
      const saved = localStorage.getItem('nexustube_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    }
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readonly');
      const store = tx.objectStore('settings');
      const req = store.get('app_settings');
      req.onsuccess = () => resolve(req.result ? { ...DEFAULT_SETTINGS, ...req.result } : DEFAULT_SETTINGS);
      req.onerror = () => resolve(DEFAULT_SETTINGS);
    });
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    localStorage.setItem('nexustube_settings', JSON.stringify(settings));
    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('settings', 'readwrite');
      const store = tx.objectStore('settings');
      store.put(settings, 'app_settings');
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async getHistory(): Promise<WatchHistoryItem[]> {
    const db = await this.getDB();
    if (!db) {
      const saved = localStorage.getItem('nexustube_history');
      return saved ? JSON.parse(saved) : [];
    }
    return new Promise((resolve) => {
      const tx = db.transaction('history', 'readonly');
      const store = tx.objectStore('history');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => resolve([]);
    });
  }

  async addHistoryItem(item: WatchHistoryItem): Promise<void> {
    const db = await this.getDB();
    const history = await this.getHistory();
    const updated = [item, ...history.filter(h => h.videoId !== item.videoId)].slice(0, 200);
    localStorage.setItem('nexustube_history', JSON.stringify(updated));

    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      store.put(item);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async clearHistory(): Promise<void> {
    localStorage.removeItem('nexustube_history');
    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('history', 'readwrite');
      const store = tx.objectStore('history');
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async getSavedMetaMap(): Promise<Record<string, SavedVideoMeta>> {
    const db = await this.getDB();
    if (!db) {
      const saved = localStorage.getItem('nexustube_saved_meta');
      return saved ? JSON.parse(saved) : {};
    }
    return new Promise((resolve) => {
      const tx = db.transaction('savedMeta', 'readonly');
      const store = tx.objectStore('savedMeta');
      const req = store.getAll();
      req.onsuccess = () => {
        const list: SavedVideoMeta[] = req.result || [];
        const map: Record<string, SavedVideoMeta> = {};
        list.forEach(m => { map[m.videoId] = m; });
        resolve(map);
      };
      req.onerror = () => resolve({});
    });
  }

  async saveVideoMeta(meta: SavedVideoMeta): Promise<void> {
    const map = await this.getSavedMetaMap();
    map[meta.videoId] = meta;
    localStorage.setItem('nexustube_saved_meta', JSON.stringify(map));

    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('savedMeta', 'readwrite');
      const store = tx.objectStore('savedMeta');
      store.put(meta);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async getCollections(): Promise<Collection[]> {
    const db = await this.getDB();
    if (!db) {
      const saved = localStorage.getItem('nexustube_collections');
      return saved ? JSON.parse(saved) : [
        { id: 'favs', name: 'Favorites', description: 'Your favorite YouTube videos', videoIds: [], createdAt: Date.now() },
        { id: 'watch-later', name: 'Watch Later', description: 'Queued videos to watch', videoIds: [], createdAt: Date.now() }
      ];
    }
    return new Promise(async (resolve) => {
      const tx = db.transaction('collections', 'readonly');
      const store = tx.objectStore('collections');
      const req = store.getAll();
      req.onsuccess = async () => {
        let cols: Collection[] = req.result || [];
        if (cols.length === 0) {
          cols = [
            { id: 'favs', name: 'Favorites', description: 'Your favorite YouTube videos', videoIds: [], createdAt: Date.now() },
            { id: 'watch-later', name: 'Watch Later', description: 'Queued videos to watch', videoIds: [], createdAt: Date.now() }
          ];
          for (const c of cols) {
            await this.saveCollection(c);
          }
        }
        resolve(cols);
      };
      req.onerror = () => resolve([]);
    });
  }

  async saveCollection(col: Collection): Promise<void> {
    const cols = await this.getCollections();
    const updated = cols.map(c => c.id === col.id ? col : c);
    if (!updated.some(c => c.id === col.id)) updated.push(col);
    localStorage.setItem('nexustube_collections', JSON.stringify(updated));

    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('collections', 'readwrite');
      const store = tx.objectStore('collections');
      store.put(col);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async getUserscripts(): Promise<Userscript[]> {
    const db = await this.getDB();
    if (!db) {
      const saved = localStorage.getItem('nexustube_userscripts');
      return saved ? JSON.parse(saved) : DEFAULT_USERSCRIPTS;
    }
    return new Promise(async (resolve) => {
      const tx = db.transaction('userscripts', 'readonly');
      const store = tx.objectStore('userscripts');
      const req = store.getAll();
      req.onsuccess = async () => {
        let scripts: Userscript[] = req.result || [];
        if (scripts.length === 0) {
          scripts = DEFAULT_USERSCRIPTS;
          for (const s of scripts) {
            await this.saveUserscript(s);
          }
        }
        resolve(scripts);
      };
      req.onerror = () => resolve(DEFAULT_USERSCRIPTS);
    });
  }

  async saveUserscript(script: Userscript): Promise<void> {
    const scripts = await this.getUserscripts();
    const updated = scripts.map(s => s.id === script.id ? script : s);
    if (!updated.some(s => s.id === script.id)) updated.push(script);
    localStorage.setItem('nexustube_userscripts', JSON.stringify(updated));

    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('userscripts', 'readwrite');
      const store = tx.objectStore('userscripts');
      store.put(script);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async deleteUserscript(id: string): Promise<void> {
    const scripts = await this.getUserscripts();
    const updated = scripts.filter(s => s.id !== id);
    localStorage.setItem('nexustube_userscripts', JSON.stringify(updated));

    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('userscripts', 'readwrite');
      const store = tx.objectStore('userscripts');
      store.delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async getPlugins(): Promise<PluginItem[]> {
    const db = await this.getDB();
    if (!db) {
      const saved = localStorage.getItem('nexustube_plugins');
      return saved ? JSON.parse(saved) : DEFAULT_PLUGINS;
    }
    return new Promise(async (resolve) => {
      const tx = db.transaction('plugins', 'readonly');
      const store = tx.objectStore('plugins');
      const req = store.getAll();
      req.onsuccess = async () => {
        let plugins: PluginItem[] = req.result || [];
        if (plugins.length === 0) {
          plugins = DEFAULT_PLUGINS;
          for (const p of plugins) {
            await this.savePlugin(p);
          }
        }
        resolve(plugins);
      };
      req.onerror = () => resolve(DEFAULT_PLUGINS);
    });
  }

  async savePlugin(plugin: PluginItem): Promise<void> {
    const plugins = await this.getPlugins();
    const updated = plugins.map(p => p.id === plugin.id ? plugin : p);
    if (!updated.some(p => p.id === plugin.id)) updated.push(plugin);
    localStorage.setItem('nexustube_plugins', JSON.stringify(updated));

    const db = await this.getDB();
    if (!db) return;
    return new Promise((resolve) => {
      const tx = db.transaction('plugins', 'readwrite');
      const store = tx.objectStore('plugins');
      store.put(plugin);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  async exportAllData(): Promise<string> {
    const settings = await this.getSettings();
    const history = await this.getHistory();
    const savedMetaMap = await this.getSavedMetaMap();
    const collections = await this.getCollections();
    const userscripts = await this.getUserscripts();
    const plugins = await this.getPlugins();

    const backup = {
      version: 1,
      exportedAt: Date.now(),
      settings,
      history,
      savedMetaMap,
      collections,
      userscripts,
      plugins,
    };
    return JSON.stringify(backup, null, 2);
  }

  async importAllData(jsonStr: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonStr);
      if (data.settings) await this.saveSettings(data.settings);
      if (data.collections) {
        for (const c of data.collections) {
          await this.saveCollection(c);
        }
      }
      if (data.userscripts) {
        for (const s of data.userscripts) {
          await this.saveUserscript(s);
        }
      }
      if (data.plugins) {
        for (const p of data.plugins) {
          await this.savePlugin(p);
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}

export const storage = new StorageService();
