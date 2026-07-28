import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import type {
  PLEntry,
  ExpenseEntry,
  RawMaterialPurchase,
  Product,
  InventoryItem,
  OrderItem,
  SystemSettings
} from '../types';
import { INITIAL_SETTINGS } from '../data/initialData';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}

interface AppContextType {
  // Navigation & UI State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  globalSearch: string;
  setGlobalSearch: (query: string) => void;
  isQuickAddOpen: boolean;
  setIsQuickAddOpen: (open: boolean) => void;
  isShortcutsOpen: boolean;
  setIsShortcutsOpen: (open: boolean) => void;
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  // Cloud Sync & Device Pairing State
  syncId: string;
  setSyncId: (id: string) => void;
  isSyncing: boolean;
  lastSyncedAt: string | null;
  autoSyncEnabled: boolean;
  setAutoSyncEnabled: (enabled: boolean) => void;
  isSyncModalOpen: boolean;
  setIsSyncModalOpen: (open: boolean) => void;
  pushToCloud: (overrideId?: string) => Promise<boolean>;
  pullFromCloud: (overrideId?: string) => Promise<boolean>;
  exportBackupJSON: () => void;
  importBackupJSON: (jsonStr: string) => boolean;

  // Data Store State & Actions
  plEntries: PLEntry[];
  addPLEntry: (entry: Omit<PLEntry, 'id'>) => void;
  updatePLEntry: (id: string, entry: Partial<PLEntry>) => void;
  deletePLEntry: (id: string) => void;
  clearPLHistory: () => void;
  reconcilePLEntry: (id: string, actuals: {
    actualDeliveredOrders: number;
    actualRtoOrders: number;
    cancelledOrders: number;
    returnedOrders: number;
    exchangeOrders: number;
    refundOrders: number;
    reconciliationNotes?: string;
  }) => void;

  expenses: ExpenseEntry[];
  addExpense: (expense: Omit<ExpenseEntry, 'id'>) => void;
  deleteExpense: (id: string) => void;
  clearExpenseHistory: () => void;

  rawPurchases: RawMaterialPurchase[];
  addRawPurchase: (purchase: Omit<RawMaterialPurchase, 'id'>) => void;
  deleteRawPurchase: (id: string) => void;
  clearRawPurchasesHistory: () => void;

