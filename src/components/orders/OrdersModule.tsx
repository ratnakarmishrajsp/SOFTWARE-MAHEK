import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Plus, Search, Trash2, RotateCcw, X, CreditCard, Truck, CheckCircle } from 'lucide-react';

export const OrdersModule: React.FC = () => {
  const { orders, addOrder, updateOrderStatus, deleteOrder, clearOrdersHistory, products, globalSearch } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentFilter, setPaymentFilter] = useState<'all' | 'Prepaid' | 'COD'>('all');

  // Form state
  const [customerName, setCustomerName] = useState<string>('Vikram Sharma');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [city, setCity] = useState<string>('Delhi');
  const [stateName, setStateName] = useState<string>('Delhi');
  const [productId, setProductId] = useState<string>(products[0]?.id || 'prod-1');
  const [customProductName, setCustomProductName] = useState<string>('Imperial White Oud 12ml');
  const [quantity, setQuantity] = useState<number>(2);
  const [pricePerUnit, setPricePerUnit] = useState<number>(899);
  const [paymentType, setPaymentType] = useState<'COD' | 'Prepaid'>('Prepaid');
  const [paymentRef, setPaymentRef] = useState<string>('UPI/40921820129');

  const selectedProduct = products.find(p => p.id === productId);
  const activePrice = selectedProduct?.sellingPrice || pricePerUnit;
  const totalAmount = activePrice * quantity;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addOrder({
      orderNumber: `MKH-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      customerName,
      phone,
      city,
      state: stateName,
      items: [{ productName: selectedProduct?.name || customProductName, quantity: Number(quantity), price: activePrice }],
      totalAmount,
      paymentType,
      paymentRef: paymentType === 'Prepaid' ? paymentRef.trim() : undefined,
      status: 'Pending',
      trackingNumber: `AWB${Math.floor(1000000 + Math.random() * 9000000)}`,
      date: new Date().toISOString().split('T')[0],
      expectedDeliveryDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0]
    });
    setIsModalOpen(false);
  };

  const formatINR = (val: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  const query = (search || globalSearch).toLowerCase();

  // Metrics
  const prepaidOrdersList = orders.filter(o => o.paymentType === 'Prepaid');
  const codOrdersList = orders.filter(o => o.paymentType === 'COD');

  const totalPrepaidAmount = prepaidOrdersList.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalCodAmount = codOrdersList.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalAllAmount = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const prepaidRatio = orders.length > 0 ? Math.round((prepaidOrdersList.length / orders.length) * 100) : 0;

  const filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.city.toLowerCase().includes(query) ||
      (o.paymentRef && o.paymentRef.toLowerCase().includes(query)) ||
      o.items.some(i => i.productName.toLowerCase().includes(query));

    const matchesFilter =
      paymentFilter === 'all' ? true : o.paymentType === paymentFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Logistics & Payment Records</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Orders Pipeline & Prepaid Collections
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Track customer orders, Prepaid UPI/Card payments, COD collections & AWB shipment tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {orders.length > 0 && (
            <button
              onClick={() => clearOrdersHistory()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold text-xs transition-all cursor-pointer"
              title="Clear all order records"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Clear Orders History</span>
            </button>
          )}

          <button
            onClick={() => {
              setPaymentType('Prepaid');
              setIsModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold text-xs transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>+ Log Prepaid Order</span>
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* KPI Cards (Prepaid Collections & Pipeline Overview) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Prepaid Collection KPI */}
        <div className="p-4 rounded-2xl glass-card border border-emerald-500/30 bg-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              Total Prepaid Money Received
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              {prepaidRatio}% of Orders
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatINR(totalPrepaidAmount)}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {prepaidOrdersList.length} Prepaid orders recorded (UPI / Gateway)
          </span>
        </div>

        {/* COD Pending KPI */}
        <div className="p-4 rounded-2xl glass-card border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1.5">
              <Truck className="w-4 h-4" />
              COD Orders Value
            </span>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
              {100 - prepaidRatio}% of Orders
            </span>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {formatINR(totalCodAmount)}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {codOrdersList.length} Cash-on-Delivery orders
          </span>
        </div>

        {/* Total Pipeline KPI */}
        <div className="p-4 rounded-2xl glass-card border border-slate-200 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Orders Pipeline</span>
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">
            {formatINR(totalAllAmount)}
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400">
            {orders.length} total customer orders
          </span>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by order #, customer, UTR, city..."
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
          />
        </div>

        {/* Payment Filter Buttons */}
        <div className="flex items-center gap-1 p-1 rounded-2xl bg-slate-200 dark:bg-slate-800 text-xs font-bold w-full sm:w-auto">
          <button
            onClick={() => setPaymentFilter('all')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              paymentFilter === 'all'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
            }`}
          >
            All Orders ({orders.length})
          </button>

          <button
            onClick={() => setPaymentFilter('Prepaid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              paymentFilter === 'Prepaid'
                ? 'bg-emerald-500 text-white shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>💳 Prepaid Payments ({prepaidOrdersList.length})</span>
          </button>

          <button
            onClick={() => setPaymentFilter('COD')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
              paymentFilter === 'COD'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                : 'text-slate-600 dark:text-slate-400 hover:text-amber-500'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>🚚 COD Orders ({codOrdersList.length})</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="p-4">Order # & Date</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Products Ordered</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment Method & UTR</th>
                <th className="p-4">AWB Tracking #</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 text-xs">
              {filteredOrders.map(ord => (
                <tr key={ord.id} className="hover:bg-slate-100/80 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <div className="font-extrabold text-amber-600 dark:text-amber-400">{ord.orderNumber}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{ord.date}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100">{ord.customerName}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{ord.phone} • {ord.city}, {ord.state}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                    {ord.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">{formatINR(ord.totalAmount)}</td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] flex items-center gap-1 ${
                        ord.paymentType === 'Prepaid'
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                      }`}>
                        {ord.paymentType === 'Prepaid' ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : null}
                        {ord.paymentType}
                      </span>
                      {ord.paymentRef && (
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          Ref: {ord.paymentRef}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-[11px] font-mono text-slate-700 dark:text-slate-300">{ord.trackingNumber}</div>
                  </td>
                  <td className="p-4">
                    <select
                      value={ord.status}
                      onChange={e => updateOrderStatus(ord.id, e.target.value as any)}
                      className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                    >
                      <option value="Pending">Pending</option>
                      <option value="Shipped">Shipped</option>
                      <option value="Delivered">Delivered</option>
                      <option value="RTO">RTO (Returned)</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => deleteOrder(ord.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete order"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredOrders.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    No order records match current filter. Click "Create New Order" to add.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEW ORDER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-amber-500/30 p-6 shadow-2xl animate-in fade-in zoom-in duration-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Log New Customer Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">State</label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={e => setStateName(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Product</label>
                  {products.length > 0 ? (
                    <select
                      value={productId}
                      onChange={e => setProductId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (₹{p.sellingPrice})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customProductName}
                      onChange={e => setCustomProductName(e.target.value)}
                      placeholder="e.g. Imperial White Oud 12ml"
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                      required
                    />
                  )}
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
              </div>

              {products.length === 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    min="1"
                    value={pricePerUnit}
                    onChange={e => setPricePerUnit(Number(e.target.value))}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Type</label>
                  <select
                    value={paymentType}
                    onChange={e => setPaymentType(e.target.value as any)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500 font-bold"
                  >
                    <option value="Prepaid">💳 Prepaid (UPI / Cards)</option>
                    <option value="COD">🚚 COD (Cash on Delivery)</option>
                  </select>
                </div>

                {paymentType === 'Prepaid' && (
                  <div>
                    <label className="block text-xs font-semibold text-emerald-600 dark:text-emerald-400 mb-1">UPI UTR / Txn Reference #</label>
                    <input
                      type="text"
                      value={paymentRef}
                      onChange={e => setPaymentRef(e.target.value)}
                      placeholder="e.g. UPI/40921820129"
                      className="w-full bg-white dark:bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                )}
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
                <span className="text-xs text-amber-800 dark:text-amber-200">Total Order Amount:</span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">{formatINR(totalAmount)}</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-500/20 cursor-pointer"
                >
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersModule;
