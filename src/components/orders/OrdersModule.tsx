import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ShoppingBag, Plus, Search, Trash2, RotateCcw, X } from 'lucide-react';

export const OrdersModule: React.FC = () => {
  const { orders, addOrder, updateOrderStatus, deleteOrder, clearOrdersHistory, products, globalSearch } = useApp();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [customerName, setCustomerName] = useState<string>('Vikram Sharma');
  const [phone, setPhone] = useState<string>('+91 98765 43210');
  const [city, setCity] = useState<string>('Delhi');
  const [stateName, setStateName] = useState<string>('Delhi');
  const [productId, setProductId] = useState<string>(products[0]?.id || 'prod-1');
  const [customProductName, setCustomProductName] = useState<string>('Imperial White Oud 12ml');
  const [quantity, setQuantity] = useState<number>(2);
  const [pricePerUnit, setPricePerUnit] = useState<number>(899);
  const [paymentType, setPaymentType] = useState<'COD' | 'Prepaid'>('COD');

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
  const filteredOrders = orders.filter(
    o =>
      o.orderNumber.toLowerCase().includes(query) ||
      o.customerName.toLowerCase().includes(query) ||
      o.city.toLowerCase().includes(query) ||
      o.items.some(i => i.productName.toLowerCase().includes(query))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>Customer Logistics Pipeline</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Orders Pipeline & Fulfillment
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            Track customer orders, COD vs Prepaid status & AWB tracking IDs.
          </p>
        </div>

        <div className="flex items-center gap-3">
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
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Order</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-80">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by order #, customer or city..."
          className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-amber-500"
        />
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
                <th className="p-4">Payment</th>
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
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">{ord.city}, {ord.state}</div>
                  </td>
                  <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                    {ord.items.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                  </td>
                  <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">{formatINR(ord.totalAmount)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                      ord.paymentType === 'Prepaid'
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20'
                    }`}>
                      {ord.paymentType}
                    </span>
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
                    Clean Slate — No orders in record. Click "Create New Order" to test.
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
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-amber-500/30 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100">Log New Customer Order</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Payment Type</label>
                <select
                  value={paymentType}
                  onChange={e => setPaymentType(e.target.value as any)}
                  className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="COD">COD (Cash on Delivery)</option>
                  <option value="Prepaid">Prepaid (UPI / Cards)</option>
                </select>
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
