import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer"; 
import {
  OrderItem,
  PricingConfig,
  NotificationItem,
  AuditLogItem,
  UserAccount,
  OrderStatus,
  PaymentStatus,
} from "./src/types";
import { DEFAULT_PRICING, calculateOrderPrice } from "./src/lib/constants";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));

// ==========================================
// 1. SISTEM DATABASE PERSISTEN (JSON)
// ==========================================
const DB_FILE = path.join(process.cwd(), "database.json");

let pricingConfig: PricingConfig = { ...DEFAULT_PRICING };
let orders: OrderItem[] = [];
let notifications: NotificationItem[] = [];
let auditLogs: AuditLogItem[] = [];
// Menggunakan 'any' sementara untuk fleksibilitas struktur baru, 
// disarankan untuk memperbarui tipe UserAccount di ./src/types.ts
let users: any[] = []; 
let otpStore: Record<string, { code: string; expires: number }> = {}; 

function loadDB() {
  if (fs.existsSync(DB_FILE)) {
    const rawData = fs.readFileSync(DB_FILE, "utf-8");
    const data = JSON.parse(rawData);
    pricingConfig = data.pricingConfig || { ...DEFAULT_PRICING };
    orders = data.orders || [];
    notifications = data.notifications || [];
    auditLogs = data.auditLogs || [];
    users = data.users || [];
    console.log("✅ Database berhasil dimuat dari database.json");
  } else {
    console.log("⚠️ File database.json tidak ditemukan, membuat database baru saat menyimpan...");
  }
}

function saveDB() {
  const data = { pricingConfig, orders, notifications, auditLogs, users };
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
}

loadDB();

// ==========================================
// 2. PENGATURAN EMAIL SUNGGUHAN (NODEMAILER)
// ==========================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "EMAIL_KAMU@gmail.com", // GANTI dengan email gmail kamu
    pass: "PASSWORD_APP_KAMU",    // GANTI dengan App Password Google kamu
  },
});

function generateOrderId(): string {
  const dateStr = new Date().toISOString().split("T")[0].replace(/-/g, "");
  const todayOrders = orders.filter((o) => o.id.includes(dateStr));
  const seq = (todayOrders.length + 1).toString().padStart(4, "0");
  return `RVP-${dateStr}-${seq}`;
}

// ==========================================
// 3. API ROUTES (PESANAN & HEALTH)
// ==========================================
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", appName: "Revina Print API", timestamp: new Date().toISOString() });
});

app.post("/api/orders", (req, res) => {
  const { customerName, whatsapp, email, files, paperType, colorMode, pageCount, copyCount, printMode, orientation, finishing, additionalNotes } = req.body;
  if (!customerName || !whatsapp || !paperType || !colorMode || !pageCount || !copyCount) {
    return res.status(400).json({ error: "Data pemesanan tidak lengkap" });
  }

  const calculation = calculateOrderPrice(paperType, colorMode, pageCount, copyCount, finishing || "NONE", pricingConfig);
  const orderId = generateOrderId();
  const now = new Date().toISOString();

  const newOrder: OrderItem = {
    id: orderId, createdAt: now, customerName, whatsapp, email, files: files || [], paperType, colorMode, pageCount: Number(pageCount), copyCount: Number(copyCount), printMode: printMode || "SINGLE", orientation: orientation || "PORTRAIT", finishing: finishing || "NONE", additionalNotes, unitPrice: calculation.unitPrice, subtotal: calculation.subtotal, finishingFee: calculation.finishingFee, customFeeAdjustment: 0, grandTotal: calculation.grandTotal, status: "MENUNGGU_PERSETUJUAN", paymentStatus: "UNPAID", estimatedCompletion: "Akan dikonfirmasi oleh Admin",
    statusHistory: [{ status: "MENUNGGU_PERSETUJUAN", timestamp: now, note: "Pesanan berhasil dikirim ke sistem." }],
  };

  orders.unshift(newOrder);
  saveDB(); 

  res.status(201).json({ success: true, order: newOrder });
});

app.patch("/api/orders/:id/status", (req, res) => {
  const { id } = req.params;
  const { status, note, rejectionReason, updatedBy, estimatedCompletion } = req.body;

  const order = orders.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: "Pesanan tidak ditemukan" });

  order.status = status as OrderStatus;
  if (estimatedCompletion) order.estimatedCompletion = estimatedCompletion;
  if (status === "DITOLAK") order.rejectionReason = rejectionReason || "Dokumen tidak memenuhi syarat cetak.";
  
  order.statusHistory.unshift({ status: status as OrderStatus, timestamp: new Date().toISOString(), note: note || `Status diubah ke ${status}`, updatedBy: updatedBy || "Admin" });
  
  saveDB(); 
  res.json({ success: true, order });
});

