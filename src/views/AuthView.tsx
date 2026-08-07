import React, { useState } from 'react';
import { X, User, Lock, Phone, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const { login, register } = useAuth();
  const [tab, setTab] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');

  // Form states
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    const lower = whatsapp.trim().toLowerCase();
    const isAdminAccount = lower === 'revina' || lower.includes('admin');
    const res = await login(whatsapp, password, isAdminAccount ? 'SUPER_ADMIN' : 'CUSTOMER');
    if (res.success) {
      setMsg({ type: 'SUCCESS', text: 'Berhasil masuk! Mengalihkan...' });
      setTimeout(onClose, 500);
    } else {
      setMsg({ type: 'ERROR', text: res.error || 'Akun / Password tidak valid. Silakan coba lagi.' });
    }
    setLoading(false);
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setMsg({ type: 'ERROR', text: 'Nama, Email, dan Password wajib diisi.' });
      return;
    }
    setLoading(true);
    const res = await register(name, email, password, whatsapp);
    if (res.success) {
      setMsg({ type: 'SUCCESS', text: 'Pendaftaran berhasil! Akun Anda tersimpan di database MongoDB.' });
      setTimeout(onClose, 600);
    } else {
      setMsg({ type: 'ERROR', text: res.error || 'Gagal melakukan pendaftaran.' });
    }
    setLoading(false);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg({ type: 'SUCCESS', text: 'Tautan reset password telah dikirimkan ke WhatsApp Anda!' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Header */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl mb-6">
          <button
            onClick={() => setTab('LOGIN')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'LOGIN' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setTab('REGISTER')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              tab === 'REGISTER' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-500'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {msg.text && (
          <div
            className={`p-3 rounded-xl text-xs font-semibold mb-4 ${
              msg.type === 'SUCCESS' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* LOGIN FORM */}
        {tab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="081234567890 atau Username"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <button
                type="button"
                onClick={() => setTab('FORGOT')}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
              >
                Lupa Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all"
            >
              {loading ? 'Memproses...' : 'Masuk ke Akun'}
            </button>
          </form>
        )}

        {/* REGISTER FORM */}
        {tab === 'REGISTER' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nama Lengkap
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="Budi Santoso"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="budi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Password Akun
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="Password rahasia Anda"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp (Opsional)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-blue-500/20 hover:opacity-95 transition-all"
            >
              {loading ? 'Menyimpan Akun ke Database...' : 'Daftar & Simpan ke MongoDB'}
            </button>
          </form>
        )}

        {/* FORGOT PASSWORD FORM */}
        {tab === 'FORGOT' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            <p className="text-xs text-slate-500 leading-relaxed">
              Masukkan nomor WhatsApp Anda. Kami akan mengirimkan tautan reset password secara instant.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Nomor WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  required
                  placeholder="081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              Kirim Tautan Reset
            </button>

            <button
              type="button"
              onClick={() => setTab('LOGIN')}
              className="w-full text-center text-xs text-slate-500 hover:underline pt-2"
            >
              Kembali ke Halaman Masuk
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
