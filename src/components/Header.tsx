import React from 'react';
import { Sparkles, HelpCircle, LogOut, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onShowHelp: () => void;
  hasApiKey: boolean;
  onLogout?: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export default function Header({ onShowHelp, hasApiKey, onLogout, isDarkMode = true, onToggleTheme }: HeaderProps) {
  return (
    <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
      isDarkMode 
        ? 'border-zinc-800 bg-[#121212]/95 text-white' 
        : 'border-zinc-200 bg-white/95 text-zinc-900 shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/30 text-amber-550 shadow-sm">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className={`font-sans font-semibold tracking-tight text-lg sm:text-xl flex items-center gap-2 ${
              isDarkMode ? 'text-white' : 'text-zinc-900'
            }`}>
              Au Design Studio
              <span className="text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-medium border border-amber-500/20">AI Studio</span>
            </h1>
            <p className={`text-xs font-mono hidden sm:block ${isDarkMode ? 'text-zinc-550' : 'text-zinc-500'}`}>Professional Lifestyle Photo Generator</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
            isDarkMode ? 'bg-[#1c1c1c] border-zinc-800' : 'bg-zinc-100 border-zinc-200'
          }`}>
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${hasApiKey ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${hasApiKey ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
            </span>
            <span className={`text-xs font-mono ${isDarkMode ? 'text-zinc-400' : 'text-zinc-650'}`}>
              {hasApiKey ? 'Gemini Key: Active' : 'Gemini Key: Inactive'}
            </span>
          </div>

          {onToggleTheme && (
            <button
              id="theme-toggle-btn"
              onClick={onToggleTheme}
              className={`p-2 border border-transparent rounded-lg transition-all cursor-pointer ${
                isDarkMode 
                  ? 'text-zinc-400 hover:text-amber-450 hover:bg-[#1a1a1a] hover:border-zinc-800' 
                  : 'text-zinc-600 hover:text-amber-600 hover:bg-zinc-100 hover:border-zinc-200'
              }`}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          <button
            id="help-btn"
            onClick={onShowHelp}
            className={`p-2 border border-transparent rounded-lg transition-all cursor-pointer ${
              isDarkMode 
                ? 'text-zinc-400 hover:text-white hover:bg-[#1a1a1a] hover:border-zinc-800' 
                : 'text-zinc-650 hover:text-zinc-950 hover:bg-zinc-100 hover:border-zinc-200'
            }`}
            title="How to Use"
          >
            <HelpCircle className="h-5 w-5" />
          </button>

          {onLogout && (
            <button
              id="logout-btn"
              onClick={onLogout}
              className={`p-2 border border-transparent rounded-lg transition-all cursor-pointer ${
                isDarkMode 
                  ? 'text-zinc-400 hover:text-rose-450 hover:bg-rose-500/10 hover:border-rose-500/20' 
                  : 'text-zinc-655 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
              }`}
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
