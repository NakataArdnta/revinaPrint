import { OrderItem, PricingConfig, NotificationItem, AuditLogItem, UserAccount, OrderStatus } from '../types';

export const fetchPricingConfig = async (): Promise<PricingConfig> => {
  try {
    const res = await fetch('/api/config/pricing');
    if (!res.ok) throw new Error('Failed to fetch pricing');
    return await res.json();
  } catch (err) {
    console.warn('API fallback for pricing config');
    return {
      a4_bw: 500,
      a4_color: 2000,
      f4_bw: 700,
      f4_color: 2500,
      finishing_stapler: 1000,
      finishing_lakban: 3000,
      finishing_spiral: 8000,
      finishing_laminating: 5000,
    };
  }
};

export const updatePricingConfig = async (config: Partial<PricingConfig>, updatedBy: string): Promise<PricingConfig> => {
  const res = await fetch('/api/config/pricing', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...config, updatedBy }),
  });
  const data = await res.json();
  return data.config;
};

export const fetchOrders = async (params?: { whatsapp?: string; status?: string; search?: string }): Promise<OrderItem[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.whatsapp) query.set('whatsapp', params.whatsapp);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/orders?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
};

export const fetchOrderById = async (id: string): Promise<OrderItem | null> => {
  try {
    const res = await fetch(`/api/orders/${id}`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const createOrder = async (orderData: any): Promise<OrderItem> => {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.error || 'Gagal membuat pesanan');
  }
  const data = await res.json();
  return data.order;
};

export const updateOrderStatus = async (
  id: string,
  payload: {
    status: OrderStatus;
    note?: string;
    rejectionReason?: string;
    updatedBy?: string;
    estimatedCompletion?: string;
  }
): Promise<OrderItem> => {
  const res = await fetch(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Gagal memperbarui status');
  const data = await res.json();
  return data.order;
};

export const updateOrderFee = async (
  id: string,
  customFeeAdjustment: number,
  customFeeNote?: string,
  updatedBy?: string
): Promise<OrderItem> => {
  const res = await fetch(`/api/orders/${id}/fee`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customFeeAdjustment, customFeeNote, updatedBy }),
  });
  if (!res.ok) throw new Error('Gagal memperbarui biaya');
  const data = await res.json();
  return data.order;
};

export const uploadPaymentProof = async (
  id: string,
  paymentMethod: string,
  paymentProofUrl?: string
): Promise<OrderItem> => {
  const res = await fetch(`/api/orders/${id}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentMethod, paymentProofUrl }),
  });
  if (!res.ok) throw new Error('Gagal mengunggah bukti pembayaran');
  const data = await res.json();
  return data.order;
};

export const verifyPayment = async (
  id: string,
  action: 'APPROVE' | 'REJECT',
  note?: string,
  updatedBy?: string
): Promise<OrderItem> => {
  const res = await fetch(`/api/orders/${id}/verify-payment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, note, updatedBy }),
  });
  if (!res.ok) throw new Error('Gagal memverifikasi pembayaran');
  const data = await res.json();
  return data.order;
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus pesanan');
  const data = await res.json();
  return data.success;
};

export const clearOrderHistory = async (whatsapp?: string, status?: string): Promise<number> => {
  const params = new URLSearchParams();
  if (whatsapp) params.append('whatsapp', whatsapp);
  if (status) params.append('status', status);
  const res = await fetch(`/api/orders?${params.toString()}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Gagal menghapus riwayat pesanan');
  const data = await res.json();
  return data.removedCount;
};

export const fetchNotifications = async (whatsapp?: string): Promise<NotificationItem[]> => {
  try {
    const url = whatsapp ? `/api/notifications?whatsapp=${encodeURIComponent(whatsapp)}` : '/api/notifications';
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
};

export const markNotificationRead = async (id: string): Promise<void> => {
  await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
};

export const fetchReports = async (): Promise<any> => {
  try {
    const res = await fetch('/api/reports');
    if (!res.ok) throw new Error('Gagal mengambil laporan');
    return await res.json();
  } catch (err) {
    return null;
  }
};

export const fetchAuditLogs = async (): Promise<AuditLogItem[]> => {
  try {
    const res = await fetch('/api/audit-logs');
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
};
