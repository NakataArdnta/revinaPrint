import { OrderStatus, PaperType, ColorMode, FinishingType, PricingConfig } from '../types';

export const DEFAULT_PRICING: PricingConfig = {
  a4_bw: 500,
  a4_color: 2000,
  f4_bw: 700,
  f4_color: 2500,
  finishing_stapler: 1000,
  finishing_lakban: 3000,
  finishing_spiral: 8000,
  finishing_laminating: 5000,
};

export const FINISHING_LABELS: Record<FinishingType, string> = {
  NONE: 'Tanpa Finishing',
  STAPLER: 'Stapler Rapi',
  LAKBAN: 'Jilid Lakban',
  SPIRAL: 'Jilid Spiral Ring',
  LAMINATING: 'Laminating Pres',
};

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; badgeClass: string; stepIndex: number; description: string }
> = {
  MENUNGGU_PERSETUJUAN: {
    label: 'Menunggu Persetujuan',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700',
    stepIndex: 1,
    description: 'Pesanan telah diterima sistem dan menunggu peninjauan admin.',
  },
  MENUNGGU_PEMBAYARAN: {
    label: 'Menunggu Pembayaran',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
    stepIndex: 2,
    description: 'Pesanan disetujui. Silakan lakukan pembayaran agar dapat segera dicetak.',
  },
  SEDANG_DICETAK: {
    label: 'Sedang Dicetak',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/40 dark:text-purple-300 dark:border-purple-700',
    stepIndex: 3,
    description: 'Pembayaran terverifikasi. Dokumen Anda sedang dalam proses pencetakan & finishing.',
  },
  SIAP_DIAMBIL: {
    label: 'Siap Diambil',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:border-teal-700',
    stepIndex: 4,
    description: 'Dokumen Anda sudah selesai dicetak dan siap diambil di outlet Revina Print.',
  },
  SEDANG_DIANTAR: {
    label: 'Sedang Diantar',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/40 dark:text-indigo-300 dark:border-indigo-700',
    stepIndex: 4,
    description: 'Dokumen Anda sedang dalam perjalanan pengiriman oleh kurir.',
  },
  SELESAI: {
    label: 'Selesai',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border-emerald-700',
    stepIndex: 5,
    description: 'Pesanan telah berhasil diselesaikan. Terima kasih telah menggunakan jasa Revina Print!',
  },
  DITOLAK: {
    label: 'Ditolak',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/40 dark:text-rose-300 dark:border-rose-700',
    stepIndex: 0,
    description: 'Pesanan ditolak oleh admin. Silakan periksa alasan penolakan.',
  },
};

export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const calculateOrderPrice = (
  paperType: PaperType,
  colorMode: ColorMode,
  pageCount: number,
  copyCount: number,
  finishing: FinishingType,
  pricing: PricingConfig = DEFAULT_PRICING,
  customAdjustment: number = 0
) => {
  let unitPrice = 0;
  if (paperType === 'A4') {
    unitPrice = colorMode === 'BW' ? pricing.a4_bw : pricing.a4_color;
  } else {
    unitPrice = colorMode === 'BW' ? pricing.f4_bw : pricing.f4_color;
  }

  const subtotal = unitPrice * pageCount * copyCount;

  let finishingFee = 0;
  switch (finishing) {
    case 'STAPLER':
      finishingFee = pricing.finishing_stapler * copyCount;
      break;
    case 'LAKBAN':
      finishingFee = pricing.finishing_lakban * copyCount;
      break;
    case 'SPIRAL':
      finishingFee = pricing.finishing_spiral * copyCount;
      break;
    case 'LAMINATING':
      finishingFee = pricing.finishing_laminating * pageCount * copyCount;
      break;
    case 'NONE':
    default:
      finishingFee = 0;
      break;
  }

  const grandTotal = Math.max(0, subtotal + finishingFee + customAdjustment);

  return {
    unitPrice,
    subtotal,
    finishingFee,
    grandTotal,
  };
};

export const ADMIN_WA_NUMBER = '6285748894171';
export const QRIS_IMAGE_URL = 'https://i.ibb.co.com/rGNm2pcL/qr-ID1024366407566-02-08-25-175412960-1754129607749.jpg';

export const generateWATemplateUrl = (order: {
  id: string;
  customerName: string;
  whatsapp: string;
  email?: string;
  grandTotal: number;
}) => {
  const text = `Halo Admin Revina Print,

Saya ingin konfirmasi pembayaran pesanan cetak:
- Nama: ${order.customerName}
- No. Order / ID: #${order.id}
- WA / Email: ${order.whatsapp}${order.email ? ' / ' + order.email : ''}
- Total Bayar: ${formatRupiah(order.grandTotal)}

Berikut saya lampirkan bukti transfer / screenshot pembayaran QRIS. Mohon untuk diverifikasi dan di-ACC. Terima kasih!`;

  return `https://wa.me/${ADMIN_WA_NUMBER}?text=${encodeURIComponent(text)}`;
};

export const BANK_ACCOUNTS = [
  { bank: 'BCA', accountNumber: '7820198822', accountName: 'Revina Printing Press' },
  { bank: 'Mandiri', accountNumber: '1370019283711', accountName: 'Revina Printing Press' },
  { bank: 'BRI', accountNumber: '012901002381304', accountName: 'Revina Printing Press' },
];
