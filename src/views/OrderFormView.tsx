import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Calculator,
  Printer,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  ShieldCheck,
  FileCode,
  MessageSquare,
  ExternalLink,
  CreditCard,
  QrCode,
  X,
} from 'lucide-react';
import { PaperType, ColorMode, PrintMode, Orientation, FinishingType, FileItem, OrderItem } from '../types';
import { createOrder, fetchPricingConfig } from '../lib/api';
import {
  calculateOrderPrice,
  formatRupiah,
  FINISHING_LABELS,
  DEFAULT_PRICING,
  QRIS_IMAGE_URL,
  generateWATemplateUrl,
  ADMIN_WA_NUMBER,
} from '../lib/constants';
import { useAuth } from '../context/AuthContext';

interface OrderFormViewProps {
  initialData?: any;
  onNavigate: (tab: string, params?: any) => void;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.xls', '.xlsx', '.jpg', '.png'];

export const OrderFormView: React.FC<OrderFormViewProps> = ({ initialData, onNavigate }) => {
  const { user } = useAuth();

  // Data Pemesan
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [whatsapp, setWhatsapp] = useState(user?.whatsapp || '');
  const [email, setEmail] = useState(user?.email || '');

  // Detail Cetak
  const [files, setFiles] = useState<FileItem[]>([]);
  const [paperType, setPaperType] = useState<PaperType>(initialData?.paperType || 'A4');
  const [colorMode, setColorMode] = useState<ColorMode>(initialData?.colorMode || 'BW');
  const [pageCount, setPageCount] = useState<number>(initialData?.pageCount || 1);
  const [copyCount, setCopyCount] = useState<number>(initialData?.copyCount || 1);
  const [printMode, setPrintMode] = useState<PrintMode>(initialData?.printMode || 'SINGLE');
  const [orientation, setOrientation] = useState<Orientation>(initialData?.orientation || 'PORTRAIT');
  const [finishing, setFinishing] = useState<FinishingType>(initialData?.finishing || 'NONE');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Config & State
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Created Order Popup Modal for Instant Payment & WA Confirmation
  const [createdOrderModal, setCreatedOrderModal] = useState<OrderItem | null>(null);

  useEffect(() => {
    fetchPricingConfig().then(setPricing);
  }, []);

  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!whatsapp) setWhatsapp(user.whatsapp);
      if (!email) setEmail(user.email);
    }
  }, [user]);

  // Recalculate total page count based on uploaded files if available
  const handleFileUpload = (uploadedFiles: FileList | File[]) => {
    setErrorMessage('');
    const newFileItems: FileItem[] = [];
    let totalPagesAdded = 0;

    Array.from(uploadedFiles).forEach((file) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        setErrorMessage(`Format file "${file.name}" tidak didukung. Format wajib PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG.`);
        return;
      }

      // Estimate page count
      let pageEst = 1;
      if (ext === '.pdf') pageEst = Math.max(1, Math.round(file.size / (150 * 1024)));
      else if (['.doc', '.docx', '.ppt', '.pptx'].includes(ext)) pageEst = Math.max(1, Math.round(file.size / (200 * 1024)));

      totalPagesAdded += pageEst;

      const dataUrl = URL.createObjectURL(file);
      newFileItems.push({
        id: 'file-' + Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type || ext,
        dataUrl,
        pageCountEstimate: pageEst,
      });
    });

    if (newFileItems.length > 0) {
      setFiles((prev) => [...prev, ...newFileItems]);
      setPageCount((prev) => (files.length === 0 ? totalPagesAdded : prev + totalPagesAdded));
    }
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  // Price Calculation
  const priceResult = calculateOrderPrice(
    paperType,
    colorMode,
    pageCount,
    copyCount,
    finishing,
    pricing
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !whatsapp) {
      setErrorMessage('Nama Pemesan dan Nomor WhatsApp wajib diisi.');
      return;
    }

    if (files.length === 0) {
      setErrorMessage('Harap unggah setidaknya 1 dokumen file cetak.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const created = await createOrder({
        customerName,
        whatsapp,
        email,
        files,
        paperType,
        colorMode,
        pageCount,
        copyCount,
        printMode,
        orientation,
        finishing,
        additionalNotes,
      });

      // Show Instant QRIS Payment & WhatsApp Modal Popup
      setCreatedOrderModal(created);
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div className="text-center space-y-2">
        <span className="px-3.5 py-1 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wider">
          Formulir Pemesanan Online
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Form Cetak Dokumen Revina Print
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Isi detail data pemesan dan spesifikasi cetak. Biaya dihitung secara otomatis dan transparan.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form Inputs (8 Columns) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Data Pemesan */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center">
                1
              </span>
              Data Pemesan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nomor WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="Contoh: 081234567890"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email (Opsional untuk Invoice Digital)
                </label>
                <input
                  type="email"
                  placeholder="budi@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Upload File */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <span className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center">
                  2
                </span>
                Upload File Dokumen <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] text-slate-400 font-normal">Mendukung Banyak File</span>
            </h3>

            {/* Drag and Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);
                if (e.dataTransfer.files) handleFileUpload(e.dataTransfer.files);
              }}
              className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30'
                  : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 bg-slate-50/50 dark:bg-slate-700/20'
              }`}
            >
              <Upload className="w-8 h-8 mx-auto text-blue-500 mb-2 animate-bounce" />
              <p className="font-bold text-xs text-slate-800 dark:text-slate-200">
                Tarik & Lepas File ke Sini, atau <span className="text-blue-600 dark:text-blue-400 underline cursor-pointer">Pilih File</span>
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Format didukung: PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, PNG (Maks 50MB)
              </p>

              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.jpg,.png"
                onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                className="hidden"
                id="file-upload-input"
              />
              <label
                htmlFor="file-upload-input"
                className="mt-3 inline-block px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs cursor-pointer shadow-sm"
              >
                Pilih File dari Komputer/HP
              </label>
            </div>

            {/* Uploaded File List */}
            {files.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">File Terpilih ({files.length}):</p>
                {files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 text-xs"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">
                          {(file.size / (1024 * 1024)).toFixed(2)} MB • Est. {file.pageCountEstimate} lembar
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(file.id)}
                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Detail Spesifikasi Cetak */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-700 pb-3">
              <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center">
                3
              </span>
              Pilihan Spesifikasi Cetak
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Jenis Kertas */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Jenis Kertas
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaperType('A4')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      paperType === 'A4'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    A4
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaperType('F4')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      paperType === 'F4'
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    F4 / Folio
                  </button>
                </div>
              </div>

              {/* Warna Cetak */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Warna Cetak
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setColorMode('BW')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      colorMode === 'BW'
                        ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-100 dark:text-slate-900'
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    Hitam Putih
                  </button>
                  <button
                    type="button"
                    onClick={() => setColorMode('COLOR')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold ${
                      colorMode === 'COLOR'
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-indigo-600'
                        : 'bg-slate-50 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    Warna
                  </button>
                </div>
              </div>

              {/* Jumlah Lembar & Copy */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Lembar
                </label>
                <input
                  type="number"
                  min={1}
                  value={pageCount}
                  onChange={(e) => setPageCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Jumlah Copy / Rangkap
                </label>
                <input
                  type="number"
                  min={1}
                  value={copyCount}
                  onChange={(e) => setCopyCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-900 dark:text-white"
                />
              </div>

              {/* Sisi & Orientasi */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Sisi Cetak
                </label>
                <select
                  value={printMode}
                  onChange={(e) => setPrintMode(e.target.value as PrintMode)}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="SINGLE">Satu Sisi</option>
                  <option value="DOUBLE">Bolak Balik</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Orientasi Dokumen
                </label>
                <select
                  value={orientation}
                  onChange={(e) => setOrientation(e.target.value as Orientation)}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="PORTRAIT">Portrait (Tegak)</option>
                  <option value="LANDSCAPE">Landscape (Mendatar)</option>
                </select>
              </div>

              {/* Finishing */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Pilihan Finishing
                </label>
                <select
                  value={finishing}
                  onChange={(e) => setFinishing(e.target.value as FinishingType)}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2.5 text-xs font-medium text-slate-900 dark:text-white"
                >
                  <option value="NONE">Tanpa Finishing</option>
                  <option value="STAPLER">Stapler (+Rp1.000/copy)</option>
                  <option value="LAKBAN">Jilid Lakban (+Rp3.000/copy)</option>
                  <option value="SPIRAL">Jilid Spiral Ring (+Rp8.000/copy)</option>
                  <option value="LAMINATING">Laminating Pres (+Rp5.000/lembar)</option>
                </select>
              </div>

              {/* Catatan Tambahan */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Catatan Tambahan
                </label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Tolong halaman cover depan diprint di kertas warna merah..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl p-3 text-xs font-medium text-slate-900 dark:text-white"
                ></textarea>
              </div>
            </div>
          </div>
        </div>

        {/* Right Price Breakdown & Checkout Summary (4 Columns) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border-2 border-blue-500/30 dark:border-blue-500/20 shadow-xl sticky top-24">
            <h3 className="font-bold text-base text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3 mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-blue-600" />
              Ringkasan Perhitungan Harga
            </h3>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Layanan Cetak ({paperType} {colorMode}):</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(priceResult.unitPrice)} / lbr</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Volume ({pageCount} lembar x {copyCount} copy):</span>
                <span className="font-semibold text-slate-900 dark:text-white">{pageCount * copyCount} lembar total</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal Cetak:</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(priceResult.subtotal)}</span>
              </div>

              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Finishing ({FINISHING_LABELS[finishing]}):</span>
                <span className="font-semibold text-slate-900 dark:text-white">{formatRupiah(priceResult.finishingFee)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase">Grand Total:</span>
                  <p className="text-[10px] text-slate-400">Sudah termasuk PPN</p>
                </div>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">
                  {formatRupiah(priceResult.grandTotal)}
                </span>
              </div>
            </div>

            {/* Time Estimate Box */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-700 text-xs mb-6 flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-800 dark:text-slate-200">Estimasi Selesai:</p>
                <p className="text-slate-500 text-[11px]">15 - 30 Menit setelah pesanan di-ACC Admin</p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-extrabold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Memproses Pesanan...</span>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Kirim Pesanan Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Transaksi Aman • Garansi Rapi Revina Print</span>
              </p>
            </div>
          </div>
        </div>
      </form>

      {/* MODAL POPUP SETELAH BUAT PESANAN: PEMBAYARAN QRIS & KIRIM BUKTI WA */}
      {createdOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 dark:border-slate-800 my-8">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Pesanan Berhasil Masuk Antrean!</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Nomor Pesanan: <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">#{createdOrderModal.id}</span>
              </p>
            </div>

            {/* QRIS Image & Instruksi */}
            <div className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <div className="inline-block bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-extrabold text-[11px] px-3 py-1 rounded-full uppercase tracking-wider">
                Langkah 1: Scan QRIS Pembayaran
              </div>

              <div className="text-center">
                <p className="text-xs text-slate-500">Total Yang Harus Dibayar:</p>
                <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                  {formatRupiah(createdOrderModal.grandTotal)}
                </p>
              </div>

              <div className="relative group max-w-xs mx-auto pt-1">
                <img
                  src={QRIS_IMAGE_URL}
                  alt="QRIS Revina Print"
                  className="w-56 h-auto mx-auto rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-md object-contain"
                />
                <a
                  href={QRIS_IMAGE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Gambar QRIS Ukuran Penuh
                </a>
              </div>
            </div>

            {/* Tombol Kirim Bukti Pembayaran via WhatsApp */}
            <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs">
                <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Langkah 2: Kirim Bukti Transfer ke WhatsApp</span>
              </div>

              <a
                href={generateWATemplateUrl(createdOrderModal)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-center"
              >
                <MessageSquare className="w-4.5 h-4.5" />
                <span>Kirim Bukti Pembayaran via WhatsApp ({ADMIN_WA_NUMBER})</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80" />
              </a>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center italic">
                *Tombol akan langsung membuka chat WhatsApp dengan format template otomatis. Tinggal kirim screenshot bukti bayar Anda.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2">
              <button
                onClick={() => onNavigate('order-status', { orderId: createdOrderModal.id })}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Lacak Status Pesanan Saya</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCreatedOrderModal(null)}
                className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Tutup & Buat Pesanan Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
