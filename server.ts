import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import {
  OrderItem,
  PricingConfig,
  NotificationItem,
  AuditLogItem,
  OrderStatus,
  PaymentStatus,
} from "./src/types";
import { DEFAULT_PRICING, calculateOrderPrice } from "./src/lib/constants";
import {
  connectToDatabase,
  User,
  Order,
  Pricing,
  Notification,
  AuditLog,
} from "./src/models/db";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// Connect to MongoDB Atlas
app.use(async (_req, _res, next) => {
  try {
    await connectToDatabase();
  } catch (err) {
    console.warn("DB Connection deferred:", err);
  }
  next();
});

// Local Data Store in memory with initial sample data
let pricingConfig: PricingConfig = { ...DEFAULT_PRICING };

const todayStr = new Date().toISOString().split("T")[0].replace(/-/g, "");

let orders: OrderItem[] = [
  {
    id: `RVP-${todayStr}-0001`,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: "Budi Santoso",
    whatsapp: "081234567890",
    email: "budi@gmail.com",
    files: [
      { id: "f-1", name: "Laporan_Keuangan_Q3.pdf", size: 2450000, type: "application/pdf", pageCountEstimate: 12 },
    ],
    paperType: "A4",
    colorMode: "COLOR",
    pageCount: 12,
    copyCount: 2,
    printMode: "SINGLE",
    orientation: "PORTRAIT",
    finishing: "SPIRAL",
    additionalNotes: "Mohon cover depan diberi mika bening.",
    unitPrice: 2000,
    subtotal: 48000,
    finishingFee: 16000,
    customFeeAdjustment: 0,
    grandTotal: 64000,
    status: "SEDANG_DICETAK",
    paymentStatus: "VERIFIED",
    paymentMethod: "QRIS",
    paymentProofUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&auto=format&fit=crop&q=60",
    estimatedCompletion: "Hari Ini, 15:00 WIB",
    statusHistory: [
      { status: "MENUNGGU_PERSETUJUAN", timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), note: "Pesanan masuk" },
      { status: "MENUNGGU_PEMBAYARAN", timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(), note: "Pesanan di-ACC Admin" },
      { status: "SEDANG_DICETAK", timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(), note: "Pembayaran terverifikasi" },
    ],
  },
  {
    id: `RVP-${todayStr}-0002`,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customerName: "Siti Rahmawati",
    whatsapp: "089876543210",
    email: "siti.rahma@yahoo.com",
    files: [
      { id: "f-2", name: "Skripsi_Final_Bab1-5.docx", size: 4200000, type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", pageCountEstimate: 85 },
    ],
    paperType: "F4",
    colorMode: "BW",
    pageCount: 85,
    copyCount: 1,
    printMode: "DOUBLE",
    orientation: "PORTRAIT",
    finishing: "LAKBAN",
    additionalNotes: "Cetak bolak balik rapi untuk jilid skripsi.",
    unitPrice: 700,
    subtotal: 59500,
    finishingFee: 3000,
    customFeeAdjustment: 0,
    grandTotal: 62500,
    status: "SIAP_DIAMBIL",
    paymentStatus: "VERIFIED",
    paymentMethod: "BANK_TRANSFER",
    paymentProofUrl: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60",
    estimatedCompletion: "Hari Ini, 12:00 WIB",
    statusHistory: [
      { status: "MENUNGGU_PERSETUJUAN", timestamp: new Date(Date.now() - 3600000 * 5).toISOString() },
      { status: "MENUNGGU_PEMBAYARAN", timestamp: new Date(Date.now() - 3600000 * 4).toISOString() },
      { status: "SEDANG_DICETAK", timestamp: new Date(Date.now() - 3600000 * 3).toISOString() },
      { status: "SIAP_DIAMBIL", timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), note: "Sudah selesai diprint & dijilid" },
    ],
  },
  {
    id: `RVP-${todayStr}-0003`,
    createdAt: new Date(Date.now() - 3600000 * 0.8).toISOString(),
    customerName: "Ahmad Dani",
    whatsapp: "085711223344",
    email: "ahmad.dani@gmail.com",
    files: [
      { id: "f-3", name: "Brosur_Promosi_Event.png", size: 1800000, type: "image/png", pageCountEstimate: 5 },
    ],
    paperType: "A4",
    colorMode: "COLOR",
    pageCount: 5,
    copyCount: 10,
    printMode: "SINGLE",
    orientation: "LANDSCAPE",
    finishing: "NONE",
    additionalNotes: "Warna tajam, bahan hvs tebal.",
    unitPrice: 2000,
    subtotal: 100000,
    finishingFee: 0,
    customFeeAdjustment: 0,
    grandTotal: 100000,
    status: "MENUNGGU_PERSETUJUAN",
    paymentStatus: "UNPAID",
    estimatedCompletion: "Akan dikonfirmasi setelah ACC",
    statusHistory: [
      { status: "MENUNGGU_PERSETUJUAN", timestamp: new Date(Date.now() - 3600000 * 0.8).toISOString(), note: "Pesanan baru dikirim customer" },
    ],
  },
];

