import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import {
  TrendingUp,
  ShoppingBag,
  CheckCircle,
  Clock,
  RotateCcw,
  AlertTriangle,
  Target,
  DollarSign,
  Receipt,
  Sparkles,
  Zap,
  Calendar,
  Plus,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export type DateFilterType = 'today' | 'yesterday' | '7days' | '30days' | 'all' | 'custom';

export const HomeDashboard: React.FC = () => {
  const {
    plEntries,
    expenses,
    orders,
    inventory,
    setIsQuickAddOpen,
    setActiveTab,
    theme
  } = useApp();

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Date Filter Helper
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().split('T')[0];
  const sevenDaysAgoStr = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

  const filterByDateRange = (itemDate: string) => {
    if (dateFilter === 'today') return itemDate === todayStr;
    if (dateFilter === 'yesterday') return itemDate === yesterdayStr;
    if (dateFilter === '7days') return itemDate >= sevenDaysAgoStr;
    if (dateFilter === '30days') return itemDate >= thirtyDaysAgoStr;
    if (dateFilter === 'custom') {
      if (customStartDate && itemDate < customStartDate) return false;
      if (customEndDate && itemDate > customEndDate) return false;
      return true;
    }
    return true; // 'all'
  };

  // Filtered Datasets based on Date Filter Selection
  const filteredPLEntries = plEntries.filter(e => filterByDateRange(e.date));
  const filteredExpenses = expenses.filter(e => filterByDateRange(e.date));

  // 1. Calculate 13 Top Cards Metrics for Active Filter Range
  const totalRevenue = filteredPLEntries.reduce((sum, item) => sum + item.revenue, 0);
  const totalOrders = filteredPLEntries.reduce((sum, item) => sum + item.orders, 0);

  const deliveredOrders = filteredPLEntries.reduce(
    (sum, item) => sum + (item.actualDeliveredOrders ?? item.expectedDeliveredOrders),
    0
  );
  const pendingOrders = orders.filter(o => o.status === 'Pending').length;

  const expectedRtoCount = filteredPLEntries.reduce((sum, item) => sum + item.expectedRtoOrders, 0);
  const actualRtoCount = filteredPLEntries.reduce(
    (sum, item) => sum + (item.actualRtoOrders ?? item.expectedRtoOrders),
    0
  );

  const expectedProfitTotal = filteredPLEntries.reduce((sum, item) => sum + item.expectedProfit, 0);
  const actualProfitTotal = filteredPLEntries.reduce(
    (sum, item) => sum + (item.actualProfit ?? item.expectedProfit),
    0
  );

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = actualProfitTotal - totalExpenses;

  // Aggregate Total Ad Spend from both P&L Entries AND Expense Vouchers in filter range
  const plAdSpend = filteredPLEntries.reduce((sum, p) => sum + (p.totalAdSpend || 0), 0);
  const expenseAdSpend = filteredExpenses
    .filter(e => e.category === 'Meta Ads' || e.category === 'Google Ads')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalAdSpend = plAdSpend + expenseAdSpend;

  // Today's date metrics
  const todayPLEntries = plEntries.filter(e => e.date === todayStr);
  const todaysSales = todayPLEntries.reduce((sum, e) => sum + e.revenue, 0);
  const todaysProfit = todayPLEntries.reduce((sum, e) => sum + (e.actualProfit ?? e.expectedProfit), 0);

  // Formatting helpers
  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // 2. Prepare Data for Visual Charts
  const dateSortedEntries = [...filteredPLEntries].sort((a, b) => a.date.localeCompare(b.date));

  const timelineChartData = dateSortedEntries.map(e => ({
    date: e.date.substring(5), // MM-DD
    fullDate: e.date,
    revenue: e.revenue,
    expectedProfit: Math.round(e.expectedProfit),
    actualProfit: Math.round(e.actualProfit ?? e.expectedProfit),
    orders: e.orders,
    rtoPercent: e.expectedRtoPercent,
    roas: e.expectedRoas,
    productName: e.productName
  }));

  // Expense Category Breakdown
  const categoryExpensesMap: { [key: string]: number } = {};
  filteredExpenses.forEach(e => {
    categoryExpensesMap[e.category] = (categoryExpensesMap[e.category] || 0) + e.amount;
  });

  const expenseCategoryData = Object.keys(categoryExpensesMap).map(cat => ({
    name: cat,
    amount: categoryExpensesMap[cat]
  })).sort((a, b) => b.amount - a.amount);

  const COLORS = ['#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#f97316'];

  // Smart Warnings
  const lowStockItems = inventory.filter(i => i.currentStock <= i.minStockAlert);
  const highRtoWarning = filteredPLEntries.some(p => p.expectedRtoPercent >= 22);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-amber-500/20 bg-gradient-to-r from-amber-500/10 via-slate-100/50 dark:via-slate-900/70 to-amber-950/20">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-widest mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Mahekh Perfume D2C Operations</span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Business Control Center
          </h1>
          <p className="text-xs lg:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Real-time P&L tracking, ad performance & stock monitoring.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setActiveTab('pl');
              setIsQuickAddOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Daily Profit Entry</span>
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all shadow-sm hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-amber-500" />
            <span>Log Expense</span>
          </button>
        </div>
      </div>

      {/* UNIVERSAL DATE RANGE FILTER BAR FOR HOME DASHBOARD */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
          <Filter className="w-4 h-4 text-amber-500" />
          <span>Dashboard Analytics Filter:</span>
        </div>

        {/* Preset Date Range Buttons + Custom Date Picker */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex flex-wrap gap-1 p-1 rounded-2xl bg-slate-200 dark:bg-slate-800 text-xs font-bold w-full md:w-auto">
            <button
              onClick={() => setDateFilter('today')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dateFilter === 'today'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Today
            </button>
            <button
              onClick={() => setDateFilter('yesterday')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dateFilter === 'yesterday'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Yesterday
            </button>
            <button
              onClick={() => setDateFilter('7days')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dateFilter === '7days'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => setDateFilter('30days')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dateFilter === '30days'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => setDateFilter('all')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dateFilter === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateFilter('custom')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                dateFilter === 'custom'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Custom Range
            </button>
          </div>

          {/* Custom Date Inputs */}
          {dateFilter === 'custom' && (
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
                className="bg-transparent border-b border-slate-300 dark:border-slate-700 px-1 py-0.5 text-xs text-slate-900 dark:text-slate-100"
              />
              <span className="text-slate-400 font-bold">to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
                className="bg-transparent border-b border-slate-300 dark:border-slate-700 px-1 py-0.5 text-xs text-slate-900 dark:text-slate-100"
              />
            </div>
          )}
        </div>
      </div>

      {/* Smart Alert Banners */}
      {(lowStockItems.length > 0 || highRtoWarning) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold">Low Stock Warning</h4>
                  <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80">
                    {lowStockItems.length} items (e.g. {lowStockItems[0].name}) hit min reorder alert level.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('inventory')}
                className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs shadow-sm hover:bg-amber-600 cursor-pointer shrink-0"
              >
                Manage Stock
              </button>
            </div>
          )}

          {highRtoWarning && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-900 dark:text-rose-200">
              <div className="flex items-center gap-3">
                <RotateCcw className="w-5 h-5 text-rose-500 shrink-0" />
                <div>
                  <h4 className="text-xs font-bold">High RTO Risk Detected</h4>
                  <p className="text-[11px] text-rose-800/80 dark:text-rose-300/80">
                    Some batches have projected return rate &gt; 22%. Check NDR & address verification.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('pl')}
                className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs shadow-sm hover:bg-rose-600 cursor-pointer shrink-0"
              >
                Review P&L
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 1: 13 CORE KPI METRIC CARDS */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Key Performance Indicators ({dateFilter === 'all' ? 'All Time' : dateFilter})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Live Business Analytics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          {/* Card 1: Total Revenue */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Revenue</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {formatINR(totalRevenue)}
            </div>
            <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <ArrowUpRight className="w-3 h-3" /> +18.4% growth
            </div>
          </div>

          {/* Card 2: Total Orders */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Orders</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {totalOrders}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
              Total batches booked
            </div>
          </div>

          {/* Card 3: Delivered Orders */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Delivered</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <CheckCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {Math.round(deliveredOrders)}
            </div>
            <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mt-2">
              {totalOrders > 0 ? `${Math.round((deliveredOrders / totalOrders) * 100)}% Success Rate` : '0% Success Rate'}
            </div>
          </div>

          {/* Card 4: Pending Orders */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Pending Orders</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {pendingOrders}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-2 font-medium">
              In transit / fulfillment
            </div>
          </div>

          {/* Card 5: Expected RTO */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Expected RTO</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <RotateCcw className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {Math.round(expectedRtoCount)}
            </div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-2 font-medium">
              Based on entry RTO %
            </div>
          </div>

          {/* Card 6: Actual RTO */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Actual RTO</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-rose-600 dark:text-rose-400 tracking-tight">
              {Math.round(actualRtoCount)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
              Reconciled delivery logs
            </div>
          </div>

          {/* Card 7: Expected Profit */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Exp. Profit</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {formatINR(expectedProfitTotal)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
              Projected before delivery
            </div>
          </div>
        </div>

        {/* Second Row of 6 KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
          {/* Card 8: Actual Realized Profit */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Actual Profit</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatINR(actualProfitTotal)}
            </div>
            <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-semibold mt-2">
              Realized Net Margin
            </div>
          </div>

          {/* Card 9: Total Expenses */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-rose-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Total Expenses</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {formatINR(totalExpenses)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
              Ads + Rent + Salaries
            </div>
          </div>

          {/* Card 10: Net Profit */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Net Profit</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
              {formatINR(netProfit)}
            </div>
            <div className="text-[10px] text-amber-600/80 dark:text-amber-400/80 font-medium mt-2">
              After all expenditures
            </div>
          </div>

          {/* Card 11: Total Ad Spend */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-blue-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Total Ad Spend</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {formatINR(totalAdSpend)}
            </div>
            <div className="text-[10px] text-blue-600/80 dark:text-blue-400/80 mt-2 font-medium">
              Meta & Google campaigns
            </div>
          </div>

          {/* Card 12: Today's Sales */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">Today's Sales</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              {formatINR(todaysSales)}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-2">
              {todayStr} revenue
            </div>
          </div>

          {/* Card 13: Today's Profit */}
          <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all group">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Today's Profit</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatINR(todaysProfit)}
            </div>
            <div className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-semibold mt-2">
              Margin today
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: VISUAL CHARTS */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Interactive Visual Analytics ({dateFilter === 'all' ? 'All Time' : dateFilter})
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">Real-time Data Visualization</span>
        </div>

        {/* Grid 1: Revenue vs Profit Trend (Area Chart) & Orders Growth (Bar Chart) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Revenue vs Profit */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Revenue & Net Profit Trend</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Daily revenue vs net profit</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineChartData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} opacity={0.5} />
                  <XAxis dataKey="date" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="revenue" name="Revenue (₹)" stroke="#f59e0b" fillOpacity={1} fill="url(#colorRev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="actualProfit" name="Actual Profit (₹)" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Daily Orders Volume */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Daily Orders Breakdown</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Total units/orders booked per batch</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} opacity={0.5} />
                  <XAxis dataKey="date" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="orders" name="Orders Count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Grid 2: Expenses Breakdown (Pie Chart) & RTO % Monitor */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: Expense Category Share */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Expenses Category Share</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Meta Ads, Rent, Salaries & Office Expenses</p>
              </div>
            </div>
            <div className="h-72 w-full flex items-center justify-center">
              {expenseCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="amount"
                    >
                      {expenseCategoryData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                        borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-slate-400">No expense records logged for selected filter.</div>
              )}
            </div>
          </div>

          {/* Chart 4: Expected RTO % Risk Monitor */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">RTO Risk % Per Entry</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Batches with RTO &gt; 20% require address validation</p>
              </div>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={timelineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#334155' : '#e2e8f0'} opacity={0.5} />
                  <XAxis dataKey="date" stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} />
                  <YAxis stroke={theme === 'dark' ? '#94a3b8' : '#64748b'} fontSize={11} unit="%" />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#0f172a' : '#ffffff',
                      borderColor: theme === 'dark' ? '#334155' : '#cbd5e1',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="rtoPercent" name="RTO %" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
