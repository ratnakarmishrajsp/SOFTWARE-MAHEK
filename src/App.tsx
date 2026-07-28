import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { HomeDashboard } from './components/dashboard/HomeDashboard';
import { PLModule } from './components/pl/PLModule';
import { ExpenseModule } from './components/expenses/ExpenseModule';
import { RawMaterialModule } from './components/rawMaterial/RawMaterialModule';
import { InventoryModule } from './components/inventory/InventoryModule';
import { ProductModule } from './components/products/ProductModule';
import { OrdersModule } from './components/orders/OrdersModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { AnalyticsModule } from './components/analytics/AnalyticsModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { ToastContainer } from './components/ui/ToastContainer';
import { ShortcutsModal } from './components/ui/ShortcutsModal';
import { CloudSyncModal } from './components/ui/CloudSyncModal';

const MainContent: React.FC = () => {
  const { activeTab } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <HomeDashboard />;
      case 'pl':
      case 'actual-rto':
        return <PLModule />;
      case 'expenses':
        return <ExpenseModule />;
      case 'raw-material':
        return <RawMaterialModule />;
      case 'inventory':
        return <InventoryModule />;
      case 'products':
        return <ProductModule />;
      case 'orders':
        return <OrdersModule />;
      case 'reports':
        return <ReportsModule />;
      case 'analytics':
        return <AnalyticsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return <HomeDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-800 dark:selection:text-amber-200 transition-colors duration-300 pb-20 lg:pb-0">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Workspace */}
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 transition-all duration-300">
        <Navbar setMobileOpen={setMobileOpen} />
        <main className="flex-1 p-3 sm:p-5 lg:p-8 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
          {renderActiveModule()}
        </main>
      </div>

      {/* Mobile Bottom Dock */}
      <MobileBottomNav setMobileOpen={setMobileOpen} />

      {/* Floating UI Overlays */}
      <ToastContainer />
      <ShortcutsModal />
      <CloudSyncModal />
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}

export default App;
