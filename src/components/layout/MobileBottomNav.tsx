import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Calculator,
  Boxes,
  PlusCircle,
  Menu
} from 'lucide-react';

interface MobileBottomNavProps {
  setMobileOpen: (open: boolean) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ setMobileOpen }) => {
  const { activeTab, setActiveTab, setIsQuickAddOpen, inventory } = useApp();

  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStockAlert).length;

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'pl', label: 'P&L Suite', icon: Calculator },
    { id: 'inventory', label: 'Stock', icon: Boxes, badge: lowStockCount },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden mobile-bottom-dock px-3 py-2 transition-all">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {/* Main Tab Links */}
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl relative transition-all duration-200 ${
                isActive
                  ? 'text-amber-600 dark:text-amber-400 font-bold scale-105'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-slate-950 shadow-sm">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-1 font-medium tracking-tight">
                {item.label}
              </span>
              {isActive && (
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-0.5 shadow-sm shadow-amber-500" />
              )}
            </button>
          );
        })}

        {/* Quick Add Floating Center Action */}
        <button
          onClick={() => {
            setActiveTab('pl');
            setIsQuickAddOpen(true);
          }}
          className="flex flex-col items-center justify-center py-1 px-2.5 text-slate-950 font-bold"
          title="New P&L Entry"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-lg shadow-amber-500/30 transform active:scale-95 transition-transform">
            <PlusCircle className="w-6 h-6 stroke-[2.5px]" />
          </div>
          <span className="text-[9px] mt-0.5 font-bold text-amber-600 dark:text-amber-400">
            Add
          </span>
        </button>

        {/* Drawer Menu Button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all"
        >
          <Menu className="w-5 h-5 stroke-2" />
          <span className="text-[10px] mt-1 font-medium tracking-tight">
            Menu
          </span>
        </button>
      </div>
    </div>
  );
};
