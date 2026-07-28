import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Search,
  PlusCircle,
  Sun,
  Moon,
  Bell,
  Keyboard,
  RefreshCw,
  Package,
  TrendingDown,
  X
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    theme,
    toggleTheme,
    globalSearch,
    setGlobalSearch,
    setIsQuickAddOpen,
    setIsShortcutsOpen,
    resetToSeedData,
    plEntries,
    inventory,
    setActiveTab
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // Compute live smart alerts for notifications
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStockAlert).length;
  const highRtoEntries = plEntries.filter(p => p.expectedRtoPercent >= 22);

  const totalNotifs = lowStockCount + highRtoEntries.length;

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200 dark:border-slate-800/80 px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 transition-colors">
      {/* Search Input */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            id="global-search-input"
            type="text"
            value={globalSearch}
            onChange={e => setGlobalSearch(e.target.value)}
            placeholder="Search products, entries, attars, expenses... (Ctrl+K)"
            className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 rounded-xl pl-10 pr-12 py-2 text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 transition-all"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            Ctrl K
          </kbd>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2.5">
        {/* Quick Add Button */}
        <button
          onClick={() => {
            setActiveTab('pl');
            setIsQuickAddOpen(true);
          }}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span className="hidden sm:inline">New P&L Entry</span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 transition-colors"
            title="Notification Center"
          >
            <Bell className="w-4 h-4" />
            {totalNotifs > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-md animate-pulse">
                {totalNotifs}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Smart Alerts & Notifications</h4>
                </div>
                <button onClick={() => setIsNotifOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 space-y-2 max-h-72 overflow-y-auto">
                {lowStockCount > 0 && (
                  <div
                    onClick={() => {
                      setActiveTab('inventory');
                      setIsNotifOpen(false);
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/15 cursor-pointer transition-colors"
                  >
                    <Package className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-semibold text-amber-900 dark:text-amber-200">Low Stock Alert</h5>
                      <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                        {lowStockCount} raw materials/perfumes hit reorder limit.
                      </p>
                    </div>
                  </div>
                )}

                {highRtoEntries.map(e => (
                  <div
                    key={e.id}
                    onClick={() => {
                      setActiveTab('pl');
                      setIsNotifOpen(false);
                    }}
                    className="flex items-start gap-3 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/15 cursor-pointer transition-colors"
                  >
                    <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h5 className="text-xs font-semibold text-rose-900 dark:text-rose-200">High RTO Warning ({e.expectedRtoPercent}%)</h5>
                      <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80 mt-0.5">
                        {e.productName} entry on {e.date} has high return projection.
                      </p>
                    </div>
                  </div>
                ))}

                {totalNotifs === 0 && (
                  <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                    ✨ All systems optimal! No active alerts.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-500/10 dark:bg-slate-900/80 border border-amber-500/30 dark:border-slate-800 text-amber-600 dark:text-amber-400 font-semibold text-xs hover:bg-amber-500/20 dark:hover:bg-slate-800/60 transition-all cursor-pointer"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-700" />
              <span className="hidden sm:inline">Dark Mode</span>
            </>
          )}
        </button>

        {/* Shortcuts Icon */}
        <button
          onClick={() => setIsShortcutsOpen(true)}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 transition-colors hidden sm:flex"
          title="Keyboard Shortcuts (?)"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Reset Demo Data */}
        <button
          onClick={resetToSeedData}
          className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-800/60 transition-colors hidden md:flex"
          title="Reset Sample Data"
        >
          <RefreshCw className="w-4 h-4" />
        </button>

        {/* User Profile Tag */}
        <div className="pl-2 border-l border-slate-200 dark:border-slate-800 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 p-0.5 shadow-md">
            <div className="w-full h-full rounded-full bg-slate-900 dark:bg-slate-950 flex items-center justify-center text-amber-400 text-xs font-bold">
              ME
            </div>
          </div>
          <div className="hidden xl:block">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Ratnakar</div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Attar Business Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
};
