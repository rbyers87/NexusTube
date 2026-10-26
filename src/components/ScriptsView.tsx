import React, { useState } from 'react';
import type { Userscript } from '../types';
import { Code2, Play, Plus, Trash2, FileCode } from 'lucide-react';
import { executeUserscript } from '../services/userscriptRuntime';

interface ScriptsViewProps {
  scripts: Userscript[];
  onSaveScript: (script: Userscript) => void;
  onDeleteScript: (id: string) => void;
  accentColor: string;
}

export const ScriptsView: React.FC<ScriptsViewProps> = ({
  scripts,
  onSaveScript,
  onDeleteScript,
  accentColor,
}) => {
  const [selectedScript, setSelectedScript] = useState<Userscript | null>(scripts[0] || null);
  const [isEditing, setIsEditing] = useState(false);
  const [editCode, setEditCode] = useState(selectedScript?.code || '');
  const [editName, setEditName] = useState(selectedScript?.name || '');
  const [editDesc, setEditDesc] = useState(selectedScript?.description || '');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newCode] = useState(`// ==UserScript==\n// @name         New Custom Script\n// @namespace    https://nexustube.local\n// @version      1.0\n// @description  Custom userscript for NexusTube\n// @match        *://*/*\n// @grant        GM_getValue\n// @grant        GM_setValue\n// ==/UserScript==\n\n(function() {\n    'use strict';\n    console.log('[NexusTube] New script running.');\n})();`);

  const handleSelectScript = (s: Userscript) => {
    setSelectedScript(s);
    setEditCode(s.code);
    setEditName(s.name);
    setEditDesc(s.description);
    setIsEditing(false);
  };

  const handleToggleEnable = (s: Userscript) => {
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

  const handleCreateNew = (e: React.FormEvent) => {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Code2 className="w-6 h-6 text-purple-400" />
            <span>Userscript Manager & Sandbox</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
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
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h3 className="text-base font-bold text-gray-100">Create New Userscript</h3>
          <form onSubmit={handleCreateNew} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">Script Name</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. NexusTube Auto Cinema"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
                required
              />
            </div>
            <div>
              <label className="text-xs text-gray-400 font-medium mb-1 block">Description</label>
              <input
                type="text"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                placeholder="What does this script do?"
                className="w-full bg-gray-950 border border-gray-800 rounded-xl px-3.5 py-2 text-sm text-gray-200 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium"
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
          <h2 className="text-sm font-bold text-gray-300">Installed Scripts ({scripts.length})</h2>
          <div className="space-y-2">
            {scripts.map(s => {
              const isSelected = selectedScript?.id === s.id;
              return (
                <div
                  key={s.id}
                  onClick={() => handleSelectScript(s)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-purple-500/10 border-purple-500/50 shadow-lg'
                      : 'bg-gray-900 border-gray-800 hover:bg-gray-800/60'
                  }`}
                >
                  <div className="space-y-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-purple-400 shrink-0" />
                      <h4 className="font-semibold text-sm text-gray-100 truncate">{s.name}</h4>
                    </div>
                    <p className="text-xs text-gray-400 truncate">{s.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={() => handleToggleEnable(s)}
                      className="w-4 h-4 rounded border-gray-700 text-purple-600 focus:ring-purple-500 bg-gray-950 cursor-pointer"
                      title={s.enabled ? 'Disable script' : 'Enable script'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-6 shadow-lg">
          {selectedScript ? (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
                <div>
                  <h2 className="text-lg font-bold text-gray-100 flex items-center gap-2">
                    <span>{selectedScript.name}</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      v{selectedScript.version}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">{selectedScript.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleRunTest(selectedScript)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition-colors"
                    title="Test execute script in sandbox"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Test</span>
                  </button>
                  <button
                    onClick={() => onDeleteScript(selectedScript.id)}
                    className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-colors"
                    title="Delete Script"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-400 font-medium">Source Code (.user.js)</label>
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
                      className="text-xs text-purple-400 hover:text-purple-300 font-medium"
                    >
                      Edit Code
                    </button>
                  )}
                </div>
                {isEditing ? (
                  <textarea
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    rows={12}
                    className="w-full bg-gray-950 border border-purple-500/50 rounded-xl p-3 text-xs font-mono text-gray-200 focus:outline-none"
                  />
                ) : (
                  <pre className="bg-gray-950 border border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-300 overflow-x-auto max-h-72">
                    {selectedScript.code}
                  </pre>
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Execution Logs & Sandbox Status</h3>
                <div className="bg-gray-950 border border-gray-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-2 font-mono text-xs">
                  {selectedScript.logs.length === 0 ? (
                    <p className="text-gray-500">No execution logs yet. Click 'Run Test' above.</p>
                  ) : (
                    selectedScript.logs.map((log, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="text-gray-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                        <span className={log.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}>[{log.type.toUpperCase()}]</span>
                        <span className="text-gray-300">{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-gray-500">
              Select a script from the list to inspect and edit.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