let notifications: NotificationItem[] = [
  {
    id: "notif-1",
    orderId: `RVP-${todayStr}-0001`,
    recipientWhatsapp: "081234567890",
    title: "Pesanan Sedang Dicetak",
    message: "Pesanan #RVP-" + todayStr + "-0001 telah terverifikasi dan saat ini sedang dalam proses percetakan.",
    type: "INFO",
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    read: false,
  },
  {
    id: "notif-2",
    orderId: `RVP-${todayStr}-0002`,
    recipientWhatsapp: "089876543210",
    title: "Pesanan Siap Diambil!",
    message: "Pesanan #RVP-" + todayStr + "-0002 sudah selesai dicetak & dijilid. Anda dapat mengambilnya di toko.",
    type: "SUCCESS",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    read: true,
  },
];

let auditLogs: AuditLogItem[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    actorName: "Super Admin Revina",
    actorRole: "SUPER_ADMIN",
    action: "ACC_PESANAN",
    details: `Menyetujui pesanan RVP-${todayStr}-0001`,
  },
  {
    id: "log-2",
    timestamp: new Date(Date.now() - 3600000 * 0.5).toISOString(),
    actorName: "Kasir Revina",
    actorRole: "ADMIN",
    action: "VERIFIKASI_PEMBAYARAN",
    details: `Verifikasi pembayaran QRIS RVP-${todayStr}-0001 senilai Rp64.000`,
  },
];

let users: UserAccount[] = [
  {
    id: "usr-admin-revina",
    name: "Revina Admin",
    whatsapp: "Revina",
    email: "admin@revinaprint.com",
    role: "SUPER_ADMIN",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-admin",
    name: "Admin Utama Revina",
    whatsapp: "081122334455",
    email: "admin@revinaprint.com",
    role: "SUPER_ADMIN",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-operator",
    name: "Operator Percetakan",
    whatsapp: "081122334466",
    email: "operator@revinaprint.com",
    role: "OPERATOR",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
  {
    id: "usr-cust1",
    name: "Budi Santoso",
    whatsapp: "081234567890",
    email: "budi@gmail.com",
    role: "CUSTOMER",
    createdAt: "2026-02-01T00:00:00.000Z",
  },
];

// Helper: Order ID Generator
function generateOrderId(): string {
// ==========================================
// 1. KONEKSI MONGODB ATLAS
// ==========================================
// Buat database di MongoDB Atlas (gratis), lalu masukkan URI-nya ke Environment Variable Vercel (MAMPUKAN MONGODB_URI)
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://nakatatardinata_db_user:2szheVYocn2cbtaT@cluster.mongodb.net/revina_print?retryWrites=true&w=majority";

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Berhasil terhubung ke MongoDB Atlas"))
  .catch((err) => console.error("❌ Gagal terhubung ke MongoDB:", err));

// Definisi Skema Mongoose
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "CUSTOMER" },
  createdAt: { type: String, required: true }
});

