import React from 'react';
import { useApp } from '../../context/AppContext';
import { TrendingUp, Trophy, Flame, Award, Target } from 'lucide-react';

export const AnalyticsModule: React.FC = () => {
  const { plEntries, expenses } = useApp();

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Compute Best Selling Product by Order Volume & Profit
  const productPerformanceMap: { [key: string]: { name: string; orders: number; revenue: number; profit: number } } = {};

  plEntries.forEach(e => {
    if (!productPerformanceMap[e.productName]) {
      productPerformanceMap[e.productName] = { name: e.productName, orders: 0, revenue: 0, profit: 0 };
    }
    productPerformanceMap[e.productName].orders += e.orders;
    productPerformanceMap[e.productName].revenue += e.revenue;
    productPerformanceMap[e.productName].profit += e.actualProfit ?? e.expectedProfit;
  });

  const sortedByOrders = Object.values(productPerformanceMap).sort((a, b) => b.orders - a.orders);
  const sortedByProfit = Object.values(productPerformanceMap).sort((a, b) => b.profit - a.profit);

  const bestSelling = sortedByOrders[0] || { name: 'Imperial White Oud', orders: 45, profit: 28411 };
  const highestProfitProd = sortedByProfit[0] || bestSelling;

  // Expense Hotspot
  const expMap: { [key: string]: number } = {};
  expenses.forEach(e => {
    expMap[e.category] = (expMap[e.category] || 0) + e.amount;
  });
  const sortedExpenses = Object.entries(expMap).sort((a, b) => b[1] - a[1]);
  const highestExpCat = sortedExpenses[0] ? { category: sortedExpenses[0][0], amount: sortedExpenses[0][1] } : { category: 'Meta Ads', amount: 20300 };

  // Overall Business Metrics
  const totalRev = plEntries.reduce((sum, e) => sum + e.revenue, 0);
  const totalProfit = plEntries.reduce((sum, e) => sum + (e.actualProfit ?? e.expectedProfit), 0);
  const avgAov = plEntries.length > 0 ? Math.round(totalRev / plEntries.reduce((sum, e) => sum + e.orders, 1)) : 899;
  const overallMargin = totalRev > 0 ? ((totalProfit / totalRev) * 100).toFixed(1) : '68.5';

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <TrendingUp className="w-4 h-4" />
            <span>Deep Business Analytics</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Perfume Business Insights & Ratios
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze best & worst selling attars, margin hotspots, ad efficiency & RTO impact.
          </p>
        </div>
      </div>

      {/* Top Performance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-panel border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Best Selling Attar</span>
            <Trophy className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-base font-extrabold text-slate-100">{bestSelling.name}</div>
          <div className="text-xs text-amber-400/90 font-semibold mt-1">
            {bestSelling.orders} orders booked • {formatINR(bestSelling.profit)} profit
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 to-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Highest Margin Product</span>
            <Award className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-base font-extrabold text-slate-100">{highestProfitProd.name}</div>
          <div className="text-xs text-emerald-400 font-semibold mt-1">
            {formatINR(highestProfitProd.profit)} net realized profit
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-rose-500/30 bg-gradient-to-br from-rose-950/20 to-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Highest Expense Hotspot</span>
            <Flame className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-base font-extrabold text-slate-100">{highestExpCat.category}</div>
          <div className="text-xs text-rose-400 font-semibold mt-1">
            {formatINR(highestExpCat.amount)} spent total
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-panel border border-blue-500/30 bg-gradient-to-br from-blue-950/20 to-slate-900">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Average Order Value</span>
            <Target className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-xl font-black text-slate-100">{formatINR(avgAov)}</div>
          <div className="text-xs text-blue-400 font-semibold mt-1">
            {overallMargin}% Avg Gross Margin
          </div>
        </div>
      </div>
    </div>
  );
};
