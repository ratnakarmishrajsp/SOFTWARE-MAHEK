import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Boxes, Plus, Minus, Search, AlertTriangle, CheckCircle, Trash2 } from 'lucide-react';

export const InventoryModule: React.FC = () => {
  const { inventory, updateInventoryStock, deleteInventoryItem, globalSearch } = useApp();
  const [search, setSearch] = useState('');

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const query = (search || globalSearch).toLowerCase();
  const filteredInventory = inventory.filter(
    i =>
      i.name.toLowerCase().includes(query) ||
      i.type.toLowerCase().includes(query) ||
      i.unit.toLowerCase().includes(query)
  );

  const totalInventoryValuation = inventory.reduce((sum, i) => sum + i.totalStockValue, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Boxes className="w-4 h-4" />
            <span>Stock & Warehouse Management</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Inventory & Stock Valuation
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Live stock tracking for raw attar oils, hydro-distillates & packaged perfume bottles.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-right">
          <span className="text-[11px] text-amber-800 dark:text-amber-200 font-semibold block">Total Inventory Valuation</span>
          <span className="text-xl font-black text-amber-600 dark:text-amber-400">{formatINR(totalInventoryValuation)}</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter inventory by name or type..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Inventory Table */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Item Name</th>
                <th className="p-4">Category / Type</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Avg Cost / Unit</th>
                <th className="p-4">Total Stock Value</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Adjust Stock & Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
              {filteredInventory.map(item => {
                const isLowStock = item.currentStock <= item.minStockAlert;

                return (
                  <tr key={item.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{item.name}</td>
                    <td className="p-4 text-slate-600 dark:text-slate-400 font-medium">{item.type}</td>
                    <td className="p-4 font-extrabold text-amber-600 dark:text-amber-400">
                      {item.currentStock} {item.unit}
                    </td>
                    <td className="p-4 text-slate-700 dark:text-slate-300">₹{item.averageCost} / {item.unit}</td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">{formatINR(item.totalStockValue)}</td>
                    <td className="p-4">
                      {isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 animate-pulse">
                          <AlertTriangle className="w-3 h-3" /> Reorder Limit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => updateInventoryStock(item.id, Math.max(0, item.currentStock - 10))}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
                          title="Reduce stock (-10)"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => updateInventoryStock(item.id, item.currentStock + 50)}
                          className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold text-xs cursor-pointer"
                          title="Add stock (+50)"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteInventoryItem(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer ml-1"
                          title="Delete item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredInventory.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No inventory items match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
