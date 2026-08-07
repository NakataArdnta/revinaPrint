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
import { AuthModal } from './views/AuthView';
import { ProfileModal } from './views/ProfileModal';

function AppContent() {
  const { user, activeRoleView } = useAuth();

  const [currentTab, setCurrentTab] = useState('home');
  const [navigationParams, setNavigationParams] = useState<any>(null);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const isAdmin = !!user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' || user.role === 'OPERATOR');

  const handleNavigate = (tab: string, params?: any) => {
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
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
      />

      {/* Main Page View Router */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeRoleView === 'ADMIN' ? (
          isAdmin ? (
            <AdminDashboardView />
          ) : (
            <div className="max-w-md mx-auto my-16 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 text-center shadow-xl space-y-4">
              <div className="w-16 h-16 bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Akses Ditolak / Khusus Admin</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Halaman ini dilindungi dan hanya dapat diakses oleh akun Admin Revina Print yang sah. Silakan masuk terlebih dahulu dengan akun Admin.
              </p>
              <div className="pt-2 flex flex-col gap-2">
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
                >
                  Masuk Sebagai Admin
                </button>
                <button
                  onClick={() => handleNavigate('home')}
                  className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all"
                >
                  Kembali ke Beranda Pelanggan
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

      {/* Auth Modal */}
      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}

      {/* Profile Modal */}
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
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
