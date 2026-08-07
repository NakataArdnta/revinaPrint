import React from 'react';
import { Printer, Phone, Mail, MapPin, Clock, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigate: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
                <Printer className="w-5 h-5" />
              </div>
              <span className="font-bold text-xl text-white tracking-tight">Revina Print</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              Pusat jasa cetak dan print dokumen profesional dengan standar kualitas terbaik, proses cepat, harga transparan, dan jaminan rapi 100%.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 p-2.5 rounded-xl">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Garansi Cetak Ulang Gratis Jika Ada Masalah Kualitas!</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Layanan & Navigasi</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => onNavigate('home')} className="hover:text-blue-400 transition-colors">
                  Beranda Utama
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('price-list')} className="hover:text-blue-400 transition-colors">
                  Daftar Harga Kertas A4 & F4
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('order-form')} className="hover:text-blue-400 transition-colors">
                  Formulir Pemesanan Online
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('customer-dashboard')} className="hover:text-blue-400 transition-colors">
                  Lacak Status & Riwayat Pesanan
                </button>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Hubungi Kami</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>Jl. Percetakan Raya No. 45, Kebayoran Baru, Jakarta Selatan</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href="https://wa.me/6281234567890" target="_blank" rel="noreferrer" className="hover:text-emerald-400 font-medium">
                  WhatsApp: 0812-3456-7890
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>info@revinaprint.com</span>
              </li>
            </ul>
          </div>

          {/* Operating Hours */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Jam Operasional</h4>
            <div className="space-y-2 text-xs bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/50">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  Senin - Sabtu:
                </span>
                <span className="font-semibold text-white">08:00 - 21:00 WIB</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Minggu / Libur:</span>
                <span className="font-medium text-slate-300">10:00 - 17:00 WIB</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-3 italic">
              *Pemesanan online melayani 24/7 dan diproses pada jam operasional.
            </p>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Revina Print. Seluruh hak cipta dilindungi undang-undang.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Dibuat dengan</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>untuk kualitas cetakan terbaik.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