const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  createdAt: { type: String, required: true },
  customerName: String,
  whatsapp: String,
  email: String,
  files: Array,
  paperType: String,
  colorMode: String,
  pageCount: Number,
  copyCount: Number,
  printMode: String,
  orientation: String,
  finishing: String,
  additionalNotes: String,
  unitPrice: Number,
  subtotal: Number,
  finishingFee: Number,
  customFeeAdjustment: Number,
  grandTotal: Number,
  status: String,
  paymentStatus: String,
  estimatedCompletion: String,
  statusHistory: Array,
  rejectionReason: String
});

const configSchema = new mongoose.Schema({
  key: { type: String, default: "main_config" },
  pricingConfig: Object,
  notifications: Array,
  auditLogs: Array
});

const UserModel = mongoose.model("User", userSchema);
const OrderModel = mongoose.model("Order", orderSchema);
const ConfigModel = mongoose.model("Config", configSchema);

let otpStore: Record<string, { code: string; expires: number }> = {}; 

// ==========================================
// 2. PENGATURAN EMAIL (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "EMAIL_KAMU@gmail.com", 
    pass: "PASSWORD_APP_KAMU",    
  },
});

function generateOrderId(orderCount: number): string {
  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const seq = (orderCount + 1).toString().padStart(4, "0");
  return `RVP-${dateStr}-${seq}`;
}

// API ROUTES
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "Revina Print API", timestamp: new Date().toISOString() });
});

// Pricing config
app.get("/api/config/pricing", (_req, res) => {
  res.json(pricingConfig);
});

app.put("/api/config/pricing", (req, res) => {
  const newConfig = req.body as Partial<PricingConfig>;
  pricingConfig = { ...pricingConfig, ...newConfig };

  auditLogs.unshift({
    id: "log-" + Date.now(),
    timestamp: new Date().toISOString(),
    actorName: req.body.updatedBy || "Admin",
    actorRole: "SUPER_ADMIN",
    action: "UPDATE_PENGATURAN_HARGA",
    details: "Mengubah konfigurasi tarif cetak & finishing.",
  });

  res.json({ success: true, config: pricingConfig });
});

// Get orders with filters
app.get("/api/orders", (req, res) => {
  const { whatsapp, status, search, dateRange } = req.query;

  let result = [...orders];

  if (whatsapp) {
    result = result.filter((o) => o.whatsapp === String(whatsapp) || o.whatsapp.replace(/\D/g, "") === String(whatsapp).replace(/\D/g, ""));
  }

  if (status && status !== "ALL") {
    result = result.filter((o) => o.status === status);
  }

  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.whatsapp.includes(q) ||
        o.files.some((f) => f.name.toLowerCase().includes(q))
    );
  }

  // Sort newest first
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json(result);
});

// Get order details by ID
app.get("/api/orders/:id", (req, res) => {
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }
  res.json(order);
});

// Create new order
app.post("/api/orders", (req, res) => {
  const {
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
  } = req.body;

  if (!customerName || !whatsapp || !paperType || !colorMode || !pageCount || !copyCount) {
    return res.status(400).json({ error: "Data pemesanan tidak lengkap" });
  }

  const calculation = calculateOrderPrice(
    paperType,
    colorMode,
    pageCount,
    copyCount,
    finishing || "NONE",
    pricingConfig
  );

  const orderId = generateOrderId();
  const now = new Date().toISOString();

  const newOrder: OrderItem = {
    id: orderId,
    createdAt: now,
    customerName,
    whatsapp,
    email: email || undefined,
    files: files || [],
    paperType,
    colorMode,
    pageCount: Number(pageCount),
    copyCount: Number(copyCount),
    printMode: printMode || "SINGLE",
    orientation: orientation || "PORTRAIT",
    finishing: finishing || "NONE",
    additionalNotes,
    unitPrice: calculation.unitPrice,
    subtotal: calculation.subtotal,
    finishingFee: calculation.finishingFee,
    customFeeAdjustment: 0,
    grandTotal: calculation.grandTotal,
    status: "MENUNGGU_PERSETUJUAN",
    paymentStatus: "UNPAID",
    estimatedCompletion: "Akan dikonfirmasi oleh Admin",
    statusHistory: [
      {
        status: "MENUNGGU_PERSETUJUAN",
        timestamp: now,
        note: "Pesanan berhasil dikirim ke sistem Revina Print.",
      },
    ],
  };

  orders.unshift(newOrder);

  // Notification for customer
  notifications.unshift({
    id: "notif-" + Date.now(),
    orderId,
    recipientWhatsapp: whatsapp,
    title: "Pesanan Terkirim",
    message: `Pesanan #${orderId} telah kami terima. Mohon tunggu persetujuan dari Admin.`,
    type: "INFO",
    createdAt: now,
    read: false,
  });

  // Audit log
  auditLogs.unshift({
    id: "log-" + Date.now(),
    timestamp: now,
    actorName: customerName,
    actorRole: "CUSTOMER",
    action: "BUAT_PESANAN",
    details: `Membuat pesanan baru ${orderId} (${paperType} ${colorMode}, ${pageCount} lembar x ${copyCount} copy)`,
  });

  res.status(201).json({ success: true, order: newOrder });
});

