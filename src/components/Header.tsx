import React, { useState, useEffect } from 'react';
import { Search, Download, CheckCircle2, AlertCircle } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSearchSubmit: (query: string) => void;
  apiKey: string;
  onOpenSettings: () => void;
  isMock: boolean;
  accentColor: string;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onOpenSettings,
  isMock,
  accentColor,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('PWA installation is available via your browser menu (e.g. "Install App" or "Add to Home Screen").');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      // Installed
    }
    setDeferredPrompt(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchSubmit(searchQuery);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md">
      <div className="flex-1 max-w-2xl relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search public YouTube videos, channels, or tags..."
          className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-24 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <button
          onClick={() => onSearchSubmit(searchQuery)}
          className="absolute right-1.5 top-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-all shadow-sm"
          style={{ backgroundColor: accentColor }}
        >
          Search
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSettings}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            isMock
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
          }`}
          title={isMock ? 'Using curated demo mode. Click to configure API key.' : 'Connected to YouTube Data API v3'}
        >
          {isMock ? (
            <>
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Demo Mode</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>API Live</span>
            </>
          )}
        </button>

        <button
          onClick={handleInstallClick}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-medium border border-gray-700 transition-all shadow-sm"
          title="Install NexusTube PWA"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Install PWA</span>
        </button>
      </div>
    </header>
  );
};