  products: Product[];
  addProduct: (prod: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, prod: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  inventory: InventoryItem[];
  updateInventoryStock: (id: string, newStock: number) => void;
  deleteInventoryItem: (id: string) => void;

  orders: OrderItem[];
  addOrder: (order: Omit<OrderItem, 'id'>) => void;
  updateOrderStatus: (id: string, status: OrderItem['status']) => void;
  deleteOrder: (id: string) => void;
  clearOrdersHistory: () => void;

  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  addAttarName: (attarName: string) => void;

  resetToSeedData: () => void;
  clearAllBusinessHistory: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'MAHEKH_ERP_DATA_V4';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('mahekh_theme') as 'dark' | 'light') || 'dark';
  });

  const [accentColor, setAccentColor] = useState<string>('amber');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Cloud Sync State
  const [syncId, setSyncIdState] = useState<string>(() => {
    return localStorage.getItem('mahekh_sync_id') || '';
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('mahekh_last_synced') || null;
  });
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('mahekh_auto_sync') !== 'false';
  });
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);
  // Track whether we are currently pulling (to suppress auto-push during pull)
  const isPullingRef = useRef(false);
  const autoSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSyncId = (id: string) => {
    setSyncIdState(id);
    localStorage.setItem('mahekh_sync_id', id);
  };

  const setAutoSyncEnabled = (enabled: boolean) => {
    setAutoSyncEnabledState(enabled);
    localStorage.setItem('mahekh_auto_sync', enabled ? 'true' : 'false');
  };

  // Initialize state from LocalStorage
  const getInitial = <T,>(key: string, defaultVal: T): T => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[key] !== undefined) {
          return parsed[key];
        }
      }
    } catch (e) {
      console.error(`Error loading ${key}`, e);
    }
    return defaultVal;
  };

  const [plEntries, setPlEntries] = useState<PLEntry[]>(() => getInitial('plEntries', []));
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(() => getInitial('expenses', []));
  const [rawPurchases, setRawPurchases] = useState<RawMaterialPurchase[]>(() => getInitial('rawPurchases', []));
  const [products, setProducts] = useState<Product[]>(() => getInitial('products', []));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => getInitial('inventory', []));
  const [orders, setOrders] = useState<OrderItem[]>(() => getInitial('orders', []));
  const [settings, setSettings] = useState<SystemSettings>(() => getInitial('settings', INITIAL_SETTINGS));

  // Sync to LocalStorage on every state update
  useEffect(() => {
    const dataToSave = {
      plEntries,
      expenses,
      rawPurchases,
      products,
      inventory,
      orders,
      settings
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
  }, [plEntries, expenses, rawPurchases, products, inventory, orders, settings]);

  // Apply dark/light theme class to document element
  useEffect(() => {
    localStorage.setItem('mahekh_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const newToast: ToastMessage = {
      id: Date.now().toString(),
      title,
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(newToast.id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Cloud Sync Functions
  const pushToCloud = async (overrideId?: string): Promise<boolean> => {
    const targetId = overrideId || syncId;
    setIsSyncing(true);
    try {
      const payload = {
        plEntries,
        expenses,
        rawPurchases,
        products,
        inventory,
        orders,
        settings,
        timestamp: new Date().toISOString()
      };

      if (!targetId) {
        // Create new JSON Blob on jsonblob.com
        const res = await fetch('https://jsonblob.com/api/jsonBlob', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const location = res.headers.get('Location');
          const blobId = location ? location.split('/').pop() || '' : '';
          if (blobId) {
            setSyncId(blobId);
            const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
            setLastSyncedAt(nowStr);
            localStorage.setItem('mahekh_last_synced', nowStr);
            showToast('Cloud Sync Active', `Created Device Sync Code: ${blobId}`, 'success');
            return true;
          }
        }
      } else {
        // Update existing Blob
        const res = await fetch(`https://jsonblob.com/api/jsonBlob/${targetId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          setLastSyncedAt(nowStr);
          localStorage.setItem('mahekh_last_synced', nowStr);
          showToast('Cloud Updated', `Uploaded data to Cloud (${nowStr})`, 'success');
          return true;
        }
      }
    } catch (err) {
      console.error('Cloud push failed', err);
      showToast('Cloud Sync Error', 'Could not push to Cloud. Saved locally.', 'warning');
    } finally {
      setIsSyncing(false);
    }
    return false;
  };

  const pullFromCloud = async (overrideId?: string): Promise<boolean> => {
    const targetId = overrideId || syncId;
    if (!targetId) {
      showToast('No Sync Code', 'Enter or create a Cloud Sync Code first.', 'warning');
      return false;
    }
    setIsSyncing(true);
    try {
      const res = await fetch(`https://jsonblob.com/api/jsonBlob/${targetId}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.plEntries)) setPlEntries(data.plEntries);
        if (Array.isArray(data.expenses)) setExpenses(data.expenses);
        if (Array.isArray(data.rawPurchases)) setRawPurchases(data.rawPurchases);
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.inventory)) setInventory(data.inventory);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (data.settings) setSettings(data.settings);

        setSyncId(targetId);
        const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(nowStr);
        localStorage.setItem('mahekh_last_synced', nowStr);
        showToast('Synced from Cloud', `Loaded ${data.plEntries?.length || 0} P&L records!`, 'success');
        return true;
      } else {
        showToast('Sync Failed', 'Invalid Cloud Sync Code.', 'error');
      }
    } catch (err) {
      console.error('Cloud pull failed', err);
      showToast('Connection Error', 'Failed to fetch cloud data.', 'error');
    } finally {
      setIsSyncing(false);
    }
    return false;
  };

  // ── AUTO-PUSH: whenever data changes, silently push to cloud (debounced 4s) ──
  const syncIdRef = useRef(syncId);
  useEffect(() => { syncIdRef.current = syncId; }, [syncId]);

  const autoSyncEnabled_Ref = useRef(autoSyncEnabled);
  useEffect(() => { autoSyncEnabled_Ref.current = autoSyncEnabled; }, [autoSyncEnabled]);

  useEffect(() => {
    // Don't auto-push on very first mount (avoid overwriting good cloud data
    // before the startup pull has a chance to run)
    if (isPullingRef.current) return;
    if (!syncIdRef.current) return;   // no sync code yet → skip
    if (!autoSyncEnabled_Ref.current) return;

    if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    autoSyncTimerRef.current = setTimeout(async () => {
      if (!syncIdRef.current || isPullingRef.current) return;
      // Silent push (no toast)
      try {
        const payload = {
          plEntries,
          expenses,
          rawPurchases,
          products,
          inventory,
          orders,
          settings,
          timestamp: new Date().toISOString()
        };
        await fetch(`https://jsonblob.com/api/jsonBlob/${syncIdRef.current}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(nowStr);
        localStorage.setItem('mahekh_last_synced', nowStr);
      } catch { /* silent fail – data is still in localStorage */ }
    }, 4000);

    return () => {
      if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plEntries, expenses, rawPurchases, products, inventory, orders, settings]);

  // ── ON APP OPEN: silently pull latest cloud data if syncId saved ──
  const pullFromCloudSilent = useCallback(async (id: string) => {
    if (!id) return;
    isPullingRef.current = true;
    try {
      const res = await fetch(`https://jsonblob.com/api/jsonBlob/${id}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.plEntries)) setPlEntries(data.plEntries);
        if (Array.isArray(data.expenses)) setExpenses(data.expenses);
        if (Array.isArray(data.rawPurchases)) setRawPurchases(data.rawPurchases);
        if (Array.isArray(data.products)) setProducts(data.products);
        if (Array.isArray(data.inventory)) setInventory(data.inventory);
        if (Array.isArray(data.orders)) setOrders(data.orders);
        if (data.settings) setSettings(data.settings);
        const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(nowStr);
        localStorage.setItem('mahekh_last_synced', nowStr);
        showToast('Data Synced ✅', `Latest data loaded from Cloud (${data.plEntries?.length || 0} P&L entries)`, 'success');
      }
    } catch { /* offline – use localStorage */ } finally {
      setTimeout(() => { isPullingRef.current = false; }, 1000);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check URL parameter ?sync=ID on page load
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const syncParam = urlParams.get('sync') || urlParams.get('syncId');
    if (syncParam) {
      setSyncId(syncParam);
      pullFromCloudSilent(syncParam);
    } else if (syncId && autoSyncEnabled) {
      pullFromCloudSilent(syncId);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const exportBackupJSON = () => {
    const dataToSave = {
      plEntries,
      expenses,
      rawPurchases,
      products,
      inventory,
      orders,
      settings,
      exportedAt: new Date().toISOString()
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToSave, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `MAHEKH_ERP_BACKUP_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast('Backup Exported', 'Downloaded full business JSON backup file.', 'success');
  };

  const importBackupJSON = (jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (Array.isArray(parsed.plEntries)) setPlEntries(parsed.plEntries);
      if (Array.isArray(parsed.expenses)) setExpenses(parsed.expenses);
      if (Array.isArray(parsed.rawPurchases)) setRawPurchases(parsed.rawPurchases);
      if (Array.isArray(parsed.products)) setProducts(parsed.products);
      if (Array.isArray(parsed.inventory)) setInventory(parsed.inventory);
      if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
      if (parsed.settings) setSettings(parsed.settings);
      showToast('Backup Restored', 'Successfully imported all business data!', 'success');
      return true;
    } catch (e) {
      showToast('Import Error', 'Invalid JSON backup file format.', 'error');
      return false;
    }
  };


  // ── AUTO-CREATE SYNC ON FIRST ENTRY (if no syncId yet) ────────────────
  const autoInitSync = useCallback(async (allEntries: PLEntry[]) => {
    // Already synced — nothing to do, auto-push useEffect will handle it
    if (syncIdRef.current) return;
    try {
      const payload = {
        plEntries: allEntries,
        expenses,
        rawPurchases,
        products,
        inventory,
        orders,
        settings,
        timestamp: new Date().toISOString()
      };
      const res = await fetch('https://jsonblob.com/api/jsonBlob', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const location = res.headers.get('Location');
        const blobId = location ? location.split('/').pop() || '' : '';
        if (blobId) {
          setSyncId(blobId);
          const syncUrl = `${window.location.origin}/?sync=${blobId}`;
          const waText = encodeURIComponent(
            `🌸 *MAHEKH ERP - Data Sync Link*\n\nPhone pe click karo — sab data dikhega:\n👉 ${syncUrl}`
          );
          // Show a persistent toast with WhatsApp link
          showToast(
            '☁️ Auto-Cloud Sync Active!',
            `Data cloud pe save ho gaya! Phone pe dekhne ke liye: wa.me/?text karo ya Navbar me Cloud button dabao.`,
            'success'
          );
          // Also open WhatsApp automatically for convenience
          setTimeout(() => {
            window.open(`https://api.whatsapp.com/send?text=${waText}`, '_blank');
          }, 800);
        }
      }
    } catch { /* offline – data safe in localStorage */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, rawPurchases, products, inventory, orders, settings]);

  // Helper CRUD actions
  const addPLEntry = (entryData: Omit<PLEntry, 'id'>) => {
    const newEntry: PLEntry = {
      ...entryData,
      id: `pl-${Date.now()}`
    };
    const updated = [newEntry, ...plEntries];
    setPlEntries(updated);
    showToast('P&L Entry Created', `Added entry for ${newEntry.productName} (${newEntry.orders} orders)`, 'success');
    // If not synced yet → auto-create cloud sync & send WhatsApp link
    if (!syncIdRef.current) {
      setTimeout(() => autoInitSync(updated), 500);
    }
  };

  const updatePLEntry = (id: string, updatedData: Partial<PLEntry>) => {
    setPlEntries(prev => prev.map(item => (item.id === id ? { ...item, ...updatedData } : item)));
    showToast('Entry Updated', 'Profit & Loss record was successfully updated.', 'info');
  };

  const deletePLEntry = (id: string) => {
    setPlEntries(prev => prev.filter(item => item.id !== id));
    showToast('Entry Deleted', 'P&L record removed permanently.', 'warning');
  };


  const clearPLHistory = () => {
    setPlEntries([]);
    showToast('P&L History Cleared', 'All P&L entries have been permanently removed.', 'warning');
  };

  const reconcilePLEntry = (
    id: string,
    actuals: {
      actualDeliveredOrders: number;
      actualRtoOrders: number;
      cancelledOrders: number;
      returnedOrders: number;
      exchangeOrders: number;
      refundOrders: number;
      reconciliationNotes?: string;
    }
  ) => {
    setPlEntries(prev =>
      prev.map(item => {
        if (item.id !== id) return item;

        const actualRev = actuals.actualDeliveredOrders * item.sellingPrice;
        const totalCostPerUnit = item.productCost + item.packagingCost + item.shippingCost + item.codCharge + item.paymentGatewayCharge + item.otherCharges;
        const totalDeliveredCost = actuals.actualDeliveredOrders * totalCostPerUnit;
        const rtoPenalties = actuals.actualRtoOrders * 50;
        const actualProfitVal = actualRev - totalDeliveredCost - rtoPenalties - (actuals.refundOrders * item.sellingPrice);

        return {
          ...item,
          isReconciled: true,
          actualDeliveredOrders: actuals.actualDeliveredOrders,
          actualRtoOrders: actuals.actualRtoOrders,
          cancelledOrders: actuals.cancelledOrders,
          returnedOrders: actuals.returnedOrders,
          exchangeOrders: actuals.exchangeOrders,
          refundOrders: actuals.refundOrders,
          actualProfit: Math.round(actualProfitVal),
          reconciliationNotes: actuals.reconciliationNotes
        };
      })
    );
    showToast('RTO Reconciliation Complete', 'Actual profit & delivery counts recalculated.', 'success');
  };

  const addExpense = (expenseData: Omit<ExpenseEntry, 'id'>) => {
    const newExp: ExpenseEntry = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => [newExp, ...prev]);
    showToast('Expense Added', `₹${newExp.amount} categorized under ${newExp.category}`, 'success');
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    showToast('Expense Deleted', 'Expense record removed permanently.', 'warning');
  };

  const clearExpenseHistory = () => {
    setExpenses([]);
    showToast('Expense History Cleared', 'All expense entries removed.', 'warning');
  };

  const addRawPurchase = (purchaseData: Omit<RawMaterialPurchase, 'id'>) => {
    const newPurchase: RawMaterialPurchase = {
      ...purchaseData,
      id: `rm-${Date.now()}`
    };
    setRawPurchases(prev => [newPurchase, ...prev]);

    setInventory(prev => {
      const existing = prev.find(inv => inv.name.toLowerCase().includes(purchaseData.attarName.toLowerCase()));
      if (existing) {
        return prev.map(inv =>
          inv.id === existing.id
            ? {
                ...inv,
                currentStock: inv.currentStock + purchaseData.quantity,
                totalStockValue: inv.totalStockValue + purchaseData.totalAmount,
                lastUpdated: purchaseData.purchaseDate
              }
            : inv
        );
      } else {
        const newInvItem: InventoryItem = {
          id: `inv-${Date.now()}`,
          name: `${purchaseData.attarName} Concentrate`,
          type: 'Raw Attar',
          currentStock: purchaseData.quantity,
          unit: purchaseData.unit,
          minStockAlert: 150,
          averageCost: purchaseData.rate,
          totalStockValue: purchaseData.totalAmount,
          lastUpdated: purchaseData.purchaseDate
        };
        return [...prev, newInvItem];
      }
    });

    showToast('Raw Material Purchased', `Added ${purchaseData.quantity} ${purchaseData.unit} of ${purchaseData.attarName}`, 'success');
  };

  const deleteRawPurchase = (id: string) => {
    setRawPurchases(prev => prev.filter(r => r.id !== id));
    showToast('Purchase Deleted', 'Raw material purchase record removed.', 'warning');
  };

  const clearRawPurchasesHistory = () => {
    setRawPurchases([]);
    showToast('Raw Material History Cleared', 'All raw material purchase records removed.', 'warning');
  };

  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [...prev, newProd]);
    showToast('Product Added', `${newProd.name} added to catalog`, 'success');
  };

  const updateProduct = (id: string, prod: Partial<Product>) => {
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...prod } : p)));
    showToast('Product Updated', 'Product details saved.', 'info');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product Deleted', 'Product SKU removed from catalog.', 'warning');
  };

  const updateInventoryStock = (id: string, newStock: number) => {
    setInventory(prev =>
      prev.map(item =>
        item.id === id
          ? {
              ...item,
              currentStock: newStock,
              totalStockValue: newStock * item.averageCost
            }
          : item
      )
    );
    showToast('Stock Updated', 'Inventory count adjusted.', 'info');
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
    showToast('Item Deleted', 'Inventory item removed.', 'warning');
  };

  const addOrder = (orderData: Omit<OrderItem, 'id'>) => {
    const newOrd: OrderItem = {
      ...orderData,
      id: `ord-${Date.now()}`
    };
    setOrders(prev => [newOrd, ...prev]);
    showToast('Order Added', `Order ${newOrd.orderNumber} created.`, 'success');
  };

  const updateOrderStatus = (id: string, status: OrderItem['status']) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
    showToast('Order Status Updated', `Order marked as ${status}`, 'info');
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    showToast('Order Deleted', 'Order record removed permanently.', 'warning');
  };

  const clearOrdersHistory = () => {
    setOrders([]);
    showToast('Orders History Cleared', 'All orders have been removed.', 'warning');
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    showToast('Settings Saved', 'Business configuration updated.', 'success');
  };

  const addAttarName = (attarName: string) => {
    if (!settings.attarList.includes(attarName)) {
      const updated = [...settings.attarList, attarName];
      setSettings(prev => ({ ...prev, attarList: updated }));
      showToast('New Attar Added', `${attarName} is now in your drop-down list.`, 'success');
    }
  };

  const resetToSeedData = () => {
    setPlEntries([]);
    setExpenses([]);
    setRawPurchases([]);
    setProducts([]);
    setInventory([]);
    setOrders([]);
    setSettings(INITIAL_SETTINGS);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({
      plEntries: [],
      expenses: [],
      rawPurchases: [],
      products: [],
      inventory: [],
      orders: [],
      settings: INITIAL_SETTINGS
    }));
    showToast('Data Cleared', 'All dummy data removed. System ready for your manual testing.', 'info');
  };

  const clearAllBusinessHistory = () => {
    setPlEntries([]);
    setExpenses([]);
    setRawPurchases([]);
    setOrders([]);
    setProducts([]);
    setInventory([]);
    showToast('All Data Cleared', 'All records cleared. System completely empty.', 'warning');
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        theme,
        toggleTheme,
        accentColor,
        setAccentColor,
        globalSearch,
        setGlobalSearch,
        isQuickAddOpen,
        setIsQuickAddOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        toasts,
        showToast,
        removeToast,
        syncId,
        setSyncId,
        isSyncing,
        lastSyncedAt,
        autoSyncEnabled,
        setAutoSyncEnabled,
        isSyncModalOpen,
        setIsSyncModalOpen,
        pushToCloud,
        pullFromCloud,
        exportBackupJSON,
        importBackupJSON,
        plEntries,
        addPLEntry,
        updatePLEntry,
        deletePLEntry,
        clearPLHistory,
        reconcilePLEntry,
        expenses,
        addExpense,
        deleteExpense,
        clearExpenseHistory,
        rawPurchases,
        addRawPurchase,
        deleteRawPurchase,
        clearRawPurchasesHistory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        inventory,
        updateInventoryStock,
        deleteInventoryItem,
        orders,
        addOrder,
        updateOrderStatus,
        deleteOrder,
        clearOrdersHistory,
        settings,
        updateSettings,
        addAttarName,
        resetToSeedData,
        clearAllBusinessHistory
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
