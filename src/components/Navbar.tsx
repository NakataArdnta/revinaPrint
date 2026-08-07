import React, { useState } from 'react';
import { Printer, Sun, Moon, Shield, Lock, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  onOpenAdminAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, onNavigate, onOpenAdminAuth }) => {
  const { isAdminAuthenticated, activeRoleView, switchRoleView, logoutAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleAdminClick = () => {
    if (!isAdminAuthenticated) {
      onOpenAdminAuth();
    } else {
      switchRoleView('ADMIN');
      onNavigate('admin-dashboard');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand */}
          <button
            onClick={() => {
              onNavigate(activeRoleView === 'ADMIN' ? 'admin-dashboard' : 'home');
              setIsMobileMenuOpen(false);
            }}
            className="flex items-center gap-2.5 text-left group focus:outline-none"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Revina Print
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-semibold px-1.5 py-0.5 rounded-md dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-1 font-medium">
                Jasa Print Dokumen Langsung
              </p>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 dark:bg-slate-800/60 p-1 rounded-xl border border-slate-200/60 dark:border-slate-700/50">
            {activeRoleView === 'CUSTOMER' ? (
              <>
                <button
                  onClick={() => onNavigate('home')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentTab === 'home'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Beranda
                </button>
                <button
                  onClick={() => onNavigate('price-list')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentTab === 'price-list'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Daftar Harga
                </button>
                <button
                  onClick={() => onNavigate('order-form')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentTab === 'order-form'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Pesan Cetak
                </button>
                <button
                  onClick={() => onNavigate('customer-dashboard')}
                  className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    currentTab === 'customer-dashboard' || currentTab === 'order-status'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Riwayat Cetak
                </button>
              </>
            ) : (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-indigo-600 text-white shadow-xs"
              >
                <Shield className="w-4 h-4" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Right Action Icons & Admin Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Ganti Mode Gelap/Terang"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Admin Password Mode Button */}
            {isAdminAuthenticated ? (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  onClick={() => {
                    switchRoleView(activeRoleView === 'ADMIN' ? 'CUSTOMER' : 'ADMIN');
                    onNavigate(activeRoleView === 'ADMIN' ? 'home' : 'admin-dashboard');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeRoleView === 'ADMIN'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400'
                  }`}
                >
                  <Shield className="w-3.5 h-3.5" />
                  {activeRoleView === 'ADMIN' ? 'Admin Active' : 'Mode Admin'}
                </button>
                <button
                  onClick={logoutAdmin}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Keluar dari Akses Admin"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdminClick}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all"
              >
                <Lock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Kategori Admin</span>
              </button>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-6 space-y-2">
          {activeRoleView === 'CUSTOMER' ? (
            <>
              <button
                onClick={() => {
                  onNavigate('home');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Beranda
              </button>
              <button
                onClick={() => {
                  onNavigate('price-list');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Daftar Harga
              </button>
              <button
                onClick={() => {
                  onNavigate('order-form');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Pesan Cetak
              </button>
              <button
                onClick={() => {
                  onNavigate('customer-dashboard');
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Riwayat Cetak
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                onNavigate('admin-dashboard');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white"
            >
              Panel Admin Dashboard
            </button>
          )}

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                handleAdminClick();
              }}
              className="w-full py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Shield className="w-4 h-4" />
              {isAdminAuthenticated ? 'Buka Panel Admin' : 'Kategori Admin (Sandi: revinanakata)'}
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
