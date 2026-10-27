import React from 'react';
import { Terminal, Shield, CheckCircle2, FileJson, Cpu } from 'lucide-react';

interface DevToolsViewProps {
  accentColor?: string;
}

export const DevToolsView: React.FC<DevToolsViewProps> = () => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-lg">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Terminal className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          <span>Developer Tools & Diagnostics</span>
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Inspect PWA manifest validation, userscript sandbox security boundaries, and plugin API specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <FileJson className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>PWA Manifest</span>
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Validated
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Manifest detected: <code className="text-purple-600 dark:text-purple-300">/manifest.webmanifest</code> with standalone display mode and service worker caching active.
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Userscript Sandbox</span>
            </h2>
            <span className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" /> Secure Bridge
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Isolated execution scope with controlled API bridge (`GM_getValue`, `GM_setValue`, `GM_notification`) and strict URL matching rules.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 space-y-4 shadow-lg">
        <div className="flex items-center gap-2 text-gray-900 dark:text-gray-100 font-bold">
          <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2>Plugin API & Lifecycle Hooks</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          NexusTube plugins use explicit capability declarations and lifecycle hooks to integrate with the player interface safely without unconstrained DOM access.
        </p>
        <pre className="bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl p-4 text-xs font-mono text-gray-800 dark:text-gray-300 overflow-x-auto">
{`interface NexusPlugin {
  id: string;
  name: string;
  version: string;
  permissions: string[];
  onInit?: (context: PluginContext) => void;
  onDestroy?: () => void;
}`}
        </pre>
      </div>
    </div>
  );
};
