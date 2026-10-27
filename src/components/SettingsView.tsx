import React, { useState, useEffect } from 'react';
import type { AppSettings, Userscript, PluginItem } from '../types';
import { Settings, Key, Palette, Layout, Check, Sun, Moon, Monitor, Shield, Code2, Puzzle, Plus, Trash2, FileCode, Play, Info } from 'lucide-react';
import { executeUserscript } from '../services/userscriptRuntime';

interface SettingsViewProps {
  settings: AppSettings;
  onSaveSettings: (settings: AppSettings) => void;
  userscripts: Userscript[];
  onSaveScript: (script: Userscript) => void;
  onDeleteScript: (id: string) => void;
  plugins: PluginItem[];
  onTogglePlugin: (pluginId: string) => void;
  accentColor: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onSaveSettings,
  userscripts,
  onSaveScript,
  onDeleteScript,
  plugins,
  onTogglePlugin,
  accentColor,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'scripts' | 'extensions'>('general');

  // General settings state
  const [apiKeyInput, setApiKeyInput] = useState(settings.youtubeApiKey);
  const [selectedAccent, setSelectedAccent] = useState(settings.accentColor);
  const [density, setDensity] = useState(settings.density);
  const [gridColumns, setGridColumns] = useState(settings.gridColumns);
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>(settings.theme || 'dark');
  const [sponsorBlockEnabled, setSponsorBlockEnabled] = useState(settings.sponsorBlockEnabled ?? true);
  const [savedStatus, setSavedStatus] = useState(false);

  // Userscript manager state
  const [selectedScript, setSelectedScript] = useState<Userscript | null>(userscripts[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState(selectedScript?.code || '');
  const [editName, setEditName] = useState(selectedScript?.name || '');
  const [editDesc, setEditDesc] = useState(selectedScript?.description || '');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCode] = useState(`// ==UserScript==\n// @name         New Custom Script\n// @namespace    https://nexustube.local\n// @version      1.0\n// @description  Custom userscript for NexusTube\n// @match        *://*/*\n// @grant        GM_getValue\n// @grant        GM_setValue\n// ==/UserScript==\n\n(function() {\n    'use strict';\n    console.log('[NexusTube] New script running.');\n})();`);

  useEffect(() => {
    setTheme(settings.theme);
    setSponsorBlockEnabled(settings.sponsorBlockEnabled ?? true);
    if (!selectedScript && userscripts.length > 0) {
      setSelectedScript(userscripts[0]);
      setEditCode(userscripts[0].code);
      setEditName(userscripts[0].name);
      setEditDesc(userscripts[0].description);
    }
  }, [settings, userscripts]);

  const handleThemeChange = (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    const root = document.documentElement;
    if (newTheme === 'dark') {
      root.classList.add('dark');
    } else if (newTheme === 'light') {
      root.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    }
    const updated: AppSettings = {
      ...settings,
      theme: newTheme,
    };
    onSaveSettings(updated);
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      ...settings,
      youtubeApiKey: apiKeyInput.trim(),
      accentColor: selectedAccent,
      density,
      gridColumns: Number(gridColumns),
      theme,
      sponsorBlockEnabled,
    };
    onSaveSettings(updated);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2000);
  };

  const handleSelectScript = (s: Userscript) => {
    setSelectedScript(s);
    setEditCode(s.code);
    setEditName(s.name);
    setEditDesc(s.description);
    setIsEditing(false);
  };

  const handleToggleEnableScript = (s: Userscript) => {
    const updated = { ...s, enabled: !s.enabled, lastModified: Date.now() };
    onSaveScript(updated);
    if (selectedScript?.id === s.id) setSelectedScript(updated);
  };

  const handleRunTest = (s: Userscript) => {
    const res = executeUserscript(s, window.location.href);
    const logEntry = { timestamp: Date.now(), type: res.success ? ('log' as const) : ('error' as const), message: res.log };
    const updated = { ...s, logs: [logEntry, ...s.logs].slice(0, 50) };
    onSaveScript(updated);
    if (selectedScript?.id === s.id) setSelectedScript(updated);
  };

  const handleSaveEdits = () => {
    if (!selectedScript) return;
    const updated: Userscript = {
      ...selectedScript,
      name: editName,
      description: editDesc,
      code: editCode,
      lastModified: Date.now(),
    };
    onSaveScript(updated);
    setSelectedScript(updated);
    setIsEditing(false);
  };

  const handleCreateNewScript = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const newScript: Userscript = {
      id: 'script_' + Math.random().toString(36).substring(2, 9),
      name: newName,
      version: '1.0',
      description: newDesc,
      code: newCode,
      enabled: false,
      match: ['*://*/*'],
      grant: ['GM_getValue', 'GM_setValue'],
      runAt: 'document-end',
      permissions: ['dom:read'],
      logs: [{ timestamp: Date.now(), type: 'log', message: 'Script created successfully.' }],
      lastModified: Date.now(),
    };
    onSaveScript(newScript);
    setSelectedScript(newScript);
    setNewName('');
    setNewDesc('');
    setShowNewModal(false);
  };

  const accentColors = [
    { label: 'Purple', value: '#c084fc' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Rose', value: '#f43f5e' },
    { label: 'Amber', value: '#f59e0b' },
  ];

  return (
    <div className="max-w-5xl space-y-6">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span>Settings, Userscripts & Extensions</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your player configuration, security sandbox userscripts, and built-in plugins.
          </p>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="flex items-center gap-2 border-b border-gray-200 dark:border-gray-800 pb-2 overflow-x-auto">
        {[
          { id: 'general', label: 'General & Player', icon: Settings },
          { id: 'scripts', label: 'Userscript Manager', icon: Code2 },
          { id: 'extensions', label: 'Plugins & Extensions', icon: Puzzle },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                isActive
                  ? 'text-white shadow-md'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
              style={isActive ? { backgroundColor: accentColor } : {}}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="space-y-6">
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
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <h2>SponsorBlock Integration</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Enable SponsorBlock Segment Detection</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Automatically fetch and display sponsor, intro, and outro skip segments.</p>
              </div>
              <button
                type="button"
                onClick={() => setSponsorBlockEnabled(!sponsorBlockEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  sponsorBlockEnabled ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    sponsorBlockEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
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
      )}

      {activeTab === 'scripts' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Userscript Manager & Sandbox</span>
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Install, inspect, and execute Tampermonkey-compatible userscripts in a secure sandboxed runtime.
              </p>
            </div>
            <button
              onClick={() => setShowNewModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md transition-all"
              style={{ backgroundColor: accentColor }}
            >
              <Plus className="w-4 h-4" />
              <span>Create New Script</span>
            </button>
          </div>

          {showNewModal && (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Create New Userscript</h3>
              <form onSubmit={handleCreateNewScript} className="space-y-4">
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 block">Script Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="e.g. NexusTube Auto Cinema"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 block">Description</label>
                  <input
                    type="text"
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="What does this script do?"
                    className="w-full bg-gray-50 dark:bg-gray-950 border border-gray-300 dark:border-gray-800 rounded-xl px-3.5 py-2 text-sm text-gray-900 dark:text-gray-200 focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowNewModal(false)}
                    className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-md"
                    style={{ backgroundColor: accentColor }}
                  >
                    Save & Create
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Installed Scripts ({userscripts.length})</h3>
              <div className="space-y-2">
                {userscripts.map(s => {
                  const isSelected = selectedScript?.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => handleSelectScript(s)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-purple-500/10 border-purple-500/50 shadow-lg'
                          : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60'
                      }`}
                    >
                      <div className="space-y-1 min-w-0 pr-3">
                        <div className="flex items-center gap-2">
                          <FileCode className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                          <h4 className="font-semibold text-xs text-gray-900 dark:text-gray-100 truncate">{s.name}</h4>
                        </div>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">{s.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={s.enabled}
                          onChange={() => handleToggleEnableScript(s)}
                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-purple-600 focus:ring-purple-500 bg-gray-50 dark:bg-gray-950 cursor-pointer"
                          title={s.enabled ? 'Disable script' : 'Enable script'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-6 shadow-lg">
              {selectedScript ? (
                <>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
                    <div>
                      <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <span>{selectedScript.name}</span>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                          v{selectedScript.version}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{selectedScript.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRunTest(selectedScript)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
                        title="Test execute script in sandbox"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Run Test</span>
                      </button>
                      <button
                        onClick={() => onDeleteScript(selectedScript.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 transition-colors"
                        title="Delete Script"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-gray-600 dark:text-gray-400 font-medium">Source Code (.user.js)</label>
                      {isEditing ? (
                        <button
                          onClick={handleSaveEdits}
                          className="px-3 py-1 rounded-lg text-xs font-semibold text-white shadow"
                          style={{ backgroundColor: accentColor }}
                        >
                          Save Changes
                        </button>
                      ) : (
                        <button
                          onClick={() => setIsEditing(true)}
                          className="text-xs text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium"
                        >
                          Edit Code
                        </button>
                      )}
                    </div>
                    {isEditing ? (
                      <textarea
                        value={editCode}
                        onChange={(e) => setEditCode(e.target.value)}
                        rows={10}
                        className="w-full bg-gray-50 dark:bg-gray-950 border border-purple-500/50 rounded-xl p-3 text-xs font-mono text-gray-900 dark:text-gray-200 focus:outline-none"
                      />
                    ) : (
                      <pre className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-800 dark:text-gray-300 overflow-x-auto max-h-60">
                        {selectedScript.code}
                      </pre>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Execution Logs & Sandbox Status</h4>
                    <div className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-3 max-h-36 overflow-y-auto space-y-2 font-mono text-xs">
                      {selectedScript.logs.length === 0 ? (
                        <p className="text-gray-500">No execution logs yet. Click 'Run Test' above.</p>
                      ) : (
                        selectedScript.logs.map((log, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <span className="text-gray-400 dark:text-gray-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                            <span className={log.type === 'error' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}>[{log.type.toUpperCase()}]</span>
                            <span className="text-gray-800 dark:text-gray-300">{log.message}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  Select a script from the list to inspect and edit.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'extensions' && (
        <div className="space-y-6">
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 flex items-start gap-4">
            <Info className="w-6 h-6 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-sm">
              <h3 className="font-semibold text-purple-900 dark:text-purple-200">PWA Security & Capability Architecture</h3>
              <p className="text-purple-800/80 dark:text-purple-300/80 leading-relaxed text-xs">
                Because NexusTube runs as a Progressive Web App (PWA) inside browser security boundaries, arbitrary Chrome/Firefox browser extensions cannot be directly loaded. Instead, NexusTube uses a secure capability-based plugin system and a dedicated userscript sandbox.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-gray-200">Installed Plugins & Widgets</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plugins.map(plugin => (
                <div key={plugin.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Puzzle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100">{plugin.name}</h4>
                      </div>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                        v{plugin.version}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{plugin.description}</p>
                    <div className="text-xs text-gray-500">Author: {plugin.author}</div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex flex-wrap gap-1.5">
                      {plugin.permissions.map(perm => (
                        <span key={perm} className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                          {perm}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => onTogglePlugin(plugin.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                        plugin.enabled
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {plugin.enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