// Update order status (ACC, Tolak, Progress update)
app.patch("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, note, rejectionReason, updatedBy, estimatedCompletion } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }

  const now = new Date().toISOString();
  order.status = status as OrderStatus;

  if (estimatedCompletion) {
    order.estimatedCompletion = estimatedCompletion;
  }

  if (status === "DITOLAK") {
    order.rejectionReason = rejectionReason || "Dokumen tidak memenuhi syarat cetak.";
  }

  order.statusHistory.unshift({
    status: status as OrderStatus,
    timestamp: now,
    note: note || (status === "DITOLAK" ? rejectionReason : `Status diubah ke ${status}`),
    updatedBy: updatedBy || "Admin",
  });

  // Add Notification
  let notifType: "INFO" | "SUCCESS" | "WARNING" | "DANGER" = "INFO";
  let title = `Pembaruan Pesanan #${id}`;
  let message = `Status pesanan Anda kini: ${status}`;

  if (status === "MENUNGGU_PEMBAYARAN") {
    notifType = "SUCCESS";
    title = "Pesanan Disetujui (ACC)";
    message = `Pesanan #${id} telah di-ACC. Silakan upload bukti pembayaran di halaman status.`;
  } else if (status === "DITOLAK") {
    notifType = "DANGER";
    title = "Pesanan Ditolak";
    message = `Pesanan #${id} ditolak dengan alasan: ${order.rejectionReason}`;
  } else if (status === "SEDANG_DICETAK") {
    notifType = "INFO";
    title = "Sedang Dicetak";
    message = `Dokumen pesanan #${id} sedang dalam proses cetak & finishing. Est. selesai: ${order.estimatedCompletion}`;
  } else if (status === "SIAP_DIAMBIL") {
    notifType = "SUCCESS";
    title = "Siap Diambil!";
    message = `Pesanan #${id} telah selesai dicetak dan siap diambil di toko.`;
  } else if (status === "SELESAI") {
    notifType = "SUCCESS";
    title = "Pesanan Selesai";
    message = `Terima kasih! Pesanan #${id} telah diselesaikan.`;
  }

  notifications.unshift({
    id: "notif-" + Date.now(),
    orderId: id,
    recipientWhatsapp: order.whatsapp,
    title,
    message,
    type: notifType,
    createdAt: now,
    read: false,
  });

  // Audit log
  auditLogs.unshift({
    id: "log-" + Date.now(),
    timestamp: now,
    actorName: updatedBy || "Admin",
    actorRole: "ADMIN",
    action: "UBAH_STATUS_PESANAN",
    details: `Ubah status ${id} menjadi ${status}`,
  });

  res.json({ success: true, order });
});

// Fee Adjustment
app.patch("/api/orders/:id/fee", (req, res) => {
  const { id } = req.params;
  const { customFeeAdjustment, customFeeNote, updatedBy } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }

  order.customFeeAdjustment = Number(customFeeAdjustment) || 0;
  order.customFeeNote = customFeeNote || undefined;
  order.grandTotal = Math.max(0, order.subtotal + order.finishingFee + order.customFeeAdjustment);

  auditLogs.unshift({
    id: "log-" + Date.now(),
    timestamp: new Date().toISOString(),
    actorName: updatedBy || "Admin",
    actorRole: "ADMIN",
    action: "PENYESUAIAN_BIAYA",
    details: `Penyesuaian biaya pesanan ${id}: Rp${order.customFeeAdjustment} (${customFeeNote || "Tanpa catatan"})`,
  });

  res.json({ success: true, order });
});

