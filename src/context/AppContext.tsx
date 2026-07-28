import React, { createContext, useContext, useState, useEffect } from 'react';
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

  // Data Store State & Deletion Actions
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

  // Initialize state from LocalStorage if present, else default to EMPTY arrays []
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

  // Start with 100% EMPTY arrays for all user testing data
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

  // Helper functions & Instant Deletion Handlers
  const addPLEntry = (entryData: Omit<PLEntry, 'id'>) => {
    const newEntry: PLEntry = {
      ...entryData,
      id: `pl-${Date.now()}`
    };
    setPlEntries(prev => [newEntry, ...prev]);
    showToast('P&L Entry Created', `Added entry for ${newEntry.productName} (${newEntry.orders} orders)`, 'success');
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
