import React, { useRef } from 'react';
import { X, Printer, Download, Share2, CheckCircle2, ShieldCheck, QrCode } from 'lucide-react';
import { OrderItem } from '../types';
import { formatRupiah, FINISHING_LABELS } from '../lib/constants';

interface InvoiceModalProps {
  order: OrderItem;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppShare = () => {
    const text = `Halo Kak ${order.customerName},\nBerikut Invoice Resmi Revina Print:\n` +
      `*Nomor Invoice:* ${order.id}\n` +
      `*Detail Cetak:* ${order.paperType} ${order.colorMode} (${order.pageCount} lembar x ${order.copyCount} copy)\n` +
      `*Finishing:* ${FINISHING_LABELS[order.finishing]}\n` +
      `*Grand Total:* ${formatRupiah(order.grandTotal)}\n` +
      `*Status Pembayaran:* ${order.paymentStatus === 'VERIFIED' ? 'LUNAS (Verifikasi Admin)' : 'Menunggu Pembayaran'}\n\n` +
      `Terima kasih telah mencetak di Revina Print!`;
    const url = `https://wa.me/${order.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 print:shadow-none print:border-none print:m-0">
        {/* Header Bar (Hidden when printing) */}
        <div className="bg-slate-100 dark:bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Invoice Cetakan Resmi</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Cetak / Save PDF
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Share2 className="w-3.5 h-3.5" />
              Kirim WA
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Invoice Body */}
        <div ref={invoiceRef} className="p-8 text-slate-800 dark:text-slate-200 print:text-black print:bg-white">
          {/* Header Branding */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-700 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl">
                  RP
                </div>
                <div>
                  <h1 className="font-extrabold text-2xl text-blue-700 dark:text-blue-400 tracking-tight">
                    REVINA PRINT
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Jasa Print Dokumen Profesional</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                Jl. Percetakan Raya No. 45, Jakarta | WA: 0812-3456-7890
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border border-blue-300 dark:border-blue-700 mb-2">
                INVOICE
              </span>
              <h2 className="font-mono font-bold text-lg text-slate-900 dark:text-white">{order.id}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tanggal: {new Date(order.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Customer Details */}
          <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 mb-6 text-xs">
            <div>
              <p className="text-slate-400 uppercase text-[10px] font-bold tracking-wider mb-1">Ditujukan Kepada:</p>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{order.customerName}</p>
              <p className="text-slate-600 dark:text-slate-300">WhatsApp: {order.whatsapp}</p>
              {order.email && <p className="text-slate-600 dark:text-slate-300">Email: {order.email}</p>}
            </div>
            <div className="text-right">
              <p className="text-slate-400 uppercase text-[10px] font-bold tracking-wider mb-1">Status Pembayaran:</p>
              <span
                className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg text-xs ${
                  order.paymentStatus === 'VERIFIED'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                {order.paymentStatus === 'VERIFIED' ? 'LUNAS (Verifikasi Admin)' : 'Menunggu Pembayaran'}
              </span>
              {order.paymentMethod && (
                <p className="text-slate-500 mt-1">Metode: {order.paymentMethod}</p>
              )}
            </div>
          </div>

          {/* Print Specification Table */}
          <div className="overflow-x-auto mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold">
                  <th className="py-2 px-1">Deskripsi Layanan</th>
                  <th className="py-2 px-1 text-center">Spek</th>
                  <th className="py-2 px-1 text-center">Lembar</th>
                  <th className="py-2 px-1 text-center">Copy</th>
                  <th className="py-2 px-1 text-right">Harga Satuan</th>
                  <th className="py-2 px-1 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                <tr>
                  <td className="py-3 px-1 font-medium text-slate-900 dark:text-slate-100">
                    Cetak Dokumen ({order.paperType} {order.colorMode === 'BW' ? 'Hitam Putih' : 'Warna'})
                    {order.additionalNotes && (
                      <p className="text-[11px] text-slate-400 font-normal italic mt-0.5">
                        Catatan: "{order.additionalNotes}"
                      </p>
                    )}
                  </td>
                  <td className="py-3 px-1 text-center text-slate-600 dark:text-slate-400">
                    {order.printMode === 'DOUBLE' ? 'Bolak Balik' : 'Satu Sisi'} ({order.orientation})
                  </td>
                  <td className="py-3 px-1 text-center font-semibold">{order.pageCount}</td>
                  <td className="py-3 px-1 text-center font-semibold">{order.copyCount}</td>
                  <td className="py-3 px-1 text-right">{formatRupiah(order.unitPrice)}</td>
                  <td className="py-3 px-1 text-right font-semibold">{formatRupiah(order.subtotal)}</td>
                </tr>

                {order.finishing !== 'NONE' && (
                  <tr>
                    <td colSpan={5} className="py-2.5 px-1 font-medium text-slate-700 dark:text-slate-300">
                      Finishing: {FINISHING_LABELS[order.finishing]}
                    </td>
                    <td className="py-2.5 px-1 text-right font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(order.finishingFee)}
                    </td>
                  </tr>
                )}

                {order.customFeeAdjustment !== 0 && (
                  <tr>
                    <td colSpan={5} className="py-2 px-1 font-medium text-slate-700 dark:text-slate-300">
                      Penyesuaian Biaya Admin ({order.customFeeNote || 'Biaya Tambahan / Diskon'})
                    </td>
                    <td className="py-2 px-1 text-right font-semibold text-slate-900 dark:text-white">
                      {formatRupiah(order.customFeeAdjustment)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals Breakdown */}
          <div className="flex justify-between items-end border-t border-slate-200 dark:border-slate-700 pt-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <QrCode className="w-12 h-12" />
              </div>
              <div className="text-[11px] text-slate-500">
                <p className="font-semibold text-slate-800 dark:text-slate-200">Digital Invoice Verification</p>
                <p>QR Code validitas pesanan resmi Revina Print.</p>
              </div>
            </div>

            <div className="w-64 space-y-1.5 text-xs text-right">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal Cetak:</span>
                <span>{formatRupiah(order.subtotal)}</span>
              </div>
              {order.finishingFee > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Biaya Finishing:</span>
                  <span>{formatRupiah(order.finishingFee)}</span>
                </div>
              )}
              {order.customFeeAdjustment !== 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Penyesuaian:</span>
                  <span>{formatRupiah(order.customFeeAdjustment)}</span>
                </div>
              )}
              <div className="flex justify-between font-extrabold text-base text-blue-700 dark:text-blue-400 border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                <span>Grand Total:</span>
                <span>{formatRupiah(order.grandTotal)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signature */}
          <div className="flex items-center justify-between border-t border-dashed border-slate-200 dark:border-slate-700 pt-6 text-xs text-slate-400">
            <div>
              <p className="font-medium text-slate-600 dark:text-slate-400">Ketentuan Layanan:</p>
              <p className="text-[10px]">Dokumen yang dicetak dijamin sesuai data yang dikirim.</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center text-emerald-600 font-bold text-[11px] mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Terverifikasi Digital</span>
              </div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">Revina Printing Official</p>
              <p className="text-[10px] text-slate-400">Kasir & Staf Layanan Cetak</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
