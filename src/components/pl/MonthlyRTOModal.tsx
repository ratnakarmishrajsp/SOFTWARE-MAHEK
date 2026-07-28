import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Truck, X, Sparkles, CheckCircle2 } from 'lucide-react';

interface MonthlyRTOModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyRTOModal: React.FC<MonthlyRTOModalProps> = ({ isOpen, onClose }) => {
  const { plEntries, reconcilePLEntry, showToast } = useApp();

  const [monthlyRtoPercentInput, setMonthlyRtoPercentInput] = useState<string>('15');
  const [rtoPenaltyCutInput, setRtoPenaltyCutInput] = useState<string>('50'); // Fixed ₹50 penalty cut as requested
  const [reconciliationNotes, setReconciliationNotes] = useState<string>('Monthly 30-day courier NDR & RTO reconciliation');

  if (!isOpen) return null;

  // Filter 30-day entries
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];
  const thirtyDayEntries = plEntries.filter(e => e.date >= thirtyDaysAgo);

  const total30DayOrders = thirtyDayEntries.reduce((sum, e) => sum + e.orders, 0);
  const total30DayRevenue = thirtyDayEntries.reduce((sum, e) => sum + e.revenue, 0);

  const monthlyRtoPercent = Math.min(100, Math.max(0, Number(monthlyRtoPercentInput) || 0));
  const penaltyCutPerRto = Number(rtoPenaltyCutInput) || 50;

  // Live 30-Day Calculations
  const calculatedTotalRtoOrders = Math.round((total30DayOrders * monthlyRtoPercent) / 100);
  const calculatedTotalDeliveredOrders = total30DayOrders - calculatedTotalRtoOrders;
  const totalRtoPenaltyLoss = calculatedTotalRtoOrders * penaltyCutPerRto;

  // Calculate 30-Day Estimated Realized Net Profit
  const estimated30DayProfit = thirtyDayEntries.reduce((sum, item) => {
    const entryDelivered = Math.round(item.orders * (1 - monthlyRtoPercent / 100));
    const entryRto = item.orders - entryDelivered;
    const itemCostPerUnit = item.totalOrderCost || (item.productCost + item.packagingCost + item.shippingCost + item.codCharge + item.paymentGatewayCharge + item.otherCharges);
    const deliveredCost = entryDelivered * itemCostPerUnit;
    const rtoPenalty = entryRto * penaltyCutPerRto;
    const adSpend = item.totalAdSpend || 0;
    const batchRevenue = entryDelivered * item.sellingPrice;
    return sum + (batchRevenue - deliveredCost - rtoPenalty - adSpend);
  }, 0);

  const handleApplyMonthlyRto = (e: React.FormEvent) => {
    e.preventDefault();

    if (thirtyDayEntries.length === 0) {
      showToast('No Entries Found', 'No P&L entries logged in the last 30 days to reconcile.', 'warning');
      onClose();
      return;
    }

    // Reconcile all entries in the 30-day window
    thirtyDayEntries.forEach(entry => {
      const entryDelivered = Number((entry.orders * (1 - monthlyRtoPercent / 100)).toFixed(1));
      const entryRto = Number((entry.orders * (monthlyRtoPercent / 100)).toFixed(1));

      reconcilePLEntry(entry.id, {
        actualDeliveredOrders: entryDelivered,
        actualRtoOrders: entryRto,
        cancelledOrders: 0,
        returnedOrders: 0,
        exchangeOrders: 0,
        refundOrders: 0,
        reconciliationNotes: `${reconciliationNotes} (${monthlyRtoPercent}% RTO applied)`
      });
    });

    showToast(
      'Monthly 30-Day RTO Reconciled!',
      `Reconciled ${thirtyDayEntries.length} batches (${total30DayOrders} orders) with ${monthlyRtoPercent}% RTO & ₹${penaltyCutPerRto} penalty cut.`,
      'success'
    );
    onClose();
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-amber-500/40 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                Monthly 30-Day Bulk RTO Reconciliation
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reconcile all {thirtyDayEntries.length} batches in the last 30 days at once
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 30-Day Batch Summary Banner */}
        <div className="my-4 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">30-Day Batches</span>
            <span className="font-extrabold text-slate-900 dark:text-slate-100">{thirtyDayEntries.length} P&L Batches</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total 30-Day Orders</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{total30DayOrders} orders</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total 30-Day Revenue</span>
            <span className="font-black text-amber-600 dark:text-amber-400">{formatINR(total30DayRevenue)}</span>
          </div>
        </div>

        <form onSubmit={handleApplyMonthlyRto} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Monthly Actual RTO % (Last 30 Days)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={monthlyRtoPercentInput}
                onFocus={e => e.target.select()}
                onChange={e => setMonthlyRtoPercentInput(e.target.value)}
                placeholder="e.g. 15"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
              <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                Courier invoice actual RTO rate for the month
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Penalty Cut per RTO Order (₹)
              </label>
              <input
                type="number"
                min="0"
                value={rtoPenaltyCutInput}
                onFocus={e => e.target.select()}
                onChange={e => setRtoPenaltyCutInput(e.target.value)}
                placeholder="50"
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
              <span className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 block font-semibold">
                Fixed ₹50 cut per RTO order
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Reconciliation Tag / Note
            </label>
            <input
              type="text"
              value={reconciliationNotes}
              onChange={e => setReconciliationNotes(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* LIVE 30-DAY RECONCILIATION PREVIEW BOX */}
          <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 space-y-3 border border-amber-500/40 font-mono">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                Live 30-Day Reconciliation Output Preview
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                {monthlyRtoPercent}% RTO
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Calculated 30-Day RTO Orders</span>
                <span className="font-bold text-rose-400">{calculatedTotalRtoOrders} orders</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Total RTO Penalty Loss (@₹{penaltyCutPerRto})</span>
                <span className="font-bold text-rose-400">{formatINR(totalRtoPenaltyLoss)}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Calculated Delivered Orders</span>
                <span className="font-bold text-emerald-400">{calculatedTotalDeliveredOrders} orders</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">30-DAY REALIZED NET PROFIT</span>
                <span className="font-black text-emerald-400 text-sm">{formatINR(estimated30DayProfit)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply 30-Day Monthly RTO & Reconcile All</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
