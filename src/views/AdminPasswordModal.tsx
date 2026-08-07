import React, { useState } from 'react';
import { Shield, Key, X, Check, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AdminPasswordModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminPasswordModal: React.FC<AdminPasswordModalProps> = ({ onClose, onSuccess }) => {
  const { verifyAdminPassword } = useAuth();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg('Masukkan kata sandi admin.');
      return;
    }

    const isValid = verifyAdminPassword(password.trim());
    if (isValid) {
      setErrorMsg('');
      setSuccess(true);
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 400);
    } else {
      setErrorMsg('Sandi Admin salah. Silakan masukkan kata sandi yang benar.');
      setPassword('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/10">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Akses Mode Admin</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Masukkan kata sandi rahasia untuk membuka Panel Admin Revina Print.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 text-center animate-in shake duration-150">
            {errorMsg}
          </div>
        )}

        {success && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center flex items-center justify-center gap-2">
            <Check className="w-4 h-4" />
            Kata sandi benar! Membuka Panel Admin...
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Sandi Admin
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Masukkan sandi..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-10 pr-4 py-3 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-500/25 transition-all flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" />
            Buka Panel Admin
          </button>
        </form>
      </div>
    </div>
  );
};
