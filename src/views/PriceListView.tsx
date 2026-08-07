import React, { useState, useEffect } from 'react';
import { Tag, FileText, CheckCircle2, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { fetchPricingConfig } from '../lib/api';
import { PricingConfig } from '../types';
import { formatRupiah, DEFAULT_PRICING, FINISHING_LABELS } from '../lib/constants';
import { PriceCalculator } from '../components/PriceCalculator';

interface PriceListViewProps {
  onNavigate: (tab: string, initialData?: any) => void;
}

export const PriceListView: React.FC<PriceListViewProps> = ({ onNavigate }) => {
  const [pricing, setPricing] = useState<PricingConfig>(DEFAULT_PRICING);

  useEffect(() => {
    fetchPricingConfig().then(setPricing);
  }, []);

  return (
    <div className="space-y-12 pb-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
          Transparan & Terjangkau
        </span>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Daftar Harga Cetak & Finishing
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
          Tarif percetakan dokumen Revina Print disusun secara transparan. Nikmati cetakan HVS berkualitas tinggi dengan tinta tajam & anti-pudar.
        </p>
      </div>

      {/* Main Kertas Price Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Kertas A4 */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border-2 border-blue-500/40 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-black text-2xl shadow-inner">
              A4
            </div>
            <div>
              <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white">Kertas A4</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ukuran 210 x 297 mm • HVS 75/80 gsm</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Hitam Putih (BW)</p>
                <p className="text-[11px] text-slate-500">Teks, Laporan, Skripsi, Tugas Sekolah</p>
              </div>
              <span className="font-black text-xl text-blue-600 dark:text-blue-400">
                {formatRupiah(pricing.a4_bw)} <span className="text-xs font-normal text-slate-500">/ lembar</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Warna (Full Color)</p>
                <p className="text-[11px] text-slate-500">Gambar, Grafik, Brosur, Presentasi</p>
              </div>
              <span className="font-black text-xl text-purple-600 dark:text-purple-400">
                {formatRupiah(pricing.a4_color)} <span className="text-xs font-normal text-slate-500">/ lembar</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('order-form', { paperType: 'A4' })}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
          >
            <span>Pesan Cetak A4</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Kertas F4 */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-xl border-2 border-purple-500/40 relative overflow-hidden">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-black text-2xl shadow-inner">
              F4
            </div>
            <div>
              <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white">Kertas F4 / Folio</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ukuran 215 x 330 mm • HVS 75/80 gsm</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Hitam Putih (BW)</p>
                <p className="text-[11px] text-slate-500">Dokumen Hukum, Formulir, Notaris</p>
              </div>
              <span className="font-black text-xl text-blue-600 dark:text-blue-400">
                {formatRupiah(pricing.f4_bw)} <span className="text-xs font-normal text-slate-500">/ lembar</span>
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <p className="font-bold text-sm text-slate-900 dark:text-white">Warna (Full Color)</p>
                <p className="text-[11px] text-slate-500">Peta, Diagram Folio, Poster Promosi</p>
              </div>
              <span className="font-black text-xl text-purple-600 dark:text-purple-400">
                {formatRupiah(pricing.f4_color)} <span className="text-xs font-normal text-slate-500">/ lembar</span>
              </span>
            </div>
          </div>

          <button
            onClick={() => onNavigate('order-form', { paperType: 'F4' })}
            className="w-full py-3.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-all shadow-md shadow-purple-500/20 flex items-center justify-center gap-2"
          >
            <span>Pesan Cetak F4</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Note */}
      <div className="max-w-3xl mx-auto text-center">
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs font-semibold">
          "Harga dapat berubah sewaktu-waktu sesuai ketentuan Revina Print."
        </div>
      </div>

      {/* Finishing Prices */}
      <div className="max-w-5xl mx-auto bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-xl">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Biaya Tambahan Finishing & Jilid</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Pilihan penjilidan rapi agar dokumen tampil makin profesional.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400 block mb-1">Stapler Rapi</span>
            <p className="font-extrabold text-base text-slate-900 dark:text-white">{formatRupiah(pricing.finishing_stapler)}</p>
            <p className="text-[10px] text-slate-500 mt-1">Per buku / bundel</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400 block mb-1">Jilid Lakban</span>
            <p className="font-extrabold text-base text-slate-900 dark:text-white">{formatRupiah(pricing.finishing_lakban)}</p>
            <p className="text-[10px] text-slate-500 mt-1">Termasuk cover mika & lakban hitam</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400 block mb-1">Jilid Spiral Ring</span>
            <p className="font-extrabold text-base text-slate-900 dark:text-white">{formatRupiah(pricing.finishing_spiral)}</p>
            <p className="text-[10px] text-slate-500 mt-1">Ring kawat / plastik + mika tebal</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-400 block mb-1">Laminating Pres</span>
            <p className="font-extrabold text-base text-slate-900 dark:text-white">{formatRupiah(pricing.finishing_laminating)}</p>
            <p className="text-[10px] text-slate-500 mt-1">Per lembar pres plastik anti air</p>
          </div>
        </div>
      </div>

      {/* Simulator Calculator */}
      <div className="max-w-5xl mx-auto">
        <PriceCalculator onOrderNow={(data) => onNavigate('order-form', data)} />
      </div>
    </div>
  );
};
