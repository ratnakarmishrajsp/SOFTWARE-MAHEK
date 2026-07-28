import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, Save, RefreshCw, Store, Truck, Trash2 } from 'lucide-react';

export const SettingsModule: React.FC = () => {
  const {
    settings,
    updateSettings,
    addAttarName,
    resetToSeedData,
    clearAllBusinessHistory
  } = useApp();

  const [businessName, setBusinessName] = useState(settings.businessName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [gstNumber, setGstNumber] = useState(settings.gstNumber);
  const [defaultShippingCost, setDefaultShippingCost] = useState(settings.defaultShippingCost);
  const [defaultProductCost, setDefaultProductCost] = useState(settings.defaultProductCost);
  const [defaultRtoPercent, setDefaultRtoPercent] = useState(settings.defaultRtoPercent);
  const [newAttarInput, setNewAttarInput] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      businessName,
      tagline,
      gstNumber,
      defaultShippingCost: Number(defaultShippingCost),
      defaultProductCost: Number(defaultProductCost),
      defaultRtoPercent: Number(defaultRtoPercent)
    });
  };

  const handleAddAttar = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAttarInput.trim()) {
      addAttarName(newAttarInput.trim());
      setNewAttarInput('');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Settings className="w-4 h-4" />
            <span>Business Configuration</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Settings & Data Controls
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Configure GST details, P&L defaults, wipe history or reset sample data.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => clearAllBusinessHistory()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer"
            title="Clear all transaction & entry history"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All History</span>
          </button>

          <button
            onClick={resetToSeedData}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-amber-700 dark:text-amber-400 font-bold text-xs transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-500" />
          Brand & Tax Profile
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Business Name</label>
            <input
              type="text"
              value={businessName}
              onChange={e => setBusinessName(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tagline</label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">GSTIN Number</label>
            <input
              type="text"
              value={gstNumber}
              onChange={e => setGstNumber(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>
        </div>

        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Truck className="w-4 h-4 text-amber-500" />
          P&L Calculation Default Benchmarks
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Shipping Cost (₹)</label>
            <input
              type="number"
              value={defaultShippingCost}
              onChange={e => setDefaultShippingCost(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Product Cost (₹)</label>
            <input
              type="number"
              value={defaultProductCost}
              onChange={e => setDefaultProductCost(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Default Expected RTO %</label>
            <input
              type="number"
              value={defaultRtoPercent}
              onChange={e => setDefaultRtoPercent(Number(e.target.value))}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </form>

      {/* Attar List Manager */}
      <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Attar Master List Dropdown Manager</h3>

        <form onSubmit={handleAddAttar} className="flex gap-3">
          <input
            type="text"
            value={newAttarInput}
            onChange={e => setNewAttarInput(e.target.value)}
            placeholder="Add new Attar concentrate name..."
            className="flex-1 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
          />
          <button type="submit" className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer">
            Add Attar
          </button>
        </form>

        <div className="flex flex-wrap gap-2 pt-2">
          {settings.attarList.map(a => (
            <span key={a} className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-amber-700 dark:text-amber-300">
              {a}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