// Upload Payment Proof
app.post("/api/orders/:id/payment", (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paymentProofUrl } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }

  order.paymentMethod = paymentMethod;
  order.paymentProofUrl = paymentProofUrl || "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=500&auto=format&fit=crop&q=60";
  order.paymentStatus = "PENDING_VERIFICATION";

  notifications.unshift({
    id: "notif-" + Date.now(),
    orderId: id,
    recipientWhatsapp: order.whatsapp,
    title: "Bukti Pembayaran Diupload",
    message: `Bukti pembayaran untuk #${id} berhasil diupload. Admin akan memverifikasi secepatnya.`,
    type: "INFO",
    createdAt: new Date().toISOString(),
    read: false,
  });

  res.json({ success: true, order });
});

// Verify/Reject Payment
app.patch("/api/orders/:id/verify-payment", (req, res) => {
  const { id } = req.params;
  const { action, note, updatedBy } = req.body; // action: 'APPROVE' | 'REJECT'

  const order = orders.find((o) => o.id === id);
  if (!order) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }

  const now = new Date().toISOString();

  if (action === "APPROVE") {
    order.paymentStatus = "VERIFIED";
    order.status = "SEDANG_DICETAK";
    order.statusHistory.unshift({
      status: "SEDANG_DICETAK",
      timestamp: now,
      note: note || "Pembayaran diverifikasi oleh admin. Proses pencetakan dimulai.",
      updatedBy: updatedBy || "Admin",
    });

    notifications.unshift({
      id: "notif-" + Date.now(),
      orderId: id,
      recipientWhatsapp: order.whatsapp,
      title: "Pembayaran Terverifikasi!",
      message: `Pembayaran pesanan #${id} telah diverifikasi. Dokumen Anda sedang dicetak.`,
      type: "SUCCESS",
      createdAt: now,
      read: false,
    });
  } else {
    order.paymentStatus = "REJECTED";
    notifications.unshift({
      id: "notif-" + Date.now(),
      orderId: id,
      recipientWhatsapp: order.whatsapp,
      title: "Pembayaran Ditolak",
      message: `Bukti pembayaran pesanan #${id} tidak valid. Catatan: ${note || "Silakan re-upload bukti transfer yang jelas."}`,
      type: "DANGER",
      createdAt: now,
      read: false,
    });
  }

  auditLogs.unshift({
    id: "log-" + Date.now(),
    timestamp: now,
    actorName: updatedBy || "Admin",
    actorRole: "ADMIN",
    action: action === "APPROVE" ? "VERIFIKASI_PEMBAYARAN_ACC" : "VERIFIKASI_PEMBAYARAN_TOLAK",
    details: `${action === "APPROVE" ? "Verifikasi ACC" : "Verifikasi Tolak"} pembayaran pesanan ${id}`,
  });

  res.json({ success: true, order });
});

// Delete single order
app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  }
  const deleted = orders.splice(index, 1)[0];
  auditLogs.unshift({
    id: "log-" + Date.now(),
    timestamp: new Date().toISOString(),
    actorName: "Admin/System",
    actorRole: "ADMIN",
    action: "HAPUS_PESANAN",
    details: `Menghapus pesanan #${id} (${deleted.customerName})`,
  });
  res.json({ success: true, deletedId: id });
});

// Clear orders history (by whatsapp or status)
app.delete("/api/orders", (req, res) => {
  const { whatsapp, status } = req.query;
  let removedCount = 0;

  if (whatsapp) {
    const waClean = String(whatsapp).replace(/\D/g, "");
    orders = orders.filter((o) => {
      const match = o.whatsapp.replace(/\D/g, "") === waClean;
      if (status) {
        if (match && o.status === status) {
          removedCount++;
          return false;
        }
        return true;
      } else {
        if (match) {
          removedCount++;
          return false;
        }
        return true;
      }
    });
  } else if (status) {
    orders = orders.filter((o) => {
      if (o.status === status) {
        removedCount++;
        return false;
      }
      return true;
    });
  } else {
    // Clear all completed/cancelled orders
    orders = orders.filter((o) => {
      if (["SELESAI", "DIBATALKAN"].includes(o.status)) {
        removedCount++;
        return false;
      }
      return true;
    });
  }

  res.json({ success: true, removedCount });
});

