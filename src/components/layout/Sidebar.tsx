import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calculator,
  Receipt,
  FlaskConical,
  Boxes,
  Package,
  ShoppingBag,
  FileSpreadsheet,
  TrendingUp,
  Settings,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  Droplet
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { activeTab, setActiveTab, inventory, orders } = useApp();
  const [collapsed, setCollapsed] = useState(false);

  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStockAlert).length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending').length;

  const navItems = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'pl', label: 'Profit & Loss', icon: Calculator, badge: 'Main' },
    { id: 'expenses', label: 'Expense Manager', icon: Receipt },
    { id: 'raw-material', label: 'Raw Material Purchase', icon: FlaskConical },
    { id: 'inventory', label: 'Stock & Inventory', icon: Boxes, badgeCount: lowStockCount, badgeColor: 'bg-amber-500/20 text-amber-600 dark:text-amber-300' },
    { id: 'products', label: 'Products & SKUs', icon: Package },
    { id: 'orders', label: 'Orders Pipeline', icon: ShoppingBag, badgeCount: pendingOrdersCount, badgeColor: 'bg-blue-500/20 text-blue-600 dark:text-blue-300' },
    { id: 'reports', label: 'Reports & Exports', icon: FileSpreadsheet },
    { id: 'analytics', label: 'Business Analytics', icon: TrendingUp },
    { id: 'settings', label: 'Settings & Config', icon: Settings }
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col glass-panel border-r border-slate-200 dark:border-slate-800/80 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
              <Droplet className="w-6 h-6 fill-slate-950 stroke-slate-950" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3 items-center justify-center rounded-full bg-emerald-500 border border-slate-950" />
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 dark:from-amber-200 dark:via-amber-400 dark:to-amber-500">
                  Mahekh ERP
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                  D2C Perfume Suite
                </span>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileOpen(false);
                }}
                className={`w-full flex items-center gap-3.5 px-3.5 py-3 rounded-xl font-semibold text-xs transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 text-amber-700 dark:text-amber-400 border border-amber-500/30 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50 border border-transparent'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'
                  }`}
                />
                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                {!collapsed && item.badge && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {item.badge}
                  </span>
                )}

                {!collapsed && item.badgeCount !== undefined && item.badgeCount > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border border-slate-200 dark:border-slate-700 ${item.badgeColor}`}
                  >
                    {item.badgeCount}
                  </span>
                )}

                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-6 bg-amber-500 rounded-l-full shadow-lg shadow-amber-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        {!collapsed && (
          <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-amber-500/10 to-amber-500/5 border border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Real-time Sync Active</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Auto-calculating P&L and Meta ad spend.
            </p>
          </div>
        )}
      </aside>
    </>
  );
};
