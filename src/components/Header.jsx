import { Satellite, Sun, Moon, RefreshCw, Search, SortAsc, SortDesc, Wifi, WifiOff } from 'lucide-react';

export default function Header({
  isDark, onToggleTheme,
  searchTerm, onSearch,
  sortBy, onSortBy,
  onRefreshNews, newsLoading,
  issError,
}) {
  return (
    <header className="sticky top-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-4 sm:px-6 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-space-500 to-space-700 flex items-center justify-center shadow-lg shadow-space-500/30 animate-spin-slow">
            <Satellite size={18} className="text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="text-base font-extrabold text-[var(--text-primary)] leading-tight tracking-tight">
              ISS Mission Control
            </div>
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${issError ? 'bg-red-500' : 'bg-emerald-500 animate-pulse'}`} />
              <span className="text-[10px] text-[var(--text-secondary)] font-medium">
                {issError ? 'Reconnecting…' : 'Live Tracking Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xs hidden md:block">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => onSearch(e.target.value)}
              placeholder="Search news…"
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-cosmic-border/40 border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-space-500/50 text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          {/* Sort */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-cosmic-border/40 rounded-xl p-1 border border-[var(--border-color)]">
            <button
              onClick={() => onSortBy('date')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                sortBy === 'date'
                  ? 'bg-space-600 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <SortDesc size={12} /> Date
            </button>
            <button
              onClick={() => onSortBy('source')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                sortBy === 'source'
                  ? 'bg-space-600 text-white shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <SortAsc size={12} /> Source
            </button>
          </div>

          {/* Refresh */}
          <button
            onClick={onRefreshNews}
            disabled={newsLoading}
            className="btn-ghost p-2 rounded-xl border border-[var(--border-color)] disabled:opacity-50"
            title="Refresh news"
          >
            <RefreshCw size={14} className={newsLoading ? 'animate-spin' : ''} />
          </button>

          {/* Theme toggle */}
          <button
            onClick={onToggleTheme}
            className="btn-ghost p-2 rounded-xl border border-[var(--border-color)]"
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-space-400" />}
          </button>
        </div>
      </div>

      {/* Mobile search */}
      <div className="md:hidden mt-2 max-w-7xl mx-auto">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)]" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => onSearch(e.target.value)}
            placeholder="Search news…"
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-cosmic-border/40 border border-[var(--border-color)] rounded-xl focus:outline-none focus:border-space-500/50 text-[var(--text-primary)] placeholder-[var(--text-secondary)] transition-colors"
          />
        </div>
      </div>
    </header>
  );
}
