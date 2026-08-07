import React, { useState } from 'react';
import { Calculator, Check, Info, FileText, ArrowRight } from 'lucide-react';
import { PaperType, ColorMode, FinishingType, PrintMode, Orientation } from '../types';
import { calculateOrderPrice, formatRupiah, FINISHING_LABELS, DEFAULT_PRICING } from '../lib/constants';

interface PriceCalculatorProps {
  onOrderNow?: (initialData: any) => void;
}

export const PriceCalculator: React.FC<PriceCalculatorProps> = ({ onOrderNow }) => {
  const [paperType, setPaperType] = useState<PaperType>('A4');
  const [colorMode, setColorMode] = useState<ColorMode>('BW');
  const [pageCount, setPageCount] = useState<number>(10);
  const [copyCount, setCopyCount] = useState<number>(1);
  const [printMode, setPrintMode] = useState<PrintMode>('SINGLE');
  const [orientation, setOrientation] = useState<Orientation>('PORTRAIT');
  const [finishing, setFinishing] = useState<FinishingType>('NONE');

  const priceResult = calculateOrderPrice(
    paperType,
    colorMode,
    pageCount,
    copyCount,
    finishing,
    DEFAULT_PRICING
  );

  const handleStartOrder = () => {
    if (onOrderNow) {
      onOrderNow({
        paperType,
        colorMode,
        pageCount,
        copyCount,
        printMode,
        orientation,
        finishing,
      });
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200/80 dark:border-slate-700/80 relative overflow-hidden">
      <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
          <Calculator className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900 dark:text-white">Kalkulator Simulasi Harga Instant</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Hitung biaya cetak & finishing dokumen secara tepat dan otomatis.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Jenis Kertas */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            1. Jenis Kertas
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaperType('A4')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                paperType === 'A4'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300'
              }`}
            >
              Kertas A4 (21 x 29.7 cm)
            </button>
            <button
              type="button"
              onClick={() => setPaperType('F4')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                paperType === 'F4'
                  ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:border-blue-300'
              }`}
            >
              Kertas F4 / Folio (21.5 x 33 cm)
            </button>
          </div>
        </div>

        {/* Warna Cetak */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            2. Warna Cetak
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setColorMode('BW')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                colorMode === 'BW'
                  ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
              }`}
            >
              Hitam Putih ({paperType === 'A4' ? 'Rp500' : 'Rp700'})
            </button>
            <button
              type="button"
              onClick={() => setColorMode('COLOR')}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                colorMode === 'COLOR'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600 shadow-md'
                  : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
              }`}
            >
              Warna ({paperType === 'A4' ? 'Rp2.000' : 'Rp2.500'})
            </button>
          </div>
        </div>

        {/* Jumlah Lembar & Copy */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Jumlah Lembar
            </label>
            <input
              type="number"
              min={1}
              value={pageCount}
              onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Jumlah Copy
            </label>
            <input
              type="number"
              min={1}
              value={copyCount}
              onChange={(e) => setCopyCount(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-sm font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Print Sisi & Orientation */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            Cetak Sisi & Orientasi
          </label>
          <div className="grid grid-cols-2 gap-2 mb-2">
            <select
              value={printMode}
              onChange={(e) => setPrintMode(e.target.value as PrintMode)}
              className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="SINGLE">Satu Sisi</option>
              <option value="DOUBLE">Bolak Balik</option>
            </select>
            <select
              value={orientation}
              onChange={(e) => setOrientation(e.target.value as Orientation)}
              className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-2.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200"
            >
              <option value="PORTRAIT">Portrait</option>
              <option value="LANDSCAPE">Landscape</option>
            </select>
          </div>
        </div>

        {/* Finishing */}
        <div className="md:col-span-2 lg:col-span-2">
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
            3. Pilihan Finishing Tambahan
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
            {(['NONE', 'STAPLER', 'LAKBAN', 'SPIRAL', 'LAMINATING'] as FinishingType[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFinishing(f)}
                className={`py-2 px-2.5 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                  finishing === f
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-700/40 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                }`}
              >
                {FINISHING_LABELS[f]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Realtime Total Output Banner */}
      <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800/80 dark:to-slate-800/40 p-5 rounded-2xl border border-blue-100 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span>Subtotal: <strong>{formatRupiah(priceResult.subtotal)}</strong></span>
            <span>•</span>
            <span>Finishing: <strong>{formatRupiah(priceResult.finishingFee)}</strong></span>
          </div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Estimasi Total Biaya:</span>
            <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
              {formatRupiah(priceResult.grandTotal)}
            </span>
          </div>
        </div>

        {onOrderNow && (
          <button
            onClick={handleStartOrder}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-xs shadow-lg shadow-blue-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <span>Pesan Sekarang dengan Spek Ini</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
