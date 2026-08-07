export type PaperType = 'A4' | 'F4';
export type ColorMode = 'BW' | 'COLOR';
export type PrintMode = 'SINGLE' | 'DOUBLE';
export type Orientation = 'PORTRAIT' | 'LANDSCAPE';
export type FinishingType = 'NONE' | 'STAPLER' | 'LAKBAN' | 'SPIRAL' | 'LAMINATING';

export type OrderStatus =
  | 'MENUNGGU_PERSETUJUAN'
  | 'MENUNGGU_PEMBAYARAN'
  | 'SEDANG_DICETAK'
  | 'SIAP_DIAMBIL'
  | 'SEDANG_DIANTAR'
  | 'SELESAI'
  | 'DITOLAK';

export type PaymentStatus = 'UNPAID' | 'PENDING_VERIFICATION' | 'VERIFIED' | 'REJECTED';
export type PaymentMethod = 'QRIS' | 'BANK_TRANSFER' | 'CASH';

export type UserRole = 'CUSTOMER' | 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR';

export interface FileItem {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string; // For previews if small image or mock pdf
  pageCountEstimate?: number;
}

export interface StatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: string;
}

export interface OrderItem {
  id: string; // e.g., RVP-20260806-0001
  createdAt: string;
  customerName: string;
  whatsapp: string;
  email?: string;
  files: FileItem[];
  paperType: PaperType;
  colorMode: ColorMode;
  pageCount: number;
  copyCount: number;
  printMode: PrintMode;
  orientation: Orientation;
  finishing: FinishingType;
  additionalNotes?: string;
  unitPrice: number;
  subtotal: number;
  finishingFee: number;
  customFeeAdjustment: number; // Positive or negative
  customFeeNote?: string;
  grandTotal: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentProofUrl?: string;
  rejectionReason?: string;
  estimatedCompletion: string;
  statusHistory: StatusHistoryItem[];
}

export interface PricingConfig {
  a4_bw: number;
  a4_color: number;
  f4_bw: number;
  f4_color: number;
  finishing_stapler: number;
  finishing_lakban: number;
  finishing_spiral: number;
  finishing_laminating: number;
}

export interface NotificationItem {
  id: string;
  orderId: string;
  recipientWhatsapp: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER';
  createdAt: string;
  read: boolean;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  details: string;
}

export interface UserAccount {
  id: string;
  name: string;
  whatsapp: string;
  email: string;
  passwordHash?: string;
  role: UserRole;
  createdAt: string;
}