// Notifications API
app.get("/api/notifications", (req, res) => {
  const { whatsapp } = req.query;
  let result = [...notifications];
  if (whatsapp) {
    result = result.filter((n) => n.recipientWhatsapp === String(whatsapp) || n.recipientWhatsapp.replace(/\D/g, "") === String(whatsapp).replace(/\D/g, ""));
  }
  res.json(result);
});

app.patch("/api/notifications/:id/read", (req, res) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
});

// Admin Analytics & Reports API
app.get("/api/reports", (_req, res) => {
  const totalOrders = orders.length;
  const completedOrders = orders.filter((o) => o.status === "SELESAI").length;
  const processingOrders = orders.filter((o) => ["MENUNGGU_PERSETUJUAN", "MENUNGGU_PEMBAYARAN", "SEDANG_DICETAK"].includes(o.status)).length;

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "VERIFIED")
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const todayDateStr = new Date().toISOString().split("T")[0];
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayDateStr)).length;

  // Revenue chart data (mock 7 days breakdown)
  const revenueChart = [
    { day: "Senin", total: 180000, count: 4 },
    { day: "Selasa", total: 240000, count: 6 },
    { day: "Rabu", total: 310000, count: 8 },
    { day: "Kamis", total: 290000, count: 7 },
    { day: "Jumat", total: 420000, count: 11 },
    { day: "Sabtu", total: 550000, count: 14 },
    { day: "Minggu", total: 380000, count: 9 },
  ];

  // Top paper types
  const paperStats = {
    A4_BW: orders.filter((o) => o.paperType === "A4" && o.colorMode === "BW").length,
    A4_COLOR: orders.filter((o) => o.paperType === "A4" && o.colorMode === "COLOR").length,
    F4_BW: orders.filter((o) => o.paperType === "F4" && o.colorMode === "BW").length,
    F4_COLOR: orders.filter((o) => o.paperType === "F4" && o.colorMode === "COLOR").length,
  };

  res.json({
    totalOrders,
    completedOrders,
    processingOrders,
    totalRevenue,
    todayOrders,
    revenueChart,
    paperStats,
  });
});

// Audit logs
app.get("/api/audit-logs", (_req, res) => {
  res.json(auditLogs);
});

