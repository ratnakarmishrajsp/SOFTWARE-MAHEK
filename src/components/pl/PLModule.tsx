import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { PLEntry } from '../../types';
import {
  Calculator,
  Plus,
  Search,
  Trash2,
  Pencil,
  X,
  Sparkles,
  RotateCcw,
  Zap,
  Sliders,
  DollarSign,
  Target,
  Info,
  Calendar,
  HelpCircle,
  MessageCircle
} from 'lucide-react';

export type DateFilterType = 'today' | 'yesterday' | '7days' | '30days' | 'all' | 'custom';

export const PLModule: React.FC = () => {
  const {
    plEntries,
    addPLEntry,
    updatePLEntry,
    deletePLEntry,
    clearPLHistory,
    settings,
    isQuickAddOpen,
    setIsQuickAddOpen,
    globalSearch
  } = useApp();

  const [search, setSearch] = useState('');
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  const [showFormulaHelp, setShowFormulaHelp] = useState<boolean>(false);

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [customProductName, setCustomProductName] = useState<string>('Shopify Daily Store Sales');
  const [ordersInput, setOrdersInput] = useState<string>('30');

  // SALES INPUT MODE
  const [salesMode, setSalesMode] = useState<'perUnit' | 'totalSales'>('perUnit');
  const [sellingPriceInput, setSellingPriceInput] = useState<string>('899');
  const [totalSalesInput, setTotalSalesInput] = useState<string>('26970');

  // COST INPUT MODE
  const [costMode, setCostMode] = useState<'combined' | 'detailed'>('combined');
  const [combinedCostInput, setCombinedCostInput] = useState<string>('348');

  // AD SPEND INPUT MODE
  const [adSpendMode, setAdSpendMode] = useState<'totalSpend' | 'cpp'>('totalSpend');
  const [totalAdSpendInput, setTotalAdSpendInput] = useState<string>('6742');
  const [cppInput, setCppInput] = useState<string>('225');

  // Detailed Breakdown Fields
  const [productCostInput, setProductCostInput] = useState<string>(String(settings.defaultProductCost || 180));
  const [packagingCostInput, setPackagingCostInput] = useState<string>('35');
  const [shippingCostInput, setShippingCostInput] = useState<string>(String(settings.defaultShippingCost || 75));
  const [codChargeInput, setCodChargeInput] = useState<string>('40');
  const [paymentGatewayChargeInput, setPaymentGatewayChargeInput] = useState<string>('18');
  const [expectedRtoPercentInput, setExpectedRtoPercentInput] = useState<string>(String(settings.defaultRtoPercent || 18));
  const [otherChargesInput, setOtherChargesInput] = useState<string>('10');
  const [notes, setNotes] = useState<string>('');

  // Clean numeric conversions
  const orders = Math.max(1, Number(ordersInput) || 0);
  const combinedCost = Number(combinedCostInput) || 0;
  const productCost = Number(productCostInput) || 0;
  const packagingCost = Number(packagingCostInput) || 0;
  const shippingCost = Number(shippingCostInput) || 0;
  const codCharge = Number(codChargeInput) || 0;
  const paymentGatewayCharge = Number(paymentGatewayChargeInput) || 0;
  const expectedRtoPercent = Number(expectedRtoPercentInput) || 0;
  const otherCharges = Number(otherChargesInput) || 0;

  // Derive Selling Price vs Total Sales
  let sellingPrice = 0;
  let calcRevenue = 0;

  if (salesMode === 'perUnit') {
    sellingPrice = Number(sellingPriceInput) || 0;
    calcRevenue = orders * sellingPrice;
  } else {
    calcRevenue = Number(totalSalesInput) || 0;
    sellingPrice = orders > 0 ? Math.round(calcRevenue / orders) : 0;
  }

  // Derive Total Ad Spend vs CPP
  let totalAdSpend = 0;
  let cpp = 0;

  if (adSpendMode === 'totalSpend') {
    totalAdSpend = Number(totalAdSpendInput) || 0;
    cpp = orders > 0 ? Math.round(totalAdSpend / orders) : 0;
  } else {
    cpp = Number(cppInput) || 0;
    totalAdSpend = orders * cpp;
  }

  const productName = customProductName.trim() || 'Shopify Daily Store Sales';

  const detailedTotalCost =
    productCost + packagingCost + shippingCost + codCharge + paymentGatewayCharge + otherCharges;
  const totalCostPerOrder = costMode === 'combined' ? combinedCost : detailedTotalCost;

  const calcExpectedDelivered = orders * (1 - expectedRtoPercent / 100);
  const calcExpectedRto = orders * (expectedRtoPercent / 100);

  const effectiveShipping = costMode === 'combined' ? (settings.defaultShippingCost || 130) : shippingCost;
  const effectivePackaging = costMode === 'combined' ? 35 : packagingCost;
  const rtoCourierFee = settings.defaultRtoShippingCharge || 120;
  const rtoLossPerUnit = effectiveShipping + rtoCourierFee + effectivePackaging;

  const totalDeliveredCost = calcExpectedDelivered * totalCostPerOrder;
  const totalRtoCourierLoss = calcExpectedRto * rtoLossPerUnit;

  const grossProfit = Math.round(
    calcRevenue - totalDeliveredCost - totalRtoCourierLoss
  );

  const netProfitAfterAds = Math.round(grossProfit - totalAdSpend);
  const calcExpectedProfit = netProfitAfterAds;
  const calcExpectedMargin = calcRevenue > 0 ? Number(((netProfitAfterAds / calcRevenue) * 100).toFixed(2)) : 0;
  const calcAov = orders > 0 ? Math.round(calcRevenue / orders) : 0;
  const calcExpectedRoas = totalAdSpend > 0 ? Number((calcRevenue / totalAdSpend).toFixed(2)) : 0;

  const handleEditClick = (entry: PLEntry) => {
    setEditingEntryId(entry.id);
    setDate(entry.date);
    setCustomProductName(entry.productName || 'Shopify Daily Store Sales');
    setOrdersInput(String(entry.orders));
    setSalesMode(entry.salesMode || 'perUnit');
    setSellingPriceInput(String(entry.sellingPrice));
    setTotalSalesInput(String(entry.totalSalesAmount || entry.revenue));
    setCostMode(entry.costMode || 'combined');
    setCombinedCostInput(String(entry.combinedCost || entry.totalOrderCost));
    setAdSpendMode(entry.adSpendMode || 'totalSpend');
    setTotalAdSpendInput(String(entry.totalAdSpend || 0));
    setCppInput(String(entry.cpp || 0));
    setExpectedRtoPercentInput(String(entry.expectedRtoPercent || 18));
    setNotes(entry.notes || '');
    setIsQuickAddOpen(true);
  };

  const handleOpenNew = () => {
    setEditingEntryId(null);
    setDate(new Date().toISOString().split('T')[0]);
    setCustomProductName('Shopify Daily Store Sales');
    setOrdersInput('30');
    setSalesMode('perUnit');
    setSellingPriceInput('899');
    setTotalSalesInput('26970');
    setCostMode('combined');
    setCombinedCostInput('348');
    setAdSpendMode('totalSpend');
    setTotalAdSpendInput('6742');
    setCppInput('225');
    setExpectedRtoPercentInput('18');
    setNotes('');
    setIsQuickAddOpen(true);
  };

  const handleCreateOrUpdateEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      date,
      productId: 'prod-daily-sales',
      productName,
      orders,
      sellingPrice,
      salesMode,
      totalSalesAmount: calcRevenue,
      costMode,
      combinedCost,
      adSpendMode,
      totalAdSpend,
      cpp,
      productCost,
      packagingCost,
      shippingCost,
      codCharge,
      paymentGatewayCharge,
      expectedRtoPercent,
      otherCharges,
      revenue: calcRevenue,
      expectedDeliveredOrders: Number(calcExpectedDelivered.toFixed(1)),
      expectedRtoOrders: Number(calcExpectedRto.toFixed(1)),
      totalOrderCost: totalCostPerOrder,
      expectedProfit: calcExpectedProfit,
      netProfitAfterAds,
      expectedMargin: calcExpectedMargin,
      aov: calcAov,
      expectedRoas: calcExpectedRoas,
      notes
    };

    if (editingEntryId) {
      updatePLEntry(editingEntryId, payload);
    } else {
      addPLEntry(payload);
      setDateFilter('all');
    }
    setEditingEntryId(null);
    setIsQuickAddOpen(false);
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // Date Filtering Logic
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

  const query = (search || globalSearch).toLowerCase();
  const filteredEntries = plEntries.filter(e => {
    const matchesSearch =
      e.productName.toLowerCase().includes(query) ||
      e.date.includes(query) ||
      (e.notes && e.notes.toLowerCase().includes(query));

    return matchesSearch && filterByDateRange(e.date);
  });

  const activeEntries = plEntries.filter(e => filterByDateRange(e.date));
  const activeRevenue = activeEntries.reduce((sum, e) => sum + e.revenue, 0);
  const activeProfit = activeEntries.reduce((sum, e) => sum + (e.netProfitAfterAds ?? e.expectedProfit), 0);
  const activeAdSpend = activeEntries.reduce((sum, e) => sum + (e.totalAdSpend || 0), 0);
  const activeOrdersCount = activeEntries.reduce((sum, e) => sum + e.orders, 0);

  const handleShareWhatsApp = (entry: PLEntry) => {
    const profitVal = entry.netProfitAfterAds ?? entry.expectedProfit;
    const text = `🌸 *MAHEKH PERFUME - P&L REPORT* 🌸
📅 *Date:* ${entry.date}
📦 *Batch:* ${entry.productName}
-----------------------------------
📊 *Total Orders:* ${entry.orders}
💰 *Total Revenue:* ${formatINR(entry.revenue)}
🎯 *Meta Ad Spend:* ${formatINR(entry.totalAdSpend || 0)} (CPP: ₹${entry.cpp || 0})
📦 *Total Cost/Order:* ₹${entry.totalOrderCost}
-----------------------------------
💵 *Real Net Profit:* ${formatINR(profitVal)}
✨ *ROAS:* ${entry.expectedRoas}x
📈 *Margin:* ${entry.expectedMargin}%
-----------------------------------
*Generated via Mahekh ERP Suite*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleShareSummaryWhatsApp = () => {
    const text = `🌸 *MAHEKH PERFUME - P&L SUMMARY REPORT* 🌸
📅 *Range:* ${dateFilter === 'all' ? 'All Time' : dateFilter}
-----------------------------------
📊 *Total Revenue:* ${formatINR(activeRevenue)}
💵 *Real Net Profit:* ${formatINR(activeProfit)}
🎯 *Total Ad Spend:* ${formatINR(activeAdSpend)}
📦 *Total Orders:* ${activeOrdersCount}
-----------------------------------
*Mahekh D2C Business Suite*`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>P&L Calculation Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Profit & Loss Entry Manager
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Log Shopify Total Sales, Combined All-In Costs, Meta Ad Spend & CPP.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {plEntries.length > 0 && (
            <button
              onClick={handleShareSummaryWhatsApp}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all cursor-pointer shadow-sm"
              title="Share active P&L summary via WhatsApp"
            >
              <MessageCircle className="w-4 h-4 text-emerald-500" />
              <span>Share Summary on WhatsApp</span>
            </button>
          )}

          <button
            onClick={handleOpenNew}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Daily Profit Entry</span>
          </button>
        </div>
      </div>

      {/* 4 TOP SUMMARY BANNER CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sales Revenue */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-amber-500" />
            Sales Revenue
          </span>
          <div className="text-xl font-black text-slate-900 dark:text-slate-100 mt-1">{formatINR(activeRevenue)}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{activeEntries.length} entries in range</span>
        </div>

        {/* Card 2: Net Profit */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-500" />
            Real Net Profit
          </span>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{formatINR(activeProfit)}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">After ad spend & RTO cut</span>
        </div>

        {/* Card 3: Ad Spend */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-blue-500" />
            Total Ad Spend
          </span>
          <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{formatINR(activeAdSpend)}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Meta & Google campaigns</span>
        </div>

        {/* Card 4: Total Orders */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-[11px] text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-purple-500" />
            Total Orders Volume
          </span>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400 mt-1">
            {activeOrdersCount} Orders
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Across {activeEntries.length} entries</span>
        </div>
      </div>

      {/* SEARCH & UNIVERSAL DATE RANGE FILTER BAR */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search entries..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
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

      {/* P&L Table */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Date</th>
                <th className="p-4">Orders & AOV</th>
                <th className="p-4">Total Revenue</th>
                <th className="p-4">Cost/Order</th>
                <th className="p-4">Ad Spend / CPP</th>
                <th className="p-4">Real Net Profit</th>
                <th className="p-4">ROAS & Margin</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
              {filteredEntries.map(entry => {
                const profitVal = entry.netProfitAfterAds ?? entry.expectedProfit;
                const isCombined = entry.costMode === 'combined';

                return (
                  <tr key={entry.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Clean Date Column without Product Title */}
                    <td className="p-4">
                      <div className="font-extrabold text-slate-900 dark:text-slate-100 text-sm">{entry.date}</div>
                      {entry.notes && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium truncate max-w-[120px]">
                          {entry.notes}
                        </div>
                      )}
                    </td>

                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-200">
                      {entry.orders} orders
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-mono">AOV: ₹{entry.aov}</span>
                    </td>

                    <td className="p-4 font-extrabold text-slate-900 dark:text-slate-100">
                      {formatINR(entry.revenue)}
                    </td>

                    <td className="p-4">
                      {isCombined ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                          <Zap className="w-3 h-3" /> ₹{entry.combinedCost || entry.totalOrderCost}/order
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                          <Sliders className="w-3 h-3" /> ₹{entry.totalOrderCost}
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-blue-600 dark:text-blue-400 block">{formatINR(entry.totalAdSpend || 0)}</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">CPP: ₹{entry.cpp || 0}</span>
                    </td>

                    <td className="p-4 font-black">
                      <span className={profitVal >= 0 ? 'text-emerald-600 dark:text-emerald-400 text-sm' : 'text-rose-600 dark:text-rose-400 text-sm'}>
                        {formatINR(profitVal)}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-extrabold text-amber-600 dark:text-amber-400 block">{entry.expectedRoas}x ROAS</span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{entry.expectedMargin}% margin</span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleShareWhatsApp(entry)}
                          className="p-1.5 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 border border-emerald-500/30 transition-colors cursor-pointer"
                          title="Share this P&L entry on WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditClick(entry)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 transition-colors cursor-pointer"
                          title="Edit P&L Entry"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deletePLEntry(entry.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete P&L record permanently"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Calculator className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto mb-2" />
                    No P&L entries match current date filter. Click "New Daily Profit Entry" to test.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT P&L ENTRY MODAL */}
      {isQuickAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-2xl rounded-3xl border border-amber-500/30 p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-500">
                  <Calculator className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    {editingEntryId ? 'Edit Daily Profit Entry' : 'New Daily Profit Entry'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Shopify sales, combined cost & Meta ad spend calculator</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setEditingEntryId(null);
                  setIsQuickAddOpen(false);
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/60 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateEntry} className="mt-5 space-y-5">
              {/* DATE & OPTIONAL TAG */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Batch Label / Tag (Optional)</label>
                  <input
                    type="text"
                    value={customProductName}
                    onChange={e => setCustomProductName(e.target.value)}
                    placeholder="e.g. Shopify Daily Store Sales"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">
                    Defaults to "Shopify Daily Store Sales" if left blank
                  </span>
                </div>
              </div>

              {/* ORDERS & REVENUE SECTION */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-500" />
                    1. Orders & Sales Revenue Input
                  </span>
                  <div className="flex gap-1 p-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setSalesMode('perUnit')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        salesMode === 'perUnit'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Selling Price (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSalesMode('totalSales')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        salesMode === 'totalSales'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Total Shopify Sales (₹)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Orders</label>
                    <input
                      type="number"
                      min="1"
                      value={ordersInput}
                      onFocus={e => e.target.select()}
                      onChange={e => setOrdersInput(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  {salesMode === 'perUnit' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Selling Price per Unit (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={sellingPriceInput}
                        onFocus={e => e.target.select()}
                        onChange={e => {
                          setSellingPriceInput(e.target.value);
                          setTotalSalesInput(String(orders * Number(e.target.value)));
                        }}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Shopify Sales Revenue (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={totalSalesInput}
                        onFocus={e => e.target.select()}
                        onChange={e => {
                          setTotalSalesInput(e.target.value);
                          const total = Number(e.target.value) || 0;
                          setSellingPriceInput(String(orders > 0 ? Math.round(total / orders) : 0));
                        }}
                        placeholder="e.g. 10000 Total Shopify Revenue"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60">
                  <span>
                    Calculated Revenue: <span className="text-slate-900 dark:text-slate-100 font-extrabold">{formatINR(calcRevenue)}</span>
                  </span>
                  <span>
                    Calculated AOV: <span className="text-amber-600 dark:text-amber-400 font-bold">₹{calcAov}</span>
                  </span>
                </div>
              </div>

              {/* COST MODE SELECTION TAB */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    2. Product & Delivery Cost Input
                  </span>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                    {costMode === 'combined' ? '⚡ Combined All-In Active' : '📝 Itemized Active'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-200 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setCostMode('combined')}
                    className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      costMode === 'combined'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    Product + Shipping + Charges (Combined)
                  </button>

                  <button
                    type="button"
                    onClick={() => setCostMode('detailed')}
                    className={`flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      costMode === 'detailed'
                        ? 'bg-amber-500 text-slate-950 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    Itemized Detailed Breakdown
                  </button>
                </div>

                {/* COMBINED COST INPUT FIELD */}
                <div className={`p-3.5 rounded-xl border transition-all ${
                  costMode === 'combined'
                    ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                    : 'opacity-40 grayscale blur-[0.5px] pointer-events-none border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-amber-700 dark:text-amber-400">
                      All-In Combined Cost (Product + Shipping + COD + Charges per order) (₹)
                    </label>
                    {costMode === 'combined' && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-slate-950">Active Override</span>
                    )}
                  </div>
                  <input
                    type="number"
                    min="0"
                    value={combinedCostInput}
                    onFocus={e => e.target.select()}
                    onChange={e => setCombinedCostInput(e.target.value)}
                    placeholder="e.g. 348"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                    required={costMode === 'combined'}
                  />
                </div>

                {/* ITEMIZED DETAILED BREAKDOWN FIELDS */}
                <div className={`space-y-2 transition-all ${
                  costMode === 'detailed'
                    ? 'opacity-100'
                    : 'opacity-40 grayscale blur-[0.5px] pointer-events-none'
                }`}>
                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
                    <span>Itemized Breakdown</span>
                    {costMode === 'combined' && (
                      <span className="text-[10px] text-rose-500 dark:text-rose-400 font-medium">
                        🔒 Blurred — Overridden by Combined Cost Mode
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Product Cost (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={productCostInput}
                        onFocus={e => e.target.select()}
                        onChange={e => setProductCostInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Packaging (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={packagingCostInput}
                        onFocus={e => e.target.select()}
                        onChange={e => setPackagingCostInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Shipping (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={shippingCostInput}
                        onFocus={e => e.target.select()}
                        onChange={e => setShippingCostInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">COD Charge (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={codChargeInput}
                        onFocus={e => e.target.select()}
                        onChange={e => setCodChargeInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Gateway Charge (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={paymentGatewayChargeInput}
                        onFocus={e => e.target.select()}
                        onChange={e => setPaymentGatewayChargeInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 dark:text-slate-400 mb-0.5">Other Charges (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={otherChargesInput}
                        onFocus={e => e.target.select()}
                        onChange={e => setOtherChargesInput(e.target.value)}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* META AD SPEND & CPP SECTION */}
              <div className="p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-blue-500" />
                    3. Meta & Google Ad Spend / Cost Per Purchase (CPP)
                  </span>
                  <div className="flex gap-1 p-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setAdSpendMode('totalSpend')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        adSpendMode === 'totalSpend'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Total Ad Spend (₹)
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdSpendMode('cpp')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${
                        adSpendMode === 'cpp'
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      Cost Per Purchase / CPP (₹)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {adSpendMode === 'totalSpend' ? (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Total Meta Ad Spend Today (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={totalAdSpendInput}
                        onFocus={e => e.target.select()}
                        onChange={e => {
                          setTotalAdSpendInput(e.target.value);
                          const total = Number(e.target.value) || 0;
                          setCppInput(String(orders > 0 ? Math.round(total / orders) : 0));
                        }}
                        placeholder="e.g. 2500 Total Ad Recharge / Spend"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cost Per Purchase / CPP / CPA (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={cppInput}
                        onFocus={e => e.target.select()}
                        onChange={e => {
                          setCppInput(e.target.value);
                          const cppVal = Number(e.target.value) || 0;
                          setTotalAdSpendInput(String(orders * cppVal));
                        }}
                        placeholder="e.g. 250 CPP per order"
                        className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Expected RTO %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={expectedRtoPercentInput}
                      onFocus={e => e.target.select()}
                      onChange={e => setExpectedRtoPercentInput(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800/60">
                  <span>
                    Calculated CPP / Order: <span className="text-blue-600 dark:text-blue-400 font-bold">₹{cpp}</span>
                  </span>
                  <span>
                    Total Ad Spend: <span className="text-blue-600 dark:text-blue-400 font-extrabold">{formatINR(totalAdSpend)}</span>
                  </span>
                </div>
              </div>

              {/* LIVE AUTOMATIC CALCULATION PREVIEW BOX WITH FORMULA EXPLAINER */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                    <Sparkles className="w-4 h-4" />
                    <span>Real Net Profit & ROAS Live Calculation</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowFormulaHelp(!showFormulaHelp)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-800 dark:text-amber-200 hover:bg-amber-500/30 transition-colors cursor-pointer border border-amber-500/30"
                  >
                    <HelpCircle className="w-3 h-3 text-amber-500" />
                    <span>How Net Profit is Calculated?</span>
                  </button>
                </div>

                {/* FORMULA EXPLAINER CARD */}
                {showFormulaHelp && (
                  <div className="p-4 rounded-2xl bg-slate-900 text-slate-100 text-xs space-y-3 border border-amber-500/40 animate-in fade-in duration-200 font-mono shadow-2xl">
                    <div className="font-bold text-amber-400 flex items-center justify-between text-sm border-b border-slate-800 pb-2">
                      <span className="flex items-center gap-1.5">
                        <Info className="w-4 h-4 text-amber-400" />
                        Detailed Real Net Profit & RTO Recovery Formula:
                      </span>
                      <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                        D2C Attar Business Standard
                      </span>
                    </div>

                    <div className="space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
                      <p>• <b>Total Revenue</b> = Orders ({orders}) × Selling Price (₹{sellingPrice}) = <span className="text-emerald-400 font-bold">{formatINR(calcRevenue)}</span></p>
                      <p>• <b>Delivered Orders</b> = {orders} × (100 - {expectedRtoPercent}%) = <b>{calcExpectedDelivered.toFixed(1)}</b> orders delivered</p>
                      <p>• <b>RTO Orders</b> = {orders} × {expectedRtoPercent}% = <b>{calcExpectedRto.toFixed(1)}</b> orders returned</p>
                      <p>• <b>Delivered Orders COGS & Courier Cost</b> = {calcExpectedDelivered.toFixed(1)} delivered × ₹{totalCostPerOrder} = <span className="text-slate-200 font-bold">{formatINR(calcExpectedDelivered * totalCostPerOrder)}</span></p>
                      
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 my-2 space-y-1">
                        <p className="text-amber-300 font-bold">📦 RTO Unit Product Cost & Freight Loss Rules:</p>
                        <p>1. <b>Product Cost (COGS) Saved:</b> RTO units warehouse stock me wapas aane se Product Cost ({formatINR(productCost || (combinedCost - (settings.defaultShippingCost || 130) - 35))}/unit) safe wapas stock credit ho jata hai.</p>
                        <p>2. <b>RTO Courier Freight Loss:</b> {calcExpectedRto.toFixed(1)} RTO × (Forward Shipping + RTO Courier Fee ₹120 + Box) = <span className="text-rose-400 font-bold">-{formatINR(calcExpectedRto * ((settings.defaultShippingCost || 130) + (settings.defaultRtoShippingCharge || 120) + 35))}</span></p>
                        <p>3. <b>Meta Ad Spend:</b> Total campaign ad spend = <span className="text-rose-400 font-bold">-{formatINR(totalAdSpend)}</span> (Marketing spent across all {orders} orders)</p>
                      </div>

                      <p className="font-bold text-emerald-400 text-xs pt-1 border-t border-slate-800">
                        👉 <b>REAL NET PROFIT</b> = {formatINR(calcRevenue)} Revenue - Delivered Cost - RTO Freight Loss - Ad Spend = <span className="text-emerald-400 underline">{formatINR(netProfitAfterAds)}</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Total Revenue</span>
                    <span className="font-extrabold text-slate-900 dark:text-slate-100">{formatINR(calcRevenue)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Gross Profit (Before Ads)</span>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatINR(grossProfit)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Meta Ad Spend</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{formatINR(totalAdSpend)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 block text-[10px]">REAL NET PROFIT</span>
                    <span className={`font-black text-sm ${netProfitAfterAds >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {formatINR(netProfitAfterAds)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-amber-500/20 text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">
                    Net Margin: <span className="text-amber-600 dark:text-amber-400 font-bold">{calcExpectedMargin}%</span>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    AOV: <span className="text-amber-600 dark:text-amber-400 font-bold">₹{calcAov}</span>
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    ROAS: <span className="text-emerald-600 dark:text-emerald-400 font-bold">{calcExpectedRoas}x</span>
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes / Campaign Tag</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Meta Ads Instagram Reels Ad Campaign #AttarSummer"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingEntryId(null);
                    setIsQuickAddOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  {editingEntryId ? 'Update P&L Entry' : 'Create P&L Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