// ==========================================
// 1. ENDPOINT REGISTER (FIX: TANPA WA, FULL EMAIL & PASSWORD)
// ==========================================
app.post("/api/auth/register", (req, res) => {
  // Bye-bye WhatsApp! Sisa username, email, dan password aja
  const { username, email, password } = req.body;

  // Validasi input
  if (!username || !email || !password) {
    return res.status(400).json({ error: "Username, Email, dan Password wajib diisi!" });
  }

  // Cek apakah username atau email sudah pernah dipakai
  const existingUser = users.find(u => u.username === username || u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: "Username atau Email sudah terdaftar." });
  }

  // Bikin user baru
  const newUser = {
    id: "usr-" + Date.now(),
    username,
    name: username, // Nama default disamain sama username
    email,
    password,       // Password langsung masuk database
    role: "CUSTOMER",
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveDB(); // Langsung save ke database.json

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
});

// ==========================================
// 2. ENDPOINT LOGIN
// ==========================================
app.post("/api/auth/login", (req, res) => {
  const { inputAccount, password } = req.body;

  if (!inputAccount || !password) {
    return res.status(400).json({ error: "Harap masukkan identitas akun dan password" });
  }

  // Logika Admin
  const validAdmins = ["admin", "revina"];
  if (validAdmins.includes(inputAccount)) {
    if (password !== "admin") {
      return res.status(401).json({ error: "Password admin salah" });
    }
    return res.json({
      token: "jwt-admin-token-" + Date.now(),
      user: { id: "admin-" + inputAccount, username: inputAccount, name: "Admin " + inputAccount, role: "SUPER_ADMIN" },
    });
  }

  // Logika Customer (Login menggunakan Username atau Email)
  const user = users.find(u => u.username === inputAccount || u.email === inputAccount);

  if (!user) {
    return res.status(401).json({ error: "Akun tidak ditemukan. Silakan daftar terlebih dahulu." });
  }

  if (user.password !== password) {
    return res.status(401).json({ error: "Password salah." });
  }

  return res.json({
    token: "jwt-customer-token-" + Date.now(),
    user: { id: user.id, username: user.username, name: user.name, role: user.role },
  });
});

// ==========================================
// 3. FITUR LUPA PASSWORD (KIRIM OTP REAL-TIME VIA EMAIL)
// ==========================================
app.post("/api/auth/forgot-password", async (req, res) => {
  const { identifier } = req.body; // Identifier sekarang adalah Email atau Username
  
  const user = users.find(u => u.email === identifier || u.username === identifier);

  if (!user) {
    return res.status(404).json({ error: "Akun dengan Email/Username tersebut tidak ditemukan." });
  }

  if (!user.email) {
    return res.status(400).json({ error: "Akun ini tidak memiliki email yang terdaftar." });
  }

  // Generate 6 digit angka random
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Simpan OTP ke memory dengan masa aktif 5 menit
  otpStore[user.id] = {
    code: otpCode,
    expires: Date.now() + 5 * 60 * 1000 
  };

  try {
    // Kirim email sungguhan secara real-time
    await transporter.sendMail({
      from: '"Revina Print" <EMAIL_KAMU@gmail.com>', // Pastikan sesuaikan di konfigurasi nodemailer
      to: user.email,
      subject: "Kode Verifikasi Reset Password - Revina Print",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2>Halo ${user.username},</h2>
          <p>Anda telah meminta untuk mereset sandi akun Anda. Berikut adalah kode verifikasi OTP Anda:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="color: #d9534f;">Kode ini hanya berlaku selama 5 menit.</p>
          <p>Jika Anda tidak merasa meminta pengaturan ulang kata sandi, abaikan email ini.</p>
        </div>
      `
    });

    res.json({ success: true, message: `Kode OTP berhasil dikirim ke email ${user.email}` });
  } catch (error) {
    console.error("Gagal mengirim email:", error);
    res.status(500).json({ error: "Gagal mengirim kode OTP. Periksa konfigurasi email/server." });
  }
});

// ==========================================
// 4. FITUR RESET PASSWORD (VALIDASI OTP & UBAH SANDI)
// ==========================================
app.post("/api/auth/reset-password", (req, res) => {
  const { identifier, otp, newPassword } = req.body;

  if (!identifier || !otp || !newPassword) {
    return res.status(400).json({ error: "Identitas, OTP, dan Password Baru wajib diisi." });
  }

  // Cari menggunakan Email atau Username
  const user = users.find(u => u.email === identifier || u.username === identifier);

  if (!user) {
    return res.status(404).json({ error: "Akun tidak ditemukan." });
  }

  const record = otpStore[user.id];

  if (!record) {
    return res.status(400).json({ error: "Sesi OTP tidak ditemukan atau belum meminta OTP." });
  }

  if (Date.now() > record.expires) {
    delete otpStore[user.id];
    return res.status(400).json({ error: "Kode OTP sudah kadaluarsa." });
  }

  if (record.code !== otp) {
    return res.status(400).json({ error: "Kode OTP salah." });
  }

  // OTP Benar, lakukan update password
  user.password = newPassword;
  delete otpStore[user.id]; // Hapus OTP dari memori
  saveDB(); // Simpan perubahan password ke database.json

  res.json({ success: true, message: "Password berhasil diubah. Silakan login menggunakan password baru." });
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
    app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server Revina Print running on http://0.0.0.0:${PORT}`);
  });
}

startServer();