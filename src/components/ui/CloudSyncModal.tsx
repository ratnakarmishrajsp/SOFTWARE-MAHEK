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
  Zap
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
    importBackupJSON
  } = useApp();

  const [inputSyncId, setInputSyncId] = useState(syncId);
  const [copied, setCopied] = useState(false);

  if (!isSyncModalOpen) return null;

  const currentSyncUrl = syncId
    ? `${window.location.origin}/?sync=${syncId}`
    : `${window.location.origin}`;

  const handleCopyCode = () => {
    if (!syncId) return;
    navigator.clipboard.writeText(syncId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareLinkWhatsApp = () => {
    const text = `🌸 *MAHEKH ERP - DEVICE PAIRING LINK* 🌸

Click this link on your Mobile/Laptop to sync all P&L entries & Business Data automatically:

👉 ${currentSyncUrl}

*(Or enter Sync Code manually: ${syncId})*`;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-amber-500/30 p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Cross-Device Cloud Sync
                {lastSyncedAt && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    Synced ({lastSyncedAt})
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sync P&L & Stock data seamlessly between Laptop & Mobile Phone
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsSyncModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-5">
          {/* SECTION 1: INSTANT PAIRING TO MOBILE VIA WHATSAPP */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-amber-500/10 to-emerald-500/5 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Step 1: Open Data on Mobile Phone (1-Click WhatsApp Link)
                </h4>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              To see all Laptop data on your Phone, send this pairing link to your WhatsApp & open it on your Phone.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={async () => {
                  if (!syncId) {
                    await pushToCloud();
                  }
                  handleShareLinkWhatsApp();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>📱 Send Link to My Phone (WhatsApp)</span>
              </button>

              {syncId && (
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs hover:border-amber-500"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copied ? 'Code Copied!' : 'Copy Sync Code'}</span>
                </button>
              )}
            </div>
          </div>

          {/* SECTION 2: CLOUD SYNC CODE CONTROLS */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-amber-500" />
                Step 2: Sync Code & Real-Time Sync
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">
                {syncId ? 'Key Active' : 'No Key Set'}
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Cloud Sync Code (Paste from Laptop or Create New)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputSyncId}
                  onChange={e => setInputSyncId(e.target.value.trim())}
                  placeholder="e.g. 019fa736-dd3f-76e6-af93-067880703ffb"
                  className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
                <button
                  onClick={() => pullFromCloud(inputSyncId)}
                  disabled={isSyncing || !inputSyncId}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold text-xs cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>Pull Data</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => pushToCloud()}
                disabled={isSyncing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 text-slate-950 font-bold text-xs shadow-sm cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Upload Current Device Data to Cloud</span>
              </button>

              <button
                onClick={() => pullFromCloud()}
                disabled={isSyncing || !syncId}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 dark:hover:bg-slate-700 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>Fetch Latest Cloud Data</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: BACKUP EXPORT & IMPORT */}
          <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Download className="w-4 h-4 text-blue-500" />
              Offline JSON File Backup & Restore
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
                <span>Restore Backup File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
