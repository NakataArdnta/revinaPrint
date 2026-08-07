import express from "express";
import path from "path";
import fs from "fs";
import {
  OrderItem,
  PricingConfig,
  NotificationItem,
  AuditLogItem,
  OrderStatus,
  PaymentStatus,
} from "./src/types";
import { DEFAULT_PRICING, calculateOrderPrice } from "./src/lib/constants";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Enable CORS for Vercel and multi-domain access
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
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
  }
];

let auditLogs: AuditLogItem[] = [
  {
    id: "log-1",
    timestamp: new Date(Date.now() - 3600000 * 1.5).toISOString(),
    actorName: "Super Admin Revina",
    actorRole: "SUPER_ADMIN",
    action: "ACC_PESANAN",
    details: `Menyetujui pesanan RVP-${todayStr}-0001`,
  }
];

// Helper: Order ID Generator
function generateOrderId(): string {
  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const todayOrders = orders.filter((o) => o.id.includes(dateStr));
  const seq = (todayOrders.length + 1).toString().padStart(4, "0");
  return `RVP-${dateStr}-${seq}`;
}

// ==========================================
// API ROUTES
// ==========================================

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
  const { whatsapp, status, search } = req.query;

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

// Create new order (Guest Checkout)
app.post("/api/orders", (req, res) => {
  try {
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
    } = req.body || {};

    if (!customerName || !whatsapp || !paperType || !colorMode || !pageCount || !copyCount) {
      return res.status(400).json({ error: "Data pemesanan tidak lengkap. Mohon isi Nama Pemesan, Jenis Kertas, dan Jumlah Lembar." });
    }

    const calculation = calculateOrderPrice(
      paperType,
      colorMode,
      Number(pageCount),
      Number(copyCount),
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
      additionalNotes: additionalNotes || "",
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

    auditLogs.unshift({
      id: "log-" + Date.now(),
      timestamp: now,
      actorName: customerName,
      actorRole: "CUSTOMER",
      action: "BUAT_PESANAN",
      details: `Membuat pesanan baru ${orderId}`,
    });

    return res.status(201).json({ success: true, order: newOrder });
  } catch (err: any) {
    console.error("Error creating order:", err);
    return res.status(500).json({ error: "Terjadi kesalahan server saat memproses pesanan." });
  }
});

// Update order status
app.patch("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, note, rejectionReason, updatedBy, estimatedCompletion } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });

  const now = new Date().toISOString();
  order.status = status as OrderStatus;

  if (estimatedCompletion) order.estimatedCompletion = estimatedCompletion;
  if (status === "DITOLAK") order.rejectionReason = rejectionReason || "Dokumen tidak memenuhi syarat cetak.";

  order.statusHistory.unshift({
    status: status as OrderStatus,
    timestamp: now,
    note: note || `Status diubah ke ${status}`,
    updatedBy: updatedBy || "Admin",
  });

  res.json({ success: true, order });
});

// Fee Adjustment
app.patch("/api/orders/:id/fee", (req, res) => {
  const { id } = req.params;
  const { customFeeAdjustment, customFeeNote, updatedBy } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });

  order.customFeeAdjustment = Number(customFeeAdjustment) || 0;
  order.customFeeNote = customFeeNote || undefined;
  order.grandTotal = Math.max(0, order.subtotal + order.finishingFee + order.customFeeAdjustment);

  res.json({ success: true, order });
});

// Upload Payment Proof
app.post("/api/orders/:id/payment", (req, res) => {
  const { id } = req.params;
  const { paymentMethod, paymentProofUrl } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });

  order.paymentMethod = paymentMethod;
  order.paymentProofUrl = paymentProofUrl;
  order.paymentStatus = "PENDING_VERIFICATION";

  res.json({ success: true, order });
});

// Verify/Reject Payment
app.patch("/api/orders/:id/verify-payment", (req, res) => {
  const { id } = req.params;
  const { action, note, updatedBy } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });

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
  } else {
    order.paymentStatus = "REJECTED";
  }

  res.json({ success: true, order });
});

// Delete single order
app.delete("/api/orders/:id", (req, res) => {
  const { id } = req.params;
  const index = orders.findIndex((o) => o.id === id);
  if (index === -1) return res.status(404).json({ error: "Pesanan tidak ditemukan" });
  orders.splice(index, 1);
  res.json({ success: true, deletedId: id });
});

// Clear orders history
app.delete("/api/orders", (req, res) => {
  const { whatsapp, status } = req.query;
  let removedCount = 0;

  if (whatsapp) {
    const waClean = String(whatsapp).replace(/\D/g, "");
    orders = orders.filter((o) => {
      const match = o.whatsapp.replace(/\D/g, "") === waClean;
      if (match && (!status || o.status === status)) {
        removedCount++;
        return false;
      }
      return true;
    });
  } else {
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
    result = result.filter((n) => n.recipientWhatsapp.replace(/\D/g, "") === String(whatsapp).replace(/\D/g, ""));
  }
  res.json(result);
});

app.patch("/api/notifications/:id/read", (req, res) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) notif.read = true;
  res.json({ success: true });
});

// Admin Analytics & Reports API
app.get("/api/reports", (_req, res) => {
  res.json({
    totalOrders: orders.length,
    completedOrders: orders.filter((o) => o.status === "SELESAI").length,
    processingOrders: orders.filter((o) => ["MENUNGGU_PERSETUJUAN", "MENUNGGU_PEMBAYARAN", "SEDANG_DICETAK"].includes(o.status)).length,
    totalRevenue: orders.filter((o) => o.paymentStatus === "VERIFIED").reduce((sum, o) => sum + o.grandTotal, 0),
  });
});

// Audit logs
app.get("/api/audit-logs", (_req, res) => {
  res.json(auditLogs);
});

// Admin password verification endpoint (Satu-satunya gerbang keamanan untuk Admin)
app.post("/api/admin/verify", (req, res) => {
  const { password } = req.body;
  if (password === "revinanakata") {
    return res.json({ success: true, message: "Akses Admin Diterima" });
  }
  return res.status(401).json({ success: false, error: "Sandi Admin salah." });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Terjadi kesalahan internal pada server." });
});

// Serve frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
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
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Revina Print running on http://0.0.0.0:${PORT}`);
  });
}

if (process.env.VERCEL !== "1" && process.env.NODE_ENV !== "production") {
  startServer();
}

export default app;