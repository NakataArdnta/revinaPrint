import mongoose from 'mongoose';

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb+srv://nakatatardinata_db_user:2szheVYocn2cbtaT@cluster.mongodb.net/revina_print?retryWrites=true&w=majority';

let isConnected = false;

export async function connectToDatabase() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const db = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = db.connections[0].readyState === 1;
    console.log('Successfully connected to MongoDB Atlas (revina_print)');
  } catch (err) {
    console.warn('MongoDB connection warning:', err);
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  whatsapp: { type: String, default: '' },
  role: { type: String, enum: ['CUSTOMER', 'ADMIN', 'SUPER_ADMIN', 'OPERATOR'], default: 'CUSTOMER' },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.models.User || mongoose.model('User', userSchema);

// Order Schema
const orderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  customerName: { type: String, required: true },
  whatsapp: { type: String, required: true },
  email: { type: String, default: '' },
  files: [
    {
      id: String,
      name: String,
      size: Number,
      type: String,
      dataUrl: String,
      pageCountEstimate: Number,
    },
  ],
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
  customFeeAdjustment: { type: Number, default: 0 },
  grandTotal: Number,
  status: { type: String, default: 'MENUNGGU_PERSETUJUAN' },
  paymentStatus: { type: String, default: 'UNPAID' },
  paymentMethod: String,
  paymentProofUrl: String,
  estimatedCompletion: String,
  statusHistory: [
    {
      status: String,
      timestamp: String,
      note: String,
      updatedBy: String,
    },
  ],
});

export const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

// Pricing Schema
const pricingSchema = new mongoose.Schema({
  key: { type: String, default: 'default_pricing', unique: true },
  a4_bw: { type: Number, default: 500 },
  a4_color: { type: Number, default: 2000 },
  f4_bw: { type: Number, default: 700 },
  f4_color: { type: Number, default: 2500 },
  finishing_stapler: { type: Number, default: 1000 },
  finishing_lakban: { type: Number, default: 3000 },
  finishing_spiral: { type: Number, default: 8000 },
  finishing_laminating: { type: Number, default: 5000 },
});

export const Pricing = mongoose.models.Pricing || mongoose.model('Pricing', pricingSchema);

// Notification Schema
const notificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  orderId: String,
  recipientWhatsapp: String,
  title: String,
  message: String,
  type: { type: String, default: 'INFO' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  read: { type: Boolean, default: false },
});

export const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

// Audit Log Schema
const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  timestamp: { type: String, default: () => new Date().toISOString() },
  actorName: String,
  actorRole: String,
  action: String,
  details: String,
});

export const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
