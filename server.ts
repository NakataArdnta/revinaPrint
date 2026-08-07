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

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// ==========================================
// 1. KONEKSI MONGODB ATLAS
// ==========================================
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
// 2. DATA IN-MEMORY (Fallback Sementara)
// ==========================================
let pricingConfig: PricingConfig = { ...DEFAULT_PRICING };
let orders: OrderItem[] = [];
let notifications: NotificationItem[] = [];
let auditLogs: AuditLogItem[] = [];

// ==========================================
// 3. PENGATURAN EMAIL (NODEMAILER)
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

// ==========================================
// 4. API ROUTES (GENERAL & ORDERS)
// ==========================================
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "Revina Print API", timestamp: new Date().toISOString() });
});

app.get("/api/config/pricing", (_req, res) => {
  res.json(pricingConfig);
});

// Create new order (Menyimpan ke MongoDB)
app.post("/api/orders", async (req, res) => {
  try {
    const { customerName, whatsapp, email, files, paperType, colorMode, pageCount, copyCount, printMode, orientation, finishing, additionalNotes } = req.body;
    if (!customerName || !whatsapp || !paperType || !colorMode || !pageCount || !copyCount) {
      return res.status(400).json({ error: "Data pemesanan tidak lengkap" });
    }

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

// Update order status
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
// 5. API ROUTES (AUTENTIKASI)
// ==========================================

// Register
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
      token: "jwt-customer-token-" + newUser.id,
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

// Login (Sudah diperbaiki jadi format Backend)
app.post("/api/auth/login", async (req, res) => {
  try {
    const { inputAccount, password, role } = req.body;
    
    if (!inputAccount || !password) {
      return res.status(400).json({ error: "Harap masukkan identitas akun dan password" });
    }

    const lowerInput = inputAccount.trim().toLowerCase();

    // Logika Admin
    if (lowerInput === "revina" || lowerInput === "admin" || role === "ADMIN" || role === "SUPER_ADMIN") {
      if (password !== "admin") {
        return res.status(401).json({ error: "Password admin salah" });
      }
      return res.json({
        token: "jwt-admin-token-secret-revina",
        user: { 
          id: "usr-admin-revina", 
          username: lowerInput, 
          name: "Revina Admin", 
          email: "admin@revinaprint.com", 
          role: "SUPER_ADMIN" 
        },
      });
    }

    // Logika Customer (Cek ke MongoDB)
    const user = await UserModel.findOne({ $or: [{ username: lowerInput }, { email: lowerInput }] });

    if (!user) {
      return res.status(401).json({ error: "Akun tidak ditemukan. Silakan daftar terlebih dahulu." });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: "Password salah." });
    }

    return res.json({
      token: "jwt-customer-token-" + user.id,
      user: { 
        id: user.id, 
        username: user.username, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Terjadi kesalahan pada server saat login" });
  }
});

// Forgot Password
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

// Reset Password
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
// 6. SERVE FRONTEND (VITE & STATIC)
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
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Revina Print running on http://0.0.0.0:${PORT}`);
  });
}

// Menjalankan server jika bukan dipanggil Vercel Serverless
if (process.env.VERCEL !== "1") {
  startServer();
}

export default app;