// User Auth endpoints (MongoDB Atlas Integration)
app.post("/api/auth/login", async (req, res) => {
  const { account, email, whatsapp, password, role } = req.body;
  const inputAccount = (account || email || whatsapp || "").trim().toLowerCase();

  // Check for admin account (Revina / admin) or role ADMIN/SUPER_ADMIN
  if (
    inputAccount === "revina" ||
    inputAccount === "admin" ||
    inputAccount === "admin@revinaprint.com" ||
    role === "ADMIN" ||
    role === "SUPER_ADMIN"
  ) {
    if ((inputAccount === "revina" || inputAccount === "admin") && password && password !== "admin") {
      return res.status(401).json({ error: "Password admin salah" });
    }
    return res.json({
      token: "jwt-admin-token-secret-revina",
      user: {
        id: "usr-admin-revina",
        name: "Revina Admin",
        whatsapp: "Revina",
        email: "admin@revinaprint.com",
        role: "SUPER_ADMIN",
      },
    }
app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, whatsapp, email, files, paperType, colorMode, pageCount, copyCount, printMode, orientation, finishing, additionalNotes } = req.body;
    if (!customerName || !whatsapp || !paperType || !colorMode || !pageCount || !copyCount) {
      return res.status(400).json({ error: "Data pemesanan tidak lengkap" });
    }

    // Ambil konfigurasi harga dari database (atau default)
    let configData = await ConfigModel.findOne({ key: "main_config" });
    const currentPricing = configData?.pricingConfig || DEFAULT_PRICING;

    const calculation = calculateOrderPrice(paperType, colorMode, pageCount, copyCount, finishing || "NONE", currentPricing);
    
    const totalOrders = await OrderModel.countDocuments();
    const orderId = generateOrderId(totalOrders);
    const now = new Date().toISOString();

    const newOrder = new OrderModel({
      id: orderId, createdAt: now, customerName, whatsapp, email, files: files || [], paperType, colorMode, pageCount: Number(pageCount), copyCount: Number(copyCount), printMode: printMode || "SINGLE", orientation: orientation || "PORTRAIT", finishing: finishing || "NONE", additionalNotes, unitPrice: calculation.unitPrice, subtotal: calculation.subtotal, finishingFee: calculation.finishingFee, customFeeAdjustment: 0, grandTotal: calculation.grandTotal, status: "MENUNGGU_PERSETUJUAN", paymentStatus: "UNPAID", estimatedCompletion: "Akan dikonfirmasi oleh Admin",
      statusHistory: [{ status: "MENUNGGU_PERSETUJUAN", timestamp: now, note: "Pesanan berhasil dikirim ke sistem." }],
    });

    await newOrder.save();
    res.status(201).json({ success: true, order: newOrder });
  } catch (err) {
    res.status(500).json({ error: "Gagal menyimpan pesanan ke database" });
  }
});

  // Customer login from MongoDB Atlas
  try {
    const foundUser = await User.findOne({
      $or: [
        { email: inputAccount },
        { whatsapp: inputAccount },
      ],
    } as any);

    if (foundUser) {
      if (foundUser.password && password && foundUser.password !== password) {
        return res.status(401).json({ error: "Password yang Anda masukkan salah" });
      }

      const userObj: UserAccount = {
        id: foundUser._id.toString(),
        name: foundUser.name,
        email: foundUser.email,
        whatsapp: foundUser.whatsapp || "",
        role: (foundUser.role as any) || "CUSTOMER",
        createdAt: foundUser.createdAt ? foundUser.createdAt.toISOString() : new Date().toISOString(),
      };

      return res.json({
        token: "jwt-customer-token-" + foundUser._id,
        user: userObj,
      });
    }
  } catch (err) {
    console.warn("MongoDB auth lookup error:", err);
  }

  // In-memory fallback
  const user = users.find((u) => u.whatsapp === inputAccount || u.email.toLowerCase() === inputAccount) || {
    id: "usr-" + Date.now(),
    name: inputAccount.includes("@") ? inputAccount.split("@")[0] : "Pelanggan Revina",
    whatsapp: inputAccount.startsWith("08") ? inputAccount : "08123456789",
    email: inputAccount.includes("@") ? inputAccount : "customer@gmail.com",
    role: "CUSTOMER" as const,
    createdAt: new Date().toISOString(),
  };

  res.json({
    token: "jwt-customer-token-" + Date.now(),
    user,
  });
});

app.post("/api/auth/register", async (req, res) => {
  const { name, email, password, whatsapp } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Nama, email, dan password wajib diisi untuk mendaftar" });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const existingUser = await User.findOne({ email: cleanEmail } as any);
    if (existingUser) {
      return res.status(400).json({ error: "Email sudah terdaftar. Silakan masuk menggunakan password Anda." });
    }

    const newUser = await User.create({
      name,
      email: cleanEmail,
      password,
      whatsapp: whatsapp || "",
      role: "CUSTOMER",
    });

    const userObj: UserAccount = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      whatsapp: newUser.whatsapp || "",
      role: "CUSTOMER",
      createdAt: newUser.createdAt.toISOString(),
    };

    return res.status(201).json({
      success: true,
      token: "jwt-customer-token-" + newUser._id,
      user: userObj,
    });
  } catch (err: any) {
    console.error("Register DB error:", err);
    // In-memory fallback if DB unavailable
    const fallbackUser: UserAccount = {
      id: "usr-" + Date.now(),
      name,
      email: cleanEmail,
      whatsapp: whatsapp || "",
      role: "CUSTOMER",
      createdAt: new Date().toISOString(),
    };
    users.push(fallbackUser);

    return res.status(201).json({
      success: true,
      token: "jwt-customer-token-" + Date.now(),
      user: fallbackUser,
    });
  }
});

