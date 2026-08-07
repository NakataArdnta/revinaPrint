import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

import { HomeView } from './views/HomeView';
import { PriceListView } from './views/PriceListView';
import { OrderFormView } from './views/OrderFormView';
import { CustomerDashboardView } from './views/CustomerDashboardView';
import { OrderStatusView } from './views/OrderStatusView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AdminPasswordModal } from './views/AdminPasswordModal';

function AppContent() {
  const { isAdminAuthenticated, activeRoleView, switchRoleView } = useAuth();

  const [currentTab, setCurrentTab] = useState('home');
  const [navigationParams, setNavigationParams] = useState<any>(null);
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false);

  const handleNavigate = (tab: string, params?: any) => {
    if (tab === 'admin-dashboard' && !isAdminAuthenticated) {
      setShowAdminPasswordModal(true);
      return;
    }
    setCurrentTab(tab);
    setNavigationParams(params || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onOpenAdminAuth={() => setShowAdminPasswordModal(true)}
      />

      {/* Main Page View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeRoleView === 'ADMIN' ? (
          isAdminAuthenticated ? (
            <AdminDashboardView />
          ) : (
            <div className="max-w-md mx-auto my-16 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-4">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Khusus Admin Revina Print</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Halaman ini dilindungi dengan kata sandi admin. Masukkan kata sandi rahasia untuk membuka seluruh fitur kelola cetakan.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setShowAdminPasswordModal(true)}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Masukkan Sandi Admin
                </button>
                <button
                  onClick={() => {
                    switchRoleView('CUSTOMER');
                    handleNavigate('home');
                  }}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
                >
                  Kembali ke Mode Pelanggan
                </button>
              </div>
            </div>
          )
        ) : (
          <>
            {currentTab === 'home' && <HomeView onNavigate={handleNavigate} />}
            {currentTab === 'price-list' && <PriceListView onNavigate={handleNavigate} />}
            {currentTab === 'order-form' && (
              <OrderFormView initialData={navigationParams} onNavigate={handleNavigate} />
            )}
            {currentTab === 'customer-dashboard' && <CustomerDashboardView onNavigate={handleNavigate} />}
            {currentTab === 'order-status' && (
              <OrderStatusView orderId={navigationParams?.orderId} onNavigate={handleNavigate} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Admin Password Modal */}
      {showAdminPasswordModal && (
        <AdminPasswordModal
          onClose={() => setShowAdminPasswordModal(false)}
          onSuccess={() => {
            switchRoleView('ADMIN');
            setCurrentTab('admin-dashboard');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}
