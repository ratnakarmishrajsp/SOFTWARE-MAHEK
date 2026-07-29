import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { PLEntry } from '../../types';
import { Truck, X } from 'lucide-react';

interface ActualRTOModalProps {
  entry: PLEntry | null;
  onClose: () => void;
}

export const ActualRTOModal: React.FC<ActualRTOModalProps> = ({ entry, onClose }) => {
  const { reconcilePLEntry } = useApp();

  const [actualDelivered, setActualDelivered] = useState<number>(0);
  const [actualRto, setActualRto] = useState<number>(0);
  const [cancelled, setCancelled] = useState<number>(0);
  const [returned, setReturned] = useState<number>(0);
  const [exchange, setExchange] = useState<number>(0);
  const [refund, setRefund] = useState<number>(0);
  const [reconciliationNotes, setReconciliationNotes] = useState<string>('');

  useEffect(() => {
    if (entry) {
      setActualDelivered(entry.actualDeliveredOrders ?? Math.round(entry.expectedDeliveredOrders));
      setActualRto(entry.actualRtoOrders ?? Math.round(entry.expectedRtoOrders));
      setCancelled(entry.cancelledOrders ?? 0);
      setReturned(entry.returnedOrders ?? 0);
      setExchange(entry.exchangeOrders ?? 0);
      setRefund(entry.refundOrders ?? 0);
      setReconciliationNotes(entry.reconciliationNotes ?? '');
    }
  }, [entry]);

  if (!entry) return null;

  // Real-time calculation preview inside modal
  const actualRev = actualDelivered * entry.sellingPrice;

  let effectiveShippingCost = entry.shippingCost || 130;
  let effectivePackagingCost = entry.packagingCost || 35;
  let effectiveProductCost = entry.productCost;

  if (entry.costMode === 'combined' && entry.combinedCost) {
    effectiveShippingCost = 130;
    effectivePackagingCost = 35;
    effectiveProductCost = Math.max(0, entry.combinedCost - effectiveShippingCost - effectivePackagingCost);
  }

  const totalCostPerUnit =
    effectiveProductCost +
    effectivePackagingCost +
    effectiveShippingCost +
    (entry.codCharge || 0) +
    (entry.paymentGatewayCharge || 0) +
    (entry.otherCharges || 0);

  const totalDeliveredCost = actualDelivered * totalCostPerUnit;

  const rtoShippingFee = entry.rtoShippingCharge || 120;
  const rtoLossPerUnit = effectiveShippingCost + rtoShippingFee + effectivePackagingCost;
  const totalRtoCourierLoss = actualRto * rtoLossPerUnit;
  const totalAdSpend = entry.totalAdSpend || (entry.cpp ? entry.cpp * entry.orders : 0);

  const cogsSavedOnRto = actualRto * effectiveProductCost;

  const calculatedActualProfit = Math.round(
    actualRev - totalDeliveredCost - totalRtoCourierLoss - totalAdSpend - (refund * entry.sellingPrice)
  );
  const diffFromExpected = calculatedActualProfit - Math.round(entry.expectedProfit);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    reconcilePLEntry(entry.id, {
      actualDeliveredOrders: Number(actualDelivered),
      actualRtoOrders: Number(actualRto),
      cancelledOrders: Number(cancelled),
      returnedOrders: Number(returned),
      exchangeOrders: Number(exchange),
      refundOrders: Number(refund),
      reconciliationNotes
    });
    onClose();
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-amber-500/30 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Actual RTO & Delivery Update</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Reconcile batch <span className="text-amber-600 dark:text-amber-400 font-semibold">{entry.productName}</span> ({entry.date})
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

        {/* Expected vs Actual Summary Pill */}
        <div className="my-4 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 block">Original Expected Profit</span>
            <span className="text-base font-bold text-slate-800 dark:text-slate-200">{formatINR(entry.expectedProfit)}</span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{entry.orders} total orders booked</span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400 block">Recalculated Actual Profit</span>
            <span className={`text-base font-black ${calculatedActualProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {formatINR(calculatedActualProfit)}
            </span>
            <span className={`text-[10px] font-semibold block ${diffFromExpected >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {diffFromExpected >= 0 ? '+' : ''}{formatINR(diffFromExpected)} variance
            </span>
          </div>
        </div>

        {/* RTO Calculation Logic Explanation Box */}
        <div className="mb-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-[11px] space-y-1">
          <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center justify-between">
            <span>ℹ️ Formula Breakdown & Product Cost Recovery:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">COGS Saved: +{formatINR(cogsSavedOnRto)}</span>
          </div>
          <div className="text-slate-600 dark:text-slate-400 leading-relaxed space-y-0.5">
            <div>• <strong>Delivered Revenue:</strong> {actualDelivered} units × {formatINR(entry.sellingPrice)} = {formatINR(actualRev)}</div>
            <div>• <strong>Product Cost (COGS) Saved:</strong> RTO units warehouse stock me wapas aane se Product Cost ({formatINR(effectiveProductCost)}/unit) safe wapas mil jata hai.</div>
            <div>• <strong>RTO Shipping & Freight Loss:</strong> {actualRto} RTO orders × (Shipping {formatINR(effectiveShippingCost)} + RTO Fee {formatINR(rtoShippingFee)}) = <span className="text-rose-600 dark:text-rose-400 font-bold">-{formatINR(totalRtoCourierLoss)}</span></div>
            <div>• <strong>Total Ad Spend:</strong> Batch Ad spend = <span className="text-rose-600 dark:text-rose-400 font-bold">-{formatINR(totalAdSpend)}</span> (Marketing cost across all {entry.orders} orders)</div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Delivered Orders</label>
              <input
                type="number"
                min="0"
                value={actualDelivered}
                onChange={e => setActualDelivered(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Actual RTO Orders</label>
              <input
                type="number"
                min="0"
                value={actualRto}
                onChange={e => setActualRto(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cancelled Orders</label>
              <input
                type="number"
                min="0"
                value={cancelled}
                onChange={e => setCancelled(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Returned Orders</label>
              <input
                type="number"
                min="0"
                value={returned}
                onChange={e => setReturned(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Exchange Orders</label>
              <input
                type="number"
                min="0"
                value={exchange}
                onChange={e => setExchange(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Refund Orders</label>
              <input
                type="number"
                min="0"
                value={refund}
                onChange={e => setRefund(Number(e.target.value))}
                className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Reconciliation Notes</label>
            <input
              type="text"
              value={reconciliationNotes}
              onChange={e => setReconciliationNotes(e.target.value)}
              placeholder="e.g. Bluedart NDR resolved 3 packages, 1 lost in transit"
              className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              Save & Recalculate Dashboard
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
