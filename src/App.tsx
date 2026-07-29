import React, { useState, Component, type ReactNode } from 'react';
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

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Mahekh ERP ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleResetLocalStorage = () => {
    try {
      localStorage.clear();
      window.location.reload();
    } catch {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full glass-panel p-8 rounded-3xl border border-amber-500/30 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center text-2xl font-black border border-amber-500/40">
              💧
            </div>
            <h2 className="text-xl font-extrabold text-slate-100">Mahekh ERP — Quick Recovery</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              App loading encountered an unexpected browser state. Click below to reload cleanly.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleReload}
                className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                🔄 Refresh Page
              </button>
              <button
                onClick={this.handleResetLocalStorage}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 cursor-pointer"
              >
                🧹 Reset Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

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
    <AppErrorBoundary>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </AppErrorBoundary>
  );
}

export default App;