// Serve frontend with Vite in dev mode or static files in production
app.patch("/api/orders/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, rejectionReason, updatedBy, estimatedCompletion } = req.body;

    const order = await OrderModel.findOne({ id });
    if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });

    order.status = status as OrderStatus;
    if (estimatedCompletion) order.estimatedCompletion = estimatedCompletion;
    if (status === "DITOLAK") order.rejectionReason = rejectionReason || "Dokumen tidak memenuhi syarat cetak.";
    
    order.statusHistory.unshift({ status: status as OrderStatus, timestamp: new Date().toISOString(), note: note || `Status diubah ke ${status}`, updatedBy: updatedBy || "Admin" });
    
    await order.save();
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ error: "Gagal memperbarui status pesanan" });
  }
});

// ==========================================
// 4. ENDPOINT REGISTER
// ==========================================
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, Email, dan Password wajib diisi!" });
    }

    const existingUser = await UserModel.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ error: "Username atau Email sudah terdaftar." });
    }

    const newUser = new UserModel({
      id: "usr-" + Date.now(),
      username,
      name: username,
      email,
      password,
      role: "CUSTOMER",
      createdAt: new Date().toISOString(),
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registrasi berhasil",
      token: "jwt-customer-token-" + Date.now(),
      user: { 
        id: newUser.id, 
        username: newUser.username, 
        email: newUser.email, 
        role: newUser.role 
      },
    });
  } catch (err) {
    res.status(500).json({ error: "Terjadi kesalahan pada server saat registrasi" });
  }
});

// ==========================================
// 5. ENDPOINT LOGIN
// ==========================================
const login = async (
  identifier: string,
  password?: string,
  role: UserRole = "CUSTOMER"
): Promise<boolean> => {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputAccount: identifier.trim(),
        password: password?.trim(),
        role,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error(data);
      return false;
    }

    setUser(data.user);

    if (
      ["SUPER_ADMIN", "ADMIN", "OPERATOR"].includes(data.user.role)
    ) {
      setActiveRoleView("ADMIN");
      localStorage.setItem("revina_role_view", "ADMIN");
    } else {
      setActiveRoleView("CUSTOMER");
      localStorage.setItem("revina_role_view", "CUSTOMER");
    }

    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

// ==========================================
// 6. FITUR LUPA PASSWORD & OTP
// ==========================================
app.post("/api/auth/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;
    const user = await UserModel.findOne({ $or: [{ email: identifier }, { username: identifier }] });

    if (!user) {
      return res.status(404).json({ error: "Akun dengan Email/Username tersebut tidak ditemukan." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[user.id] = {
      code: otpCode,
      expires: Date.now() + 5 * 60 * 1000 
    };

    await transporter.sendMail({
      from: '"Revina Print" <EMAIL_KAMU@gmail.com>',
      to: user.email,
      subject: "Kode Verifikasi Reset Password - Revina Print",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Halo ${user.username},</h2>
          <p>Berikut adalah kode verifikasi OTP Anda:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="color: #d9534f;">Berlaku selama 5 menit.</p>
        </div>
      `
    });

    res.json({ success: true, message: `Kode OTP berhasil dikirim ke email ${user.email}` });
  } catch (err) {
    res.status(500).json({ error: "Gagal mengirim kode OTP." });
  }
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    const { identifier, otp, newPassword } = req.body;
    const user = await UserModel.findOne({ $or: [{ email: identifier }, { username: identifier }] });

    if (!user) return res.status(404).json({ error: "Akun tidak ditemukan." });

    const record = otpStore[user.id];
    if (!record || Date.now() > record.expires || record.code !== otp) {
      return res.status(400).json({ error: "Kode OTP salah atau sudah kadaluarsa." });
    }

    user.password = newPassword;
    delete otpStore[user.id];
    await user.save();

    res.json({ success: true, message: "Password berhasil diubah." });
  } catch (err) {
    res.status(500).json({ error: "Gagal mereset password." });
  }
});

// ==========================================
// 7. SERVE FRONTEND (VITE & STATIC)
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Revina Print running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
=======
startServer();
