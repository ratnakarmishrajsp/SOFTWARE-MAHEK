import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Cloud,
  RefreshCw,
  Copy,
  Check,
  Send,
  Upload,
  Download,
  X,
  Smartphone,
  Zap,
  Wifi,
  WifiOff,
  ArrowRight
} from 'lucide-react';

export const CloudSyncModal: React.FC = () => {
  const {
    syncId,
    isSyncing,
    lastSyncedAt,
    pushToCloud,
    pullFromCloud,
    isSyncModalOpen,
    setIsSyncModalOpen,
    exportBackupJSON,
    importBackupJSON,
    autoSyncEnabled,
    setAutoSyncEnabled
  } = useApp();

  const [inputSyncId, setInputSyncId] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isSyncModalOpen) return null;

  const currentSyncUrl = syncId
    ? `${window.location.origin}/?sync=${syncId}`
    : '';

  const handleCopyCode = () => {
    if (!syncId) return;
    navigator.clipboard.writeText(syncId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    if (!currentSyncUrl) return;
    navigator.clipboard.writeText(currentSyncUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareLinkWhatsApp = () => {
    const text = `🌸 *MAHEKH ERP - DEVICE PAIRING LINK* 🌸

Yeh link open karo apne Phone/Laptop pe — sab data automatically sync ho jayega:

👉 ${currentSyncUrl}

*(Sync Code: ${syncId})*`;

    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const content = event.target?.result as string;
        if (content) {
          importBackupJSON(content);
          setIsSyncModalOpen(false);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl border border-amber-500/30 p-6 shadow-2xl max-h-[95vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${syncId ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Cross-Device Cloud Sync
                {syncId ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <Wifi className="w-3 h-3" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    <WifiOff className="w-3 h-3" />
                    Not Set Up
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {lastSyncedAt ? `Last synced: ${lastSyncedAt}` : 'Laptop aur Phone ka data ek jagah'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">

          {/* ─── STEP 1: Setup (only shown if no syncId yet) ─── */}
          {!syncId && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-amber-600/5 border-2 border-amber-500/50 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-xs font-black">1</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100">
                  Pehli Baar: Cloud Sync Enable Karo
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Apna data cloud pe upload karo. Iske baad <strong>Phone pe bhi automatically</strong> yahi data dikhega.
              </p>
              <button
                onClick={async () => { await pushToCloud(); }}
                disabled={isSyncing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-60"
              >
                {isSyncing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                <span>{isSyncing ? 'Uploading...' : '🚀 Abhi Cloud Sync Enable Karo'}</span>
              </button>
            </div>
          )}

          {/* ─── STEP 2 (or Step 1 if already synced): Share with Phone ─── */}
          {syncId && (
            <>
              {/* Status card */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Wifi className="w-4 h-4" />
                    Auto-Sync Chal Raha Hai ✅
                  </span>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-[10px] text-slate-500">{autoSyncEnabled ? 'ON' : 'OFF'}</span>
                    <div
                      onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                      className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${autoSyncEnabled ? 'bg-emerald-500' : 'bg-slate-400'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform mt-0.5 ${autoSyncEnabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </div>
                  </label>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400/80">
                  Jab bhi koi data add/edit hoga, 4 second me automatically cloud pe save ho jayega.
                </p>
              </div>

              {/* Sync Code Box */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Your Sync Code:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 truncate">
                    {syncId}
                  </code>
                  <button
                    onClick={handleCopyCode}
                    className="shrink-0 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-amber-500 cursor-pointer transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ─── SHARE WITH PHONE (shown only when syncId exists) ─── */}
          {syncId && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 to-blue-500/5 border border-emerald-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-xs font-black">2</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  Phone Pe Open Karo
                </h4>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Yeh link WhatsApp pe bhejo aur phone pe click karo — sab data phone pe bhi dikhne lagega.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleShareLinkWhatsApp}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>📱 WhatsApp Pe Bhejo</span>
                </button>
                <button
                  onClick={handleCopyLink}
                  className="px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-emerald-500 cursor-pointer transition-colors"
                  title="Copy link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                </button>
              </div>

              {/* Manual URL preview */}
              <div className="flex items-center gap-1.5 p-2 rounded-xl bg-white/60 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="text-[10px] font-mono text-slate-600 dark:text-slate-400 truncate">{currentSyncUrl}</span>
              </div>
            </div>
          )}

          {/* ─── MANUAL PULL (for phone to get latest data) ─── */}
          {syncId && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => pullFromCloud()}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer disabled:opacity-50 transition-all"
              >
                <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Abhi Sync Karo (Latest Data Lao)</span>
              </button>
              <button
                onClick={() => pushToCloud()}
                disabled={isSyncing}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-400 font-bold text-xs cursor-pointer disabled:opacity-50 transition-all"
              >
                <Zap className="w-4 h-4" />
                <span>Force Upload</span>
              </button>
            </div>
          )}

          {/* ─── ENTER CODE FROM OTHER DEVICE ─── */}
          {!syncId && (
            <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-500 text-white text-xs font-black">2</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
                  Ya Dusre Device Ka Code Dalo
                </h4>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400">
                Agar Laptop pe sync code bana chuka hai, toh phone pe yahan paste karo:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputSyncId}
                  onChange={e => setInputSyncId(e.target.value.trim())}
                  placeholder="Sync code paste karo..."
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => pullFromCloud(inputSyncId)}
                  disabled={isSyncing || !inputSyncId}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Load</span>
                </button>
              </div>
            </div>
          )}

          {/* ─── BACKUP / RESTORE ─── */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-500" />
              Offline Backup (JSON File)
            </h4>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={exportBackupJSON}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 font-bold text-xs hover:bg-blue-500/20 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Backup (.json)</span>
              </button>
              <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-amber-500" />
                <span>Restore Backup</span>
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
