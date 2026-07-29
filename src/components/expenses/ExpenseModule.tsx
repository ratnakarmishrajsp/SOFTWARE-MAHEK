import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import type { ExpenseEntry, ExpenseCategory } from '../../types';
import { Receipt, Plus, Search, Trash2, Zap, RotateCcw, User, Truck } from 'lucide-react';

export type DateFilterType = 'today' | 'yesterday' | '7days' | '30days' | 'all' | 'custom';

const DEFAULT_SUBCATEGORIES: Partial<Record<ExpenseCategory, string>> = {
  'Shiprocket Recharge': 'Shiprocket Wallet Shipping Balance Recharge',
  'Meta Ads': 'Instagram Reels Attar Ad Campaign',
  'Google Ads': 'Google Search & Shopping Ad Campaign',
  'Packaging Supplies': 'Corrugated Boxes, Bubble Wrap & Tape Bulk Order',
  'Warehouse Rent': 'Monthly Fulfillment & Warehouse Rent Fee',
  'Staff Salary': 'Monthly Employee Payroll Disbursement',
  'Office & Utilities': 'Electricity, Internet & Office Maintenance',
  'Software & Subscriptions': 'Shopify Apps, Shiprocket & ERP Subscriptions',
  'Miscellaneous': 'Office Refreshments & Misc Expenses'
};

export const ExpenseModule: React.FC = () => {
  const { expenses, addExpense, deleteExpense, clearExpenseHistory, globalSearch } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Date Filter State
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

  // Form State
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState<ExpenseCategory>('Meta Ads');
  const [subCategory, setSubCategory] = useState<string>(DEFAULT_SUBCATEGORIES['Meta Ads'] || 'Instagram Reels Attar Ad Campaign');
  const [staffName, setStaffName] = useState<string>('Ramesh Kumar (Packaging Head)');
  const [amount, setAmount] = useState<number>(4500);
  const [paymentMethod, setPaymentMethod] = useState<ExpenseEntry['paymentMethod']>('Credit Card');
  const [paidBy, setPaidBy] = useState<string>('Ratnakar');
  const [notes, setNotes] = useState<string>('');

  const handleCategoryChange = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    setSubCategory(DEFAULT_SUBCATEGORIES[newCat] || '');
  };

  const openShiprocketQuickModal = () => {
    setCategory('Shiprocket Recharge');
    setSubCategory('Shiprocket Wallet Shipping Balance Recharge');
    setAmount(2000);
    setPaymentMethod('UPI');
    setNotes('Shiprocket Shipping Wallet Top-up');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedSubCategory =
      category === 'Staff Salary' && staffName.trim()
        ? `${subCategory} (Staff: ${staffName.trim()})`
        : subCategory;

    addExpense({
      date,
      category,
      subCategory: formattedSubCategory,
      amount: Number(amount),
      paymentMethod,
      paidBy,
      description: notes || formattedSubCategory,
      notes: category === 'Staff Salary' ? `Staff Name: ${staffName}. ${notes}` : notes
    });
    setIsModalOpen(false);
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

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

  const query = (search || globalSearch).toLowerCase();
  const filteredExpenses = expenses.filter(
    e =>
      (e.category.toLowerCase().includes(query) ||
      e.subCategory.toLowerCase().includes(query) ||
      e.date.includes(query) ||
      (e.notes && e.notes.toLowerCase().includes(query))) &&
      filterByDateRange(e.date)
  );

  const activeExpenses = expenses.filter(e => filterByDateRange(e.date));
  const totalExpenseSum = activeExpenses.reduce((sum, e) => sum + e.amount, 0);
  const adSpendSum = activeExpenses
    .filter(e => e.category === 'Meta Ads' || e.category === 'Google Ads')
    .reduce((sum, e) => sum + e.amount, 0);
  const shiprocketSum = activeExpenses
    .filter(e => e.category === 'Shiprocket Recharge')
    .reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <Receipt className="w-4 h-4" />
            <span>Overhead, Shipping & Ad Expenditure</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Expense Manager
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Track Meta Ads, Shiprocket wallet recharges, office rent, staff salaries, and packing expenditures.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {expenses.length > 0 && (
            <button
              onClick={() => clearExpenseHistory()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear History</span>
            </button>
          )}
          <button
            onClick={openShiprocketQuickModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 font-bold text-xs transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4" />
            <span>⚡ Log Shiprocket Recharge</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Log New Expense</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Expenses Logged ({dateFilter})</span>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{formatINR(totalExpenseSum)}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">{activeExpenses.length} vouchers recorded</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-purple-500" />
            Shiprocket Shipping Recharges
          </span>
          <div className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">{formatINR(shiprocketSum)}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Courier wallet top-ups</span>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-blue-500" />
            Total Meta & Google Ad Spend
          </span>
          <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{formatINR(adSpendSum)}</div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">Marketing campaign recharges</span>
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
            placeholder="Search expenses by category..."
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

      {/* Expenses Table */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Date</th>
                <th className="p-4">Category & Details</th>
                <th className="p-4">Payment Method</th>
                <th className="p-4">Paid By</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
              {filteredExpenses.map(expense => (
                <tr key={expense.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-100">{expense.date}</td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 mb-1">
                      {expense.category}
                    </span>
                    <div className="font-bold text-slate-800 dark:text-slate-200">{expense.subCategory}</div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{expense.paymentMethod}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-400">{expense.paidBy}</td>
                  <td className="p-4 font-black text-rose-600 dark:text-rose-400 text-sm">
                    {formatINR(expense.amount)}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredExpenses.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No expense records match current filter. Click "Log New Expense" to add.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW EXPENSE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-amber-500/30 p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">Log New Expense Voucher</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => handleCategoryChange(e.target.value as ExpenseCategory)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold"
                  >
                    <option value="Shiprocket Recharge">🚚 Shiprocket Recharge (Wallet)</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="Google Ads">Google Ads</option>
                    <option value="Packaging Supplies">Packaging Supplies</option>
                    <option value="Warehouse Rent">Warehouse Rent</option>
                    <option value="Staff Salary">Staff Salary</option>
                    <option value="Office & Utilities">Office & Utilities</option>
                    <option value="Software & Subscriptions">Software & Subscriptions</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
              </div>

              {/* DYNAMIC STAFF NAME FIELD (WHEN CATEGORY IS STAFF SALARY) */}
              {category === 'Staff Salary' && (
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                  <label className="block font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-amber-500" />
                    Staff / Employee Name
                  </label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={e => setStaffName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar (Packaging Manager)"
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                    required={category === 'Staff Salary'}
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Subcategory / Campaign Title</label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={e => setSubCategory(e.target.value)}
                  placeholder="e.g. Instagram Reels Attar Ad Campaign"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onFocus={e => e.target.select()}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100 font-black text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as ExpenseEntry['paymentMethod'])}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                  >
                    <option value="UPI">UPI</option>
                    <option value="Credit Card">Credit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Paid By / Authorized Person</label>
                <input
                  type="text"
                  value={paidBy}
                  onChange={e => setPaidBy(e.target.value)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Notes / Invoice Reference</label>
                <input
                  type="text"
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="e.g. Meta Ads Account #9821 Invoice Ref"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
