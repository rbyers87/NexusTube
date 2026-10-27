import React from 'react';
import { Home, Library, History, Settings, Terminal, ChevronLeft, ChevronRight, Video } from 'lucide-react';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  accentColor: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  collapsed,
  setCollapsed,
  accentColor,
}) => {
  const navItems = [
    { id: 'discover', label: 'Discover & Search', icon: Home },
    { id: 'library', label: 'Library & Playlists', icon: Library },
    { id: 'history', label: 'Watch History', icon: History },
    { id: 'settings', label: 'Settings & Extensions', icon: Settings },
    { id: 'devtools', label: 'Developer Tools', icon: Terminal },
  ];

  return (
    <aside
      className={`bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 relative select-none ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg text-white font-bold"
            style={{ backgroundColor: accentColor }}
          >
            <Video className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <h1 className="font-bold text-lg leading-tight tracking-tight text-gray-900 dark:text-white">NexusTube</h1>
              <span className="text-xs text-gray-500 dark:text-gray-400">Custom PWA Player</span>
            </div>
          )}
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full flex items-center gap-3.5 px-3 py-3 rounded-xl font-medium transition-all duration-200 group ${
                isActive
                  ? 'text-white shadow-lg'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800/60'
              }`}
              style={isActive ? { backgroundColor: accentColor } : {}}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`} />
              {!collapsed && <span className="truncate text-sm">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 text-xs text-gray-500">
          <div className="flex items-center justify-between mb-1">
            <span>Runtime PWA</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-gray-500 dark:text-gray-400">Secure Sandboxed Engine v1.0</p>
        </div>
      )}
    </aside>
  );
};
