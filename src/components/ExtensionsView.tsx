import React from 'react';
import type { PluginItem } from '../types';
import { Puzzle, Info } from 'lucide-react';

interface ExtensionsViewProps {
  plugins: PluginItem[];
  onTogglePlugin: (pluginId: string) => void;
  accentColor: string;
}

export const ExtensionsView: React.FC<ExtensionsViewProps> = ({
  plugins,
  onTogglePlugin,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Puzzle className="w-6 h-6 text-purple-400" />
            <span>Browser Extension & Plugin System</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage built-in application plugins, widgets, and view native browser extension integration guidelines.
          </p>
        </div>
      </div>

      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-5 flex items-start gap-4">
        <Info className="w-6 h-6 text-purple-400 shrink-0 mt-0.5" />
        <div className="space-y-1 text-sm">
          <h3 className="font-semibold text-purple-200">PWA Security & Capability Architecture</h3>
          <p className="text-purple-300/80 leading-relaxed">
            Because NexusTube runs as a Progressive Web App (PWA) inside browser security boundaries, arbitrary Chrome/Firefox browser extensions cannot be directly loaded. Instead, NexusTube uses a secure capability-based plugin system and a dedicated userscript sandbox. For deep OS-level integration, use our companion browser extension wrapper.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-200">Installed Plugins & Widgets</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {plugins.map(plugin => (
            <div key={plugin.id} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Puzzle className="w-5 h-5 text-purple-400" />
                    <h3 className="font-bold text-gray-100">{plugin.name}</h3>
                  </div>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                    v{plugin.version}
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">{plugin.description}</p>
                <div className="text-xs text-gray-500">Author: {plugin.author}</div>
              </div>

              <div className="pt-4 border-t border-gray-800 flex items-center justify-between">
                <div className="flex flex-wrap gap-1.5">
                  {plugin.permissions.map(perm => (
                    <span key={perm} className="px-2 py-0.5 rounded text-[10px] font-mono bg-gray-800 text-gray-300">
                      {perm}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => onTogglePlugin(plugin.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    plugin.enabled
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
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
  );
};
