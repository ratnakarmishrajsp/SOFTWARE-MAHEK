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

  // ────────────────────────────────────────────────────────────────────────
  // SERVER SYNC — uses /api.php on erp.mahekh.com (same Hostinger server)
  // • pushToCloud  → POST /api.php  (saves to mahekh_data.json on server)
  // • pullFromCloud → GET  /api.php  (reads mahekh_data.json from server)
  // • Auto-pull on every app open
  // • Auto-push (debounced 3s) on every data change
  // ────────────────────────────────────────────────────────────────────────

  const API_URL = './api.php';   // Same-origin relative path for subdirectory support

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('mahekh_last_synced') || null;
  });
  const [autoSyncEnabled, setAutoSyncEnabledState] = useState<boolean>(() => {
    return localStorage.getItem('mahekh_auto_sync') !== 'false';
  });
  const [isSyncModalOpen, setIsSyncModalOpen] = useState<boolean>(false);

  // Legacy syncId — kept for interface compatibility, no longer required
  const [syncId, setSyncIdState] = useState<string>('server');
  const setSyncId = (id: string) => { setSyncIdState(id); };
  const setAutoSyncEnabled = (enabled: boolean) => {
    setAutoSyncEnabledState(enabled);
    localStorage.setItem('mahekh_auto_sync', enabled ? 'true' : 'false');
  };

  // Refs to track in-flight pull so auto-push doesn't race
  const isPullingRef = useRef(false);
  const autoSyncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMountRef = useRef(true);
  const deletedIdsRef = useRef<Set<string>>(new Set());

  // Initialize state from LocalStorage
  const getInitial = <T,>(key: string, defaultVal: T): T => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed[key] !== undefined) return parsed[key];
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

  // ── Persist to localStorage on every change ─────────────────────────────
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(
      { plEntries, expenses, rawPurchases, products, inventory, orders, settings }
    ));
  }, [plEntries, expenses, rawPurchases, products, inventory, orders, settings]);

  // ── Theme ────────────────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('mahekh_theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  const showToast = (title: string, message: string, type: ToastMessage['type'] = 'info') => {
    const newToast: ToastMessage = { id: Date.now().toString(), title, message, type };
    setToasts(prev => [...prev, newToast]);
    setTimeout(() => removeToast(newToast.id), 5000);
  };
  const removeToast = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 4000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return response;
    } catch (e) {
      clearTimeout(id);
      throw e;
    }
  };

  const stateRef = useRef({ plEntries, expenses, rawPurchases, products, inventory, orders, settings });
  useEffect(() => {
    stateRef.current = { plEntries, expenses, rawPurchases, products, inventory, orders, settings };
  }, [plEntries, expenses, rawPurchases, products, inventory, orders, settings]);

  // ── PUSH: save current state to server ───────────────────────────────────
  const pushToCloud = useCallback(async (customPayload?: any): Promise<boolean> => {
    setIsSyncing(true);
    try {
      const payload = customPayload || stateRef.current;
      const res = await fetchWithTimeout(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }, 4000);
      if (res.ok) {
        const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
        setLastSyncedAt(nowStr);
        localStorage.setItem('mahekh_last_synced', nowStr);
        showToast('✅ Server Sync Done', `Data saved to server (${nowStr})`, 'success');
        return true;
      } else if (res.status === 403) {
        showToast('⚠️ 403 Forbidden', 'Hostinger server blocked access. Please check public/ folder permissions (chmod 755).', 'error');
      } else {
        showToast('⚠️ Server Error', `Server returned HTTP ${res.status}`, 'warning');
      }
    } catch {
      showToast('⚠️ Sync Error', 'Could not reach server. Data is safe in local storage.', 'warning');
    } finally {
      setIsSyncing(false);
    }
    return false;
  }, []);

  // ── PULL: fetch latest data from server ──────────────────────────────────
  const pullFromCloud = useCallback(async (_overrideId?: string, silent = false): Promise<boolean> => {
    isPullingRef.current = true;
    if (!silent) setIsSyncing(true);
    try {
      const res = await fetchWithTimeout(API_URL + '?t=' + Date.now(), {}, 3000); // 3s timeout fast fail
      if (res.ok) {
        let data: any = null;
        try {
          data = await res.json();
        } catch {
          return false; // Not JSON response (e.g. 404 HTML page) — fail fast
        }

        if (!data || typeof data !== 'object') return false;

        // Check if server has ANY meaningful data
        const serverHasData = (
          (Array.isArray(data.plEntries) && data.plEntries.length > 0) ||
          (Array.isArray(data.expenses) && data.expenses.length > 0) ||
          (Array.isArray(data.rawPurchases) && data.rawPurchases.length > 0) ||
          (Array.isArray(data.products) && data.products.length > 0) ||
          (Array.isArray(data.inventory) && data.inventory.length > 0) ||
          (Array.isArray(data.orders) && data.orders.length > 0) ||
          (data.settings && data.settings !== null)
        );

        if (serverHasData) {
          if (Array.isArray(data.plEntries)) {
            setPlEntries(prev => {
              const serverIds = new Set(data.plEntries.map((x: PLEntry) => x.id));
              const unsavedLocal = prev.filter(x => !serverIds.has(x.id) && !deletedIdsRef.current.has(x.id));
              const validServer = data.plEntries.filter((x: PLEntry) => !deletedIdsRef.current.has(x.id));
              return [...unsavedLocal, ...validServer];
            });
          }
          if (Array.isArray(data.expenses)) {
            setExpenses(prev => {
              const serverIds = new Set(data.expenses.map((x: ExpenseEntry) => x.id));
              const unsavedLocal = prev.filter(x => !serverIds.has(x.id) && !deletedIdsRef.current.has(x.id));
              const validServer = data.expenses.filter((x: ExpenseEntry) => !deletedIdsRef.current.has(x.id));
              return [...unsavedLocal, ...validServer];
            });
          }
          if (Array.isArray(data.rawPurchases)) {
            setRawPurchases(prev => {
              const serverIds = new Set(data.rawPurchases.map((x: RawMaterialPurchase) => x.id));
              const unsavedLocal = prev.filter(x => !serverIds.has(x.id) && !deletedIdsRef.current.has(x.id));
              const validServer = data.rawPurchases.filter((x: RawMaterialPurchase) => !deletedIdsRef.current.has(x.id));
              return [...unsavedLocal, ...validServer];
            });
          }
          if (Array.isArray(data.products))     setProducts(data.products);
          if (Array.isArray(data.inventory))    setInventory(data.inventory);
          if (Array.isArray(data.orders)) {
            setOrders(prev => {
              const serverIds = new Set(data.orders.map((x: OrderItem) => x.id));
              const unsavedLocal = prev.filter(x => !serverIds.has(x.id) && !deletedIdsRef.current.has(x.id));
              const validServer = data.orders.filter((x: OrderItem) => !deletedIdsRef.current.has(x.id));
              return [...unsavedLocal, ...validServer];
            });
          }
          if (data.settings)                    setSettings(data.settings);
          const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          setLastSyncedAt(nowStr);
          localStorage.setItem('mahekh_last_synced', nowStr);
          if (!silent) {
            const totalEntries = (data.plEntries?.length || 0) + (data.expenses?.length || 0) + (data.orders?.length || 0);
            showToast('✅ Data Synced', `${totalEntries} records fetched from server`, 'success');
          }
          return true;
        } else if (!silent) {
          showToast('ℹ️ No Server Data', 'Server pe koi data nahi mila. Local data use ho raha hai.', 'info');
        }
      } else if (res.status === 403 && !silent) {
        showToast('⚠️ 403 Forbidden', 'Hostinger server access blocked. Check file permissions (chmod 755).', 'error');
      }
    } catch {
      if (!silent) showToast('⚠️ Connection Error', 'Server se connect nahi ho saka.', 'warning');
    } finally {
      setIsSyncing(false);
      setTimeout(() => { isPullingRef.current = false; }, 500);
    }
    return false;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── AUTO-PULL on app open, tab focus & periodic background polling (every 10s) ───
  useEffect(() => {
    // Delay initial cloud pull by 200ms so React paints local data instantly first
    const initTimer = setTimeout(() => {
      pullFromCloud(undefined, true);
    }, 200);

    // Periodic polling every 3 seconds for real-time multi-device sync (Phone ↔ Laptop)
    const pollInterval = setInterval(() => {
      if (!isSyncing && !isPullingRef.current && autoSyncEnabledRef.current) {
        pullFromCloud(undefined, true);
      }
    }, 3000);

    // Auto pull when switching back to tab/app or interacting on screen
    const handleFocusOrVisible = () => {
      if (document.visibilityState === 'visible' && !isSyncing && !isPullingRef.current) {
        pullFromCloud(undefined, true);
      }
    };

    window.addEventListener('focus', handleFocusOrVisible);
    document.addEventListener('visibilitychange', handleFocusOrVisible);
    window.addEventListener('online', handleFocusOrVisible);
    window.addEventListener('pointerdown', handleFocusOrVisible);

    return () => {
      clearTimeout(initTimer);
      clearInterval(pollInterval);
      window.removeEventListener('focus', handleFocusOrVisible);
      document.removeEventListener('visibilitychange', handleFocusOrVisible);
      window.removeEventListener('online', handleFocusOrVisible);
      window.removeEventListener('pointerdown', handleFocusOrVisible);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── AUTO-PUSH on every data change (debounced 3s) ────────────────────────
  const autoSyncEnabledRef = useRef(autoSyncEnabled);
  useEffect(() => { autoSyncEnabledRef.current = autoSyncEnabled; }, [autoSyncEnabled]);

  useEffect(() => {
    // Skip the very first mount (don't overwrite server data before pull completes)
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      return;
    }
    if (!autoSyncEnabledRef.current) return;
    if (isPullingRef.current) return;   // Don't push while pulling

    if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current);
    autoSyncTimerRef.current = setTimeout(async () => {
      if (isPullingRef.current) return;
      try {
        const payload = { plEntries, expenses, rawPurchases, products, inventory, orders, settings };
        const res = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const nowStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
          setLastSyncedAt(nowStr);
          localStorage.setItem('mahekh_last_synced', nowStr);
        }
      } catch { /* silent fail — data safe in localStorage */ }
    }, 3000);

    return () => { if (autoSyncTimerRef.current) clearTimeout(autoSyncTimerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plEntries, expenses, rawPurchases, products, inventory, orders, settings]);


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

  // ── CRUD actions ──────────────────────────────────────────────────────────
  const addPLEntry = (entryData: Omit<PLEntry, 'id'>) => {
    const newEntry: PLEntry = { ...entryData, id: `pl-${Date.now()}` };
    setPlEntries(prev => {
      const next = [newEntry, ...prev];
      pushToCloud({ ...stateRef.current, plEntries: next });
      return next;
    });
    showToast('P&L Entry Created', `Added: ${newEntry.productName} (${newEntry.orders} orders)`, 'success');
  };

  const updatePLEntry = (id: string, updatedData: Partial<PLEntry>) => {
    setPlEntries(prev => {
      const next = prev.map(item => (item.id === id ? { ...item, ...updatedData } : item));
      pushToCloud({ ...stateRef.current, plEntries: next });
      return next;
    });
    showToast('Entry Updated', 'Profit & Loss record was successfully updated.', 'info');
  };

  const deletePLEntry = (id: string) => {
    deletedIdsRef.current.add(id);
    setPlEntries(prev => {
      const next = prev.filter(item => item.id !== id);
      pushToCloud({ ...stateRef.current, plEntries: next });
      return next;
    });
    showToast('Entry Deleted', 'P&L record removed permanently.', 'warning');
  };

  const clearPLHistory = () => {
    setPlEntries([]);
    pushToCloud({ ...stateRef.current, plEntries: [] });
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
    setPlEntries(prev => {
      const next = prev.map(item => {
        if (item.id !== id) return item;

        const actualRev = actuals.actualDeliveredOrders * item.sellingPrice;

        let effectiveShippingCost = item.shippingCost || settings.defaultShippingCost || 130;
        let effectivePackagingCost = item.packagingCost || 35;
        let effectiveProductCost = item.productCost;

        if (item.costMode === 'combined' && item.combinedCost) {
          effectiveShippingCost = settings.defaultShippingCost || 130;
          effectivePackagingCost = 35;
          effectiveProductCost = Math.max(0, item.combinedCost - effectiveShippingCost - effectivePackagingCost);
        }

        const totalCostPerUnit = effectiveProductCost + effectivePackagingCost + effectiveShippingCost + (item.codCharge || 0) + (item.paymentGatewayCharge || 0) + (item.otherCharges || 0);

        const totalDeliveredCost = actuals.actualDeliveredOrders * totalCostPerUnit;

        const rtoShippingFee = item.rtoShippingCharge || settings.defaultRtoShippingCharge || 120;
        const rtoCourierLossPerOrder = effectiveShippingCost + rtoShippingFee + effectivePackagingCost;
        const totalRtoLoss = actuals.actualRtoOrders * rtoCourierLossPerOrder;

        const totalAdSpend = item.totalAdSpend || (item.cpp ? item.cpp * item.orders : 0);

        const actualProfitVal = actualRev - totalDeliveredCost - totalRtoLoss - totalAdSpend - (actuals.refundOrders * item.sellingPrice);

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
      });
      pushToCloud({ ...stateRef.current, plEntries: next });
      return next;
    });
    showToast('RTO Reconciliation Complete', 'Actual profit & delivery counts recalculated.', 'success');
  };

  const addExpense = (expenseData: Omit<ExpenseEntry, 'id'>) => {
    const newExp: ExpenseEntry = {
      ...expenseData,
      id: `exp-${Date.now()}`
    };
    setExpenses(prev => {
      const next = [newExp, ...prev];
      pushToCloud({ ...stateRef.current, expenses: next });
      return next;
    });
    showToast('Expense Added', `₹${newExp.amount} categorized under ${newExp.category}`, 'success');
  };

  const deleteExpense = (id: string) => {
    deletedIdsRef.current.add(id);
    setExpenses(prev => {
      const next = prev.filter(e => e.id !== id);
      pushToCloud({ ...stateRef.current, expenses: next });
      return next;
    });
    showToast('Expense Deleted', 'Expense record removed permanently.', 'warning');
  };

  const clearExpenseHistory = () => {
    setExpenses([]);
    showToast('Expense History Cleared', 'All expense entries removed.', 'warning');
    setTimeout(() => { pushToCloud(); }, 50);
  };

  const addRawPurchase = (purchaseData: Omit<RawMaterialPurchase, 'id'>) => {
    const newPurchase: RawMaterialPurchase = {
      ...purchaseData,
      id: `rm-${Date.now()}`
    };
    setRawPurchases(prev => {
      const next = [newPurchase, ...prev];
      pushToCloud({ ...stateRef.current, rawPurchases: next });
      return next;
    });

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
    deletedIdsRef.current.add(id);
    setRawPurchases(prev => {
      const next = prev.filter(r => r.id !== id);
      pushToCloud({ ...stateRef.current, rawPurchases: next });
      return next;
    });
    showToast('Purchase Deleted', 'Raw material purchase record removed.', 'warning');
  };

  const clearRawPurchasesHistory = () => {
    setRawPurchases([]);
    pushToCloud({ ...stateRef.current, rawPurchases: [] });
    showToast('Raw Material History Cleared', 'All raw material purchase records removed.', 'warning');
  };

  const addProduct = (prod: Omit<Product, 'id'>) => {
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => {
      const next = [...prev, newProd];
      pushToCloud({ ...stateRef.current, products: next });
      return next;
    });
    showToast('Product Added', `${newProd.name} added to catalog`, 'success');
  };

  const updateProduct = (id: string, prod: Partial<Product>) => {
    setProducts(prev => {
      const next = prev.map(p => (p.id === id ? { ...p, ...prod } : p));
      pushToCloud({ ...stateRef.current, products: next });
      return next;
    });
    showToast('Product Updated', 'Product details saved.', 'info');
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => {
      const next = prev.filter(p => p.id !== id);
      pushToCloud({ ...stateRef.current, products: next });
      return next;
    });
    showToast('Product Deleted', 'Product SKU removed from catalog.', 'warning');
  };

  const updateInventoryStock = (id: string, newStock: number) => {
    setInventory(prev => {
      const next = prev.map(item =>
        item.id === id
          ? {
              ...item,
              currentStock: newStock,
              totalStockValue: newStock * item.averageCost
            }
          : item
      );
      pushToCloud({ ...stateRef.current, inventory: next });
      return next;
    });
    showToast('Stock Updated', 'Inventory count adjusted.', 'info');
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => {
      const next = prev.filter(i => i.id !== id);
      pushToCloud({ ...stateRef.current, inventory: next });
      return next;
    });
    showToast('Item Deleted', 'Inventory item removed.', 'warning');
  };

  const addOrder = (orderData: Omit<OrderItem, 'id'>) => {
    const newOrd: OrderItem = {
      ...orderData,
      id: `ord-${Date.now()}`
    };
    setOrders(prev => {
      const next = [newOrd, ...prev];
      pushToCloud({ ...stateRef.current, orders: next });
      return next;
    });
    showToast('Order Added', `Order ${newOrd.orderNumber} created.`, 'success');
  };

  const updateOrderStatus = (id: string, status: OrderItem['status']) => {
    setOrders(prev => {
      const next = prev.map(o => (o.id === id ? { ...o, status } : o));
      pushToCloud({ ...stateRef.current, orders: next });
      return next;
    });
    showToast('Order Status Updated', `Order marked as ${status}`, 'info');
  };

  const deleteOrder = (id: string) => {
    deletedIdsRef.current.add(id);
    setOrders(prev => {
      const next = prev.filter(o => o.id !== id);
      pushToCloud({ ...stateRef.current, orders: next });
      return next;
    });
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
