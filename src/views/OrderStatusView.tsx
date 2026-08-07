import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  CreditCard,
  QrCode,
  Printer,
  Share2,
  ShieldCheck,
  ChevronRight,
  Download,
  Copy,
  Check,
  ArrowLeft,
  MessageSquare,
  ExternalLink,
} from 'lucide-react';
import { fetchOrderById, uploadPaymentProof } from '../lib/api';
import { OrderItem, OrderStatus, PaymentMethod } from '../types';
import {
  formatRupiah,
  ORDER_STATUS_CONFIG,
  BANK_ACCOUNTS,
  FINISHING_LABELS,
  QRIS_IMAGE_URL,
  generateWATemplateUrl,
  ADMIN_WA_NUMBER,
} from '../lib/constants';
import { InvoiceModal } from '../components/InvoiceModal';

interface OrderStatusViewProps {
  orderId?: string;
  onNavigate: (tab: string) => void;
}

export const OrderStatusView: React.FC<OrderStatusViewProps> = ({ orderId: initialOrderId, onNavigate }) => {
  const [searchId, setSearchId] = useState(initialOrderId || '');
  const [order, setOrder] = useState<OrderItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Payment upload modal/form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('QRIS');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [isUploadingPayment, setIsUploadingPayment] = useState(false);

  // Invoice modal
  const [showInvoice, setShowInvoice] = useState(false);

  // Copy bank account feedback
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const loadOrder = async (idToFetch: string) => {
    if (!idToFetch.trim()) return;
    setLoading(true);
    setError('');
    const res = await fetchOrderById(idToFetch.trim());
    if (res) {
      setOrder(res);
    } else {
      setOrder(null);
      setError(`Pesanan dengan ID "${idToFetch}" tidak ditemukan.`);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (initialOrderId) {
      setSearchId(initialOrderId);
      loadOrder(initialOrderId);
    }
  }, [initialOrderId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrder(searchId);
  };

  const handleCopy = (accNum: string) => {
    navigator.clipboard.writeText(accNum);
    setCopiedAccount(accNum);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  const handleUploadProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setIsUploadingPayment(true);
    try {
      const updated = await uploadPaymentProof(
        order.id,
        paymentMethod,
        paymentProofUrl || 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60'
      );
      setOrder(updated);
    } catch (err: any) {
      alert(err.message || 'Gagal mengunggah bukti');
    } finally {
      setIsUploadingPayment(false);
    }
  };

  // Progress Bar Steps calculation
  const getStepStatus = (stepIdx: number) => {
    if (!order) return 'PENDING';
    if (order.status === 'DITOLAK') return 'REJECTED';
    const currentStep = ORDER_STATUS_CONFIG[order.status].stepIndex;
    if (currentStep > stepIdx) return 'COMPLETED';
    if (currentStep === stepIdx) return 'ACTIVE';
    return 'PENDING';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Lacak Status Pesanan Realtime</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Masukkan Nomor Pesanan (contoh: RVP-20260806-0001)</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="RVP-20260806-0001"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors"
            >
              Cari
            </button>
          </form>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Mencari data pesanan...</div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center space-y-2">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-sm font-bold text-rose-800 dark:text-rose-200">{error}</p>
          <p className="text-xs text-rose-600 dark:text-rose-400">
            Periksa kembali nomor pesanan pada konfirmasi pesan WhatsApp Anda.
          </p>
        </div>
      ) : order ? (
        <div className="space-y-6">
          {/* Header Card Order summary */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-xl font-extrabold text-blue-600 dark:text-blue-400">#{order.id}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${ORDER_STATUS_CONFIG[order.status].badgeClass}`}>
                  {ORDER_STATUS_CONFIG[order.status].label}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Atas nama: <strong className="text-slate-800 dark:text-slate-200">{order.customerName}</strong> ({order.whatsapp})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInvoice(true)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 transition-colors flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4 text-blue-500" />
                <span>Lihat Invoice</span>
              </button>
            </div>
          </div>

          {/* Rejection Alert Banner */}
          {order.status === 'DITOLAK' && (
            <div className="p-5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 text-xs">
              <h4 className="font-bold text-sm mb-1 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                Pesanan Ditolak oleh Admin
              </h4>
              <p className="font-medium">Alasan: "{order.rejectionReason || 'Spesifikasi atau file dokumen tidak sesuai standar.'}"</p>
              <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-2">
                Silakan hubungi customer service kami via WhatsApp untuk konsultasi dan revisi pesanan.
              </p>
            </div>
          )}

          {/* Realtime Progress Bar */}
          {order.status !== 'DITOLAK' && (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400">Progress Status Realtime</h3>

              <div className="grid grid-cols-5 gap-2 relative">
                {[
                  { step: 1, label: 'Persetujuan' },
                  { step: 2, label: 'Pembayaran' },
                  { step: 3, label: 'Pencetakan' },
                  { step: 4, label: 'Siap Diambil' },
                  { step: 5, label: 'Selesai' },
                ].map((s) => {
                  const state = getStepStatus(s.step);
                  return (
                    <div key={s.step} className="text-center relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-xs mb-1.5 transition-all ${
                          state === 'COMPLETED'
                            ? 'bg-emerald-500 text-white'
                            : state === 'ACTIVE'
                            ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-900 animate-pulse'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                        }`}
                      >
                        {state === 'COMPLETED' ? <CheckCircle2 className="w-5 h-5" /> : s.step}
                      </div>
                      <p className={`text-[10px] font-bold ${state === 'ACTIVE' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                        {s.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-900/50 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">{ORDER_STATUS_CONFIG[order.status].description}</p>
                  <p className="text-[11px] text-blue-600 dark:text-blue-300 mt-0.5">Estimasi Selesai: {order.estimatedCompletion}</p>
                </div>
              </div>
            </div>
          )}

          {/* Payment Action Section (If Status MENUNGGU_PERSETUJUAN or MENUNGGU_PEMBAYARAN) */}
          {(order.status === 'MENUNGGU_PERSETUJUAN' || order.status === 'MENUNGGU_PEMBAYARAN') && (
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800 rounded-3xl p-6 border-2 border-blue-500/40 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Pembayaran QRIS & Konfirmasi WhatsApp</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Scan QRIS di bawah lalu kirim bukti transfer ke WhatsApp Admin agar di-ACC & langsung dicetak.</p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Total Tagihan</p>
                  <p className="text-xl font-black text-blue-600 dark:text-blue-400">{formatRupiah(order.grandTotal)}</p>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {(['QRIS', 'BANK_TRANSFER', 'CASH'] as PaymentMethod[]).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all ${
                        paymentMethod === m
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      {m === 'QRIS' ? 'QRIS Instant' : m === 'BANK_TRANSFER' ? 'Transfer Bank' : 'Bayar Cash'}
                    </button>
                  ))}
                </div>

                {/* QRIS View */}
                {paymentMethod === 'QRIS' && (
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center space-y-3 shadow-sm">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Scan QRIS Resmi Revina Print</p>
                    <div className="relative group max-w-xs mx-auto">
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
                        <ExternalLink className="w-3.5 h-3.5" /> Lihat Gambar QRIS Ukuran Penuh
                      </a>
                    </div>
                    <p className="text-[11px] text-slate-500">Mendukung GoPay, OVO, Dana, ShopeePay, BCA Mobile, Mandiri Livin, BRImo & Semua M-Banking.</p>
                  </div>
                )}

                {/* Bank Transfer View */}
                {paymentMethod === 'BANK_TRANSFER' && (
                  <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                    <p className="font-bold text-slate-800 dark:text-slate-200">Rekening Resmi Revina Print:</p>
                    {BANK_ACCOUNTS.map((b) => (
                      <div key={b.bank} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div>
                          <p className="font-extrabold text-blue-600 dark:text-blue-400">{b.bank} - {b.accountNumber}</p>
                          <p className="text-[11px] text-slate-500">a.n. {b.accountName}</p>
                        </div>
                        <button
                          onClick={() => handleCopy(b.accountNumber)}
                          className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 font-bold text-[11px] text-slate-700 dark:text-slate-300 hover:bg-slate-300 transition-colors flex items-center gap-1"
                        >
                          {copiedAccount === b.accountNumber ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedAccount === b.accountNumber ? 'Tersalin' : 'Salin'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Big WhatsApp Action Button with Template Format */}
                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Kirim Bukti Pembayaran ke WhatsApp Admin:</span>
                  </div>

                  <a
                    href={generateWATemplateUrl(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 text-center"
                  >
                    <MessageSquare className="w-4.5 h-4.5" />
                    <span>Kirim Bukti Bayar via WhatsApp ({ADMIN_WA_NUMBER})</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </a>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-emerald-900 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="font-bold text-emerald-700 dark:text-emerald-400">Format Pesan WhatsApp Otomatis:</p>
                    <pre className="font-mono text-[10px] bg-slate-50 dark:bg-slate-800 p-2 rounded border border-slate-200 dark:border-slate-700 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
{`Halo Admin Revina Print,
Saya ingin konfirmasi pembayaran pesanan cetak:
- Nama: ${order.customerName}
- No. Order / ID: #${order.id}
- WA / Email: ${order.whatsapp}${order.email ? ' / ' + order.email : ''}
- Total Bayar: ${formatRupiah(order.grandTotal)}

Berikut saya lampirkan bukti transfer / screenshot QRIS. Mohon di-ACC.`}
                    </pre>
                  </div>
                </div>

                {/* Upload Proof Form */}
                <form onSubmit={handleUploadProof} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Atau Unggah URL Bukti Transfer di Sini (Opsional):</p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan URL foto/screenshot struk bukti bayar..."
                      value={paymentProofUrl}
                      onChange={(e) => setPaymentProofUrl(e.target.value)}
                      className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-medium text-slate-900 dark:text-white"
                    />
                    <button
                      type="submit"
                      disabled={isUploadingPayment}
                      className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shrink-0"
                    >
                      {isUploadingPayment ? 'Mengunggah...' : 'Upload Bukti'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Specs Details Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              Rincian Spesifikasi Cetak
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Dokumen Berkas:</span>
                <div className="space-y-1 mt-0.5">
                  {order.files && order.files.length > 0 ? (
                    order.files.map((f, idx) => (
                      <div key={f.id || idx} className="truncate font-bold text-slate-900 dark:text-white">
                        {f.name}
                        {f.dataUrl && (
                          <a href={f.dataUrl} target="_blank" rel="noopener noreferrer" className="ml-1 text-blue-600 dark:text-blue-400 hover:underline inline-inline-flex items-center text-[10px]">
                            <ExternalLink className="w-3 h-3 inline ml-0.5" />
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-white">{order.fileName || 'Dokumen Cetak'}</span>
                  )}
                </div>
              </div>
              <div>
                <span className="text-slate-400 block">Jenis Kertas:</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.paperType}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Warna Cetak:</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.colorMode === 'BW' ? 'Hitam Putih' : 'Full Color'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Jumlah Lembar x Copy:</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.pageCount} lembar ({order.copyCount} copy)</span>
              </div>
              <div>
                <span className="text-slate-400 block">Print Sisi:</span>
                <span className="font-bold text-slate-900 dark:text-white">{order.printMode === 'DOUBLE' ? 'Bolak Balik' : 'Satu Sisi'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Finishing:</span>
                <span className="font-bold text-slate-900 dark:text-white">{FINISHING_LABELS[order.finishing]}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Grand Total:</span>
                <span className="font-extrabold text-blue-600 dark:text-blue-400">{formatRupiah(order.grandTotal)}</span>
              </div>
            </div>

            {order.additionalNotes && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-700/50 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-bold text-slate-800 dark:text-slate-200">Catatan Khusus:</span> "{order.additionalNotes}"
              </div>
            )}
          </div>

          {/* Status History Timeline */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700 pb-3">
              Riwayat Perubahan Status
            </h3>

            <div className="space-y-4 relative pl-4 border-l-2 border-slate-200 dark:border-slate-700 ml-2">
              {order.statusHistory.map((h, i) => (
                <div key={i} className="relative">
                  <div className="w-3 h-3 rounded-full bg-blue-600 absolute -left-[23px] top-1 border-2 border-white dark:border-slate-800"></div>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-xs text-slate-900 dark:text-white">{ORDER_STATUS_CONFIG[h.status]?.label || h.status}</p>
                    <span className="text-[10px] text-slate-400">
                      {new Date(h.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  {h.note && <p className="text-xs text-slate-500 mt-0.5">{h.note}</p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Invoice Modal */}
      {showInvoice && order && (
        <InvoiceModal order={order} onClose={() => setShowInvoice(false)} />
      )}
    </div>
  );
};
