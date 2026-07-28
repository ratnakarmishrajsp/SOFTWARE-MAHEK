import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { FileSpreadsheet, Download, Printer, TrendingUp, Receipt, Boxes, Package, X } from 'lucide-react';

export const ReportsModule: React.FC = () => {
  const { plEntries, expenses, inventory, products, settings } = useApp();
  const [reportType, setReportType] = useState<'pl' | 'expense' | 'inventory' | 'product'>('pl');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  // CSV Export Engine
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (reportType === 'pl') {
      csvContent += 'Date,Product,Orders,Selling Price,Revenue,Expected Profit,Actual Profit,RTO %\n';
      plEntries.forEach(row => {
        csvContent += `"${row.date}","${row.productName}",${row.orders},${row.sellingPrice},${row.revenue},${row.expectedProfit},${row.actualProfit ?? row.expectedProfit},${row.expectedRtoPercent}%\n`;
      });
    } else if (reportType === 'expense') {
      csvContent += 'Date,Category,SubCategory,Amount,Payment Method,Paid By\n';
      expenses.forEach(row => {
        csvContent += `"${row.date}","${row.category}","${row.subCategory}",${row.amount},"${row.paymentMethod}","${row.paidBy}"\n`;
      });
    } else if (reportType === 'inventory') {
      csvContent += 'Item Name,Type,Current Stock,Unit,Average Cost,Total Stock Value\n';
      inventory.forEach(row => {
        csvContent += `"${row.name}","${row.type}",${row.currentStock},"${row.unit}",${row.averageCost},${row.totalStockValue}\n`;
      });
    } else {
      csvContent += 'Product Title,Bottle Size,Category,Cost Price,Selling Price,Stock\n';
      products.forEach(row => {
        csvContent += `"${row.name}","${row.bottleSize}","${row.category}",${row.costPrice},${row.sellingPrice},${row.stock}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Mahekh_ERP_${reportType.toUpperCase()}_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Executive Reporting Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100 tracking-tight">
            Reports & Business Exports
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Export P&L summaries, expense ledgers & inventory valuations to CSV, Excel or Printable PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 hover:border-slate-600 text-amber-400 font-bold text-xs transition-all"
          >
            <Printer className="w-4 h-4" />
            <span>Printable PDF Preview</span>
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV / Excel</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-3">
        {[
          { id: 'pl', label: 'Profit & Loss Report', icon: TrendingUp },
          { id: 'expense', label: 'Expense Ledger', icon: Receipt },
          { id: 'inventory', label: 'Inventory Valuation', icon: Boxes },
          { id: 'product', label: 'Product Performance', icon: Package }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setReportType(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
              reportType === tab.id
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'glass-panel text-slate-400 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Data Preview Table */}
      <div className="rounded-3xl glass-panel border border-slate-800 overflow-hidden shadow-2xl p-6">
        <h3 className="text-sm font-bold text-slate-100 mb-4 capitalize">
          {reportType} Master Report Preview
        </h3>

        <div className="overflow-x-auto">
          {reportType === 'pl' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase">
                  <th className="p-3">Date</th>
                  <th className="p-3">Product</th>
                  <th className="p-3">Orders</th>
                  <th className="p-3">Revenue</th>
                  <th className="p-3">Exp. Profit</th>
                  <th className="p-3">Actual Profit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {plEntries.map(e => (
                  <tr key={e.id}>
                    <td className="p-3 text-amber-400 font-semibold">{e.date}</td>
                    <td className="p-3 font-bold text-slate-100">{e.productName}</td>
                    <td className="p-3">{e.orders}</td>
                    <td className="p-3 font-bold">{formatINR(e.revenue)}</td>
                    <td className="p-3 text-blue-400">{formatINR(e.expectedProfit)}</td>
                    <td className="p-3 font-black text-emerald-400">{formatINR(e.actualProfit ?? e.expectedProfit)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'expense' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase">
                  <th className="p-3">Date</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Sub Category</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Payment Method</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {expenses.map(e => (
                  <tr key={e.id}>
                    <td className="p-3 text-amber-400">{e.date}</td>
                    <td className="p-3 font-bold text-slate-200">{e.category}</td>
                    <td className="p-3 text-slate-300">{e.subCategory}</td>
                    <td className="p-3 font-bold text-rose-300">{formatINR(e.amount)}</td>
                    <td className="p-3 text-slate-400">{e.paymentMethod}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'inventory' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase">
                  <th className="p-3">Item Name</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Stock Level</th>
                  <th className="p-3">Avg Cost</th>
                  <th className="p-3">Total Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {inventory.map(i => (
                  <tr key={i.id}>
                    <td className="p-3 font-bold text-slate-100">{i.name}</td>
                    <td className="p-3 text-slate-400">{i.type}</td>
                    <td className="p-3 font-bold text-amber-400">{i.currentStock} {i.unit}</td>
                    <td className="p-3">₹{i.averageCost}</td>
                    <td className="p-3 font-extrabold text-emerald-400">{formatINR(i.totalStockValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'product' && (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase">
                  <th className="p-3">Product Name</th>
                  <th className="p-3">Bottle Size</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Cost Price</th>
                  <th className="p-3">Selling Price</th>
                  <th className="p-3">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map(p => (
                  <tr key={p.id}>
                    <td className="p-3 font-bold text-slate-100">{p.name}</td>
                    <td className="p-3 text-amber-400 font-semibold">{p.bottleSize}</td>
                    <td className="p-3 text-slate-300">{p.category}</td>
                    <td className="p-3 text-slate-400">₹{p.costPrice}</td>
                    <td className="p-3 font-bold text-emerald-400">{formatINR(p.sellingPrice)}</td>
                    <td className="p-3 font-extrabold">{p.stock} units</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* PRINTABLE PDF REPORT MODAL */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
          <div className="glass-panel w-full max-w-3xl rounded-3xl border border-amber-500/30 p-8 bg-slate-900 text-slate-100 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-slate-100">Executive Print View</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
                >
                  Print / Save PDF
                </button>
                <button onClick={() => setIsPrintModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-200">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Print Content Document Header */}
            <div className="py-6 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                <div>
                  <h2 className="text-2xl font-black text-amber-400 uppercase tracking-tight">Mahekh ERP</h2>
                  <p className="text-xs text-slate-400">D2C Perfume & Attar Business Statement</p>
                </div>
                <div className="text-right text-xs text-slate-400">
                  <div>GSTIN: {settings.gstNumber}</div>
                  <div>Date: {new Date().toLocaleDateString()}</div>
                </div>
              </div>

              <div className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Official Report: {reportType.toUpperCase()}
              </div>

              {/* Table print */}
              <div className="border border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-amber-300">
                      <th className="p-3">Item / Date</th>
                      <th className="p-3">Category / Details</th>
                      <th className="p-3 text-right">Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {reportType === 'pl' &&
                      plEntries.map(e => (
                        <tr key={e.id}>
                          <td className="p-3">{e.date} - {e.productName}</td>
                          <td className="p-3">{e.orders} orders booked</td>
                          <td className="p-3 text-right font-bold text-emerald-400">{formatINR(e.actualProfit ?? e.expectedProfit)}</td>
                        </tr>
                      ))}
                    {reportType === 'expense' &&
                      expenses.map(e => (
                        <tr key={e.id}>
                          <td className="p-3">{e.date} - {e.category}</td>
                          <td className="p-3">{e.subCategory}</td>
                          <td className="p-3 text-right font-bold text-rose-300">{formatINR(e.amount)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
