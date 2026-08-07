import React, { useState } from 'react';
import {
  Printer,
  FileCheck,
  Clock,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Award,
  CreditCard,
  Truck,
  CheckCircle2,
  AlertCircle,
  FileText,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { PriceCalculator } from '../components/PriceCalculator';

interface HomeViewProps {
  onNavigate: (tab: string, initialData?: any) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const faqList = [
    {
      q: 'Format file apa saja yang didukung untuk dicetak?',
      a: 'Revina Print mendukung format PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, JPG, dan PNG dengan sistem validasi otomatis.',
    },
    {
      q: 'Berapa lama proses pengerjaan cetak dokumen?',
      a: 'Untuk dokumen standar di bawah 100 lembar, estimasi pengerjaan hanya 15-30 menit setelah pembayaran dikonfirmasi.',
    },
    {
      q: 'Bagaimana sistem pembayaran di Revina Print?',
      a: 'Kami menerima pembayaran melalui QRIS (Semua E-Wallet/m-Banking), Transfer Bank (BRI), maupun Cash di revina.',
    },
    {
      q: 'Apakah bisa dikirim menggunakan kurir ke alamat saya?',
      a: 'Tidak! hasil print wajib di ambil dari kosan.',
    },
    {
      q: 'Bagaimana jika terdapat kesalahan atau cacat cetak?',
      a: 'Revina Print memberikan Garansi Cetak Ulang Gratis 100% jika kesalahan disebabkan oleh sistem atau mesin percetakan kami.',
    },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/80 via-white to-white dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 pt-12 pb-16 rounded-3xl border border-slate-200/60 dark:border-slate-800">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                <span>Layanan Cetak Online #1 Serba Otomatis & Cepat</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                Cetak Dokumen{' '}
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Mudah, Cepat,
                </span>{' '}
                dan Terpercaya.
              </h1>

              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">
                Revina Print menghadirkan kemudahan cetak dokumen A4 & F4 tanpa perlu antre. Upload file PDF/Word, hitung biaya otomatis, bayar via QRIS, dan pantau status cetak realtime!
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <button
                  onClick={() => onNavigate('order-form')}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-bold text-sm shadow-xl shadow-blue-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>Pesan Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onNavigate('price-list')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  Lihat Daftar Harga
                </button>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-slate-200/80 dark:border-slate-800">
                <div className="text-center lg:text-left">
                  <p className="font-extrabold text-xl text-blue-600 dark:text-blue-400">5.000+</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Pelanggan Puas</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="font-extrabold text-xl text-emerald-600 dark:text-emerald-400">15 Menit</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Proses Cetak Kilat</p>
                </div>
                <div className="text-center lg:text-left">
                  <p className="font-extrabold text-xl text-indigo-600 dark:text-indigo-400">100%</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Garansi Rapi</p>
                </div>
              </div>
            </div>

            {/* Right Interactive Mockup / Hero Visual Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-700">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">Order Realtime</span>
                </div>

                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">Dokumen_Skripsi_Final.pdf</p>
                        <p className="text-[10px] text-slate-500">Kertas A4 • Hitam Putih • 45 Lembar</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">Rp22.500</span>
                  </div>

                  <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-900/60 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-white">Brosur_Perusahaan_Color.pdf</p>
                        <p className="text-[10px] text-slate-500">Kertas F4 • Warna • 10 Lembar + Laminating</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400">Rp75.000</span>
                  </div>

                  {/* Progress simulator widget */}
                  <div className="pt-2">
                    <div className="flex justify-between text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      <span>Status Pesanan #RVP-20260806-0001</span>
                      <span className="text-purple-600 dark:text-purple-400">Sedang Dicetak (80%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 h-full w-[80%] rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cards Pricing Highlight Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Daftar Harga Cetak Terjangkau
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Transparan tanpa biaya tersembunyi. Dapatkan tarif hemat dengan kualitas kertas tebal & tinta tajam.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Card Kertas A4 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-blue-500/30 dark:border-blue-500/20 hover:border-blue-500 transition-all relative overflow-hidden group">
            <div className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-wider">
              Paling Populer
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold text-xl">
                A4
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Kertas A4</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ukuran 21.0 x 29.7 cm (HVS 75/80 gsm)</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Hitam Putih (BW)</span>
                <span className="font-extrabold text-base text-blue-600 dark:text-blue-400">Rp500 / lembar</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Warna (Full Color)</span>
                <span className="font-extrabold text-base text-purple-600 dark:text-purple-400">Rp2.000 / lembar</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('order-form', { paperType: 'A4' })}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Pesan Cetak A4 Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card Kertas F4 */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 dark:border-slate-700 hover:border-purple-500 transition-all relative overflow-hidden group">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold text-xl">
                F4
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">Kertas F4 / Folio</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Ukuran 21.5 x 33.0 cm (HVS 75/80 gsm)</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Hitam Putih (BW)</span>
                <span className="font-extrabold text-base text-blue-600 dark:text-blue-400">Rp700 / lembar</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                <span className="font-semibold text-xs text-slate-700 dark:text-slate-300">Warna (Full Color)</span>
                <span className="font-extrabold text-base text-purple-600 dark:text-purple-400">Rp2.500 / lembar</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('order-form', { paperType: 'F4' })}
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
            >
              <span>Pesan Cetak F4 Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Disclaimer note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 py-2.5 px-4 rounded-xl inline-block font-medium">
            *Catatan: "Harga dapat berubah sewaktu-waktu sesuai ketentuan Revina Print."
          </p>
        </div>
      </section>

      {/* Interactive Price Calculator Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <PriceCalculator onOrderNow={(data) => onNavigate('order-form', data)} />
      </section>

      {/* Cara Pemesanan Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Cara Pemesanan 3 Langkah Mudah
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Proses fleksibel dari mana saja tanpa perlu mengantre lama di tempat cetak.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow-md shadow-blue-500/30">
              1
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Upload & Pilih Spek</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Upload file dokumen (PDF, DOC, Gambar), pilih jenis kertas (A4/F4), warna cetak, jumlah copy, dan finishing.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow-md shadow-indigo-500/30">
              2
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">ACC & Pembayaran</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Admin meninjau dokumen & menyetujui pesanan. Lakukan pembayaran via QRIS / Transfer Bank dengan upload bukti bayar.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative">
            <span className="w-8 h-8 rounded-full bg-emerald-600 text-white font-extrabold text-sm flex items-center justify-center mb-4 shadow-md shadow-emerald-500/30">
              3
            </span>
            <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">Proses Cetak & Ambil</h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Dokumen langsung dicetak presisi. Pantau status realtime dan dapatkan notifikasi saat dokumen siap diambil.
            </p>
          </div>
        </div>
      </section>

      {/* Keunggulan Revina Print */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mb-10">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Keunggulan Utama</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Mengapa Memilih Revina Print?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2">
              Komitmen kami memberikan pengalaman mencetak dokumen yang memuaskan dan profesional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
              <Zap className="w-6 h-6 text-amber-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Cetak Super Cepat</h4>
              <p className="text-xs text-slate-300">Mesin produksi digital tercepat untuk hasil kilat tanpa mengorbankan kualitas.</p>
            </div>

            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
              <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Hasil Rapi & Presisi</h4>
              <p className="text-xs text-slate-300">Pilihan finishing stapler, jilid lakban, spiral, dan laminating dikerjakan oleh tenaga ahli.</p>
            </div>

            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
              <CreditCard className="w-6 h-6 text-blue-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Kalkulasi Otomatis</h4>
              <p className="text-xs text-slate-300">Sistem otomatis menghitung harga per lembar secara transparan sebelum checkout.</p>
            </div>

            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
              <Clock className="w-6 h-6 text-purple-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Tracking Realtime</h4>
              <p className="text-xs text-slate-300">Lacak tahapan proses cetak secara transparan mulai dari persetujuan hingga siap diambil.</p>
            </div>

            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
              <Truck className="w-6 h-6 text-indigo-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Layanan Pengiriman</h4>
              <p className="text-xs text-slate-300">Dukungan opsi pengiriman via kurir online langsung sampai ke depan pintu Anda.</p>
            </div>

            <div className="bg-slate-800/60 p-5 rounded-2xl border border-slate-700/50">
              <Award className="w-6 h-6 text-rose-400 mb-3" />
              <h4 className="font-bold text-sm text-white mb-1">Garansi Cetak Ulang</h4>
              <p className="text-xs text-slate-300">Jaminan garansi cetak ulang gratis jika terdapat kerusakan fisik dari kami.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
            Pertanyaan Sering Diajukan (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
            Temukan jawaban lengkap seputar pemesanan cetak dokumen di Revina Print.
          </p>
        </div>

        <div className="space-y-3">
          {faqList.map((faq, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/40"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-blue-600" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-700/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
