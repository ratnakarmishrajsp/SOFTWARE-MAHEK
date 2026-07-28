import React, { useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Keyboard, X, Search, PlusCircle, Moon, BarChart2, RefreshCw } from 'lucide-react';

export const ShortcutsModal: React.FC = () => {
  const { isShortcutsOpen, setIsShortcutsOpen } = useApp();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      } else if (e.key === '?' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsShortcutsOpen(!isShortcutsOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isShortcutsOpen, setIsShortcutsOpen]);

  if (!isShortcutsOpen) return null;

  const shortcuts = [
    { key: 'Cmd/Ctrl + K', description: 'Focus Global Search Bar', icon: Search },
    { key: 'Shift + N', description: 'Open Quick Add P&L Entry Modal', icon: PlusCircle },
    { key: 'Shift + D', description: 'Toggle Dark / Light Theme', icon: Moon },
    { key: 'Shift + P', description: 'Switch to Profit & Loss Module', icon: BarChart2 },
    { key: 'Shift + R', description: 'Reset Demo Data to Initial Seeds', icon: RefreshCw },
    { key: '?', description: 'Toggle Keyboard Shortcuts Help', icon: Keyboard }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-lg rounded-2xl border border-amber-500/20 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Keyboard Shortcuts</h3>
              <p className="text-xs text-slate-400">Navigate Mahekh ERP at lightning speed</p>
            </div>
          </div>
          <button
            onClick={() => setIsShortcutsOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          {shortcuts.map((sc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <sc.icon className="w-4 h-4 text-amber-400" />
                <span className="text-sm text-slate-300">{sc.description}</span>
              </div>
              <kbd className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-xs font-mono text-amber-400 font-semibold shadow-inner">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-slate-800 text-center">
          <p className="text-xs text-slate-400">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">Esc</kbd> or click close to exit help.
          </p>
        </div>
      </div>
    </div>
  );
};
