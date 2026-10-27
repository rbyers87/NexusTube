import React, { useState } from 'react';
import type { AppSettings } from '../types';
import { Settings, Key, Palette, Layout, Check, Sun, Moon, Monitor } from 'lucide-react';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  accentColor: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  accentColor,
}) => {
  const [apiKeyInput, setApiKeyInput] = useState(settings.youtubeApiKey);
  const [selectedAccent, setSelectedAccent] = useState(settings.accentColor);
  const [density, setDensity] = useState(settings.density);
  const [gridColumns, setGridColumns] = useState(settings.gridColumns);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(settings.theme || 'dark');
  const [savedStatus, setSavedStatus] = useState(false);

  const accentColors = [
    { label: 'Purple', value: '#c084fc' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Amber', value: '#f59e0b' },
  ];

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    const updated: AppSettings = {
      ...settings,
      theme: newTheme,
    };
    onSaveSettings(updated);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      youtubeApiKey: apiKeyInput.trim(),
      accentColor: selectedAccent,
      density,
      gridColumns: Number(gridColumns),
      theme,
    };
    onSaveSettings(updated);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>Player & Application Settings</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Customize your NexusTube interface, theme mode, grid layout density, and YouTube Data API key.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
            <Key className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2>YouTube Data API v3 Key</h2>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
            Enter your official YouTube Data API v3 key to unlock live public search and channel discovery. If left blank, NexusTube automatically operates in curated demo mode.
          </p>
          <div>
            <input
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm font-mono text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
            <Moon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2>Theme Mode (Applies Instantly)</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[
              { id: 'dark', label: 'Dark Mode', icon: Moon },
              { id: 'light', label: 'Light Mode', icon: Sun },
              { id: 'system', label: 'System Default', icon: Monitor },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleThemeChange(item.id as any)}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500/50 text-gray-900 dark:text-white shadow-lg'
                      : 'bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-700'
                  }`}
                >
                  <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500 dark:text-gray-400'}`} />
                  <span className="text-xs font-semibold">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2>Accent Color</h2>
          </div>
          <div className="flex items-center gap-3">
            {accentColors.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => setSelectedAccent(c.value)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform ${
                  selectedAccent === c.value ? 'scale-110 ring-2 ring-purple-500 shadow-lg' : 'hover:scale-105 opacity-80'
                }`}
                style={{ backgroundColor: c.value }}
                title={c.label}
              >
                {selectedAccent === c.value && <Check className="w-5 h-5 text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
            <Layout className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <h2>Video Grid & Density</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2 block">Grid Columns</label>
              <select
                value={gridColumns}
                onChange={(e) => setGridColumns(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500"
              >
                <option value={2}>2 Columns</option>
                <option value={3}>3 Columns (Standard)</option>
                <option value={4}>4 Columns (Spacious)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2 block">Interface Density</label>
              <select
                value={density}
                onChange={(e: any) => setDensity(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500"
              >
                <option value="compact">Compact</option>
                <option value="comfortable">Comfortable</option>
                <option value="spacious">Spacious</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedStatus && <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Settings saved successfully!</span>}
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-lg ml-auto transition-all"
            style={{ backgroundColor: accentColor }}
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
