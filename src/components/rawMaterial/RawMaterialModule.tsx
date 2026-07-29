import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { RawMaterialPurchase } from '../../types';
import { FlaskConical, Plus, Search, Droplet, PlusCircle, X, Trash2 } from 'lucide-react';

export const RawMaterialModule: React.FC = () => {
  const {
    rawPurchases,
    addRawPurchase,
    deleteRawPurchase,
    settings,
    addAttarName,
    globalSearch
  } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddAttarModalOpen, setIsAddAttarModalOpen] = useState(false);
  const [newAttarInput, setNewAttarInput] = useState('');

  // Form State
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [supplierName, setSupplierName] = useState<string>(settings.suppliers[0] || 'Kannauj Distillates');
  const [purchasedBy, setPurchasedBy] = useState<string>('Ratnakar');
  const [invoiceNumber, setInvoiceNumber] = useState<string>(`INV-MKH-${Math.floor(1000 + Math.random() * 9000)}`);
  const [attarName, setAttarName] = useState<string>(settings.attarList[0] || 'Imperial White Oud');
  const [quantity, setQuantity] = useState<number>(500);
  const [unit, setUnit] = useState<RawMaterialPurchase['unit']>('ML');
  const [rate, setRate] = useState<number>(140);
  const [notes, setNotes] = useState<string>('');

  const calcTotalAmount = quantity * rate;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRawPurchase({
      purchaseDate,
      supplierName,
      purchasedBy,
      invoiceNumber,
      attarName,
      quantity: Number(quantity),
      unit,
      rate: Number(rate),
      totalAmount: calcTotalAmount,
      paymentMethod: 'Bank Transfer',
      notes
    });
    setIsModalOpen(false);
  };

  const handleAddNewAttar = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAttarInput.trim()) {
      addAttarName(newAttarInput.trim());
      setAttarName(newAttarInput.trim());
      setNewAttarInput('');
      setIsAddAttarModalOpen(false);
    }
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const query = (search || globalSearch).toLowerCase();
  const filteredPurchases = rawPurchases.filter(
    r =>
      r.attarName.toLowerCase().includes(query) ||
      r.supplierName.toLowerCase().includes(query) ||
      r.invoiceNumber.toLowerCase().includes(query)
  );

  const totalRawSpend = rawPurchases.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FlaskConical className="w-4 h-4" />
            <span>Attar Concentrate Sourcing</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Raw Material Purchase Module
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Track raw attar oils, hydro-distillates & packaging purchases. Stock updates automatically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddAttarModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 text-amber-700 dark:text-amber-400 font-semibold text-xs transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Attar Variant</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Record</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Total Raw Material Investment</span>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400 mt-1">{formatINR(totalRawSpend)}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{rawPurchases.length} bulk purchases recorded</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Active Attar Variants</span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-300 mt-1">{settings.attarList.length} Attars</div>
          <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80">Oud, Ruh Khus, Mitti, Rose, Musk</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold">Key Suppliers</span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-300 mt-1">{settings.suppliers.length} Partners</div>
          <span className="text-[10px] text-blue-600/80 dark:text-blue-400/80">Kannauj, Mysore & Middle East</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search raw material purchases..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
        />
      </div>

      {/* Purchase Log Table */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Date & Invoice</th>
                <th className="p-4">Attar Variant</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Rate / Unit</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Purchased By</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
              {filteredPurchases.map(pur => (
                <tr key={pur.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-amber-600 dark:text-amber-400">{pur.purchaseDate}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{pur.invoiceNumber}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <Droplet className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      {pur.attarName}
                    </div>
                  </td>
                  <td className="p-4 text-slate-700 dark:text-slate-300 font-medium">{pur.supplierName}</td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                    {pur.quantity} {pur.unit}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">₹{pur.rate} / {pur.unit}</td>
                  <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">{formatINR(pur.totalAmount)}</td>
                  <td className="p-4 text-slate-500 dark:text-slate-400">{pur.purchasedBy}</td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteRawPurchase(pur.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete purchase record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredPurchases.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No raw material purchases match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW PURCHASE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-xl rounded-3xl border border-amber-500/30 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Log Raw Material Purchase</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Stock updates automatically in Stock & Inventory</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={e => setPurchaseDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Attar Variant</label>
                  <select
                    value={attarName}
                    onChange={e => setAttarName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {settings.attarList.map(a => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Supplier Name</label>
                  <select
                    value={supplierName}
                    onChange={e => setSupplierName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    {settings.suppliers.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Invoice Number</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit</label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  >
                    <option value="ML">ML (Milliliters)</option>
                    <option value="Liters">Liters</option>
                    <option value="Grams">Grams</option>
                    <option value="KG">Kilograms (KG)</option>
                    <option value="Units">Units / Bottles</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Rate / Unit (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={rate}
                    onChange={e => setRate(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Purchased By</label>
                  <input
                    type="text"
                    value={purchasedBy}
                    onChange={e => setPurchasedBy(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Total Summary box */}
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-800 dark:text-amber-200">Total Purchase Investment:</span>
                <span className="text-lg font-black text-amber-600 dark:text-amber-400">{formatINR(calcTotalAmount)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Distillate Grade</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Grade A Kannauj hydro-distillate pure concentrate..."
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Save & Update Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW ATTAR VARIANT MODAL */}
      {isAddAttarModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-md rounded-3xl border border-amber-500/30 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Add New Attar to Settings</h3>
              <button onClick={() => setIsAddAttarModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewAttar} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Attar Name / Scent Title</label>
                <input
                  type="text"
                  value={newAttarInput}
                  onChange={e => setNewAttarInput(e.target.value)}
                  placeholder="e.g. Royal Amber Oud Supreme"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddAttarModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold cursor-pointer"
                >
                  Add Attar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
