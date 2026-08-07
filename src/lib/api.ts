import { OrderItem, PricingConfig, NotificationItem, AuditLogItem, OrderStatus } from '../types';

async function safeFetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  const rawText = await res.text();
  let data: any = {};
  try {
    data = rawText ? JSON.parse(rawText) : {};
  } catch (e) {
    if (!res.ok) {
      throw new Error(`Gagal terhubung ke server (${res.status}). Silakan coba lagi.`);
    }
    throw new Error('Respon server tidak valid.');
  }

  if (!res.ok) {
    throw new Error(data.error || data.message || `Terjadi kesalahan (${res.status})`);
  }

  return data as T;
}

export const fetchPricingConfig = async (): Promise<PricingConfig> => {
  try {
    return await safeFetchJson<PricingConfig>('/api/config/pricing');
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
  const data = await safeFetchJson<{ config: PricingConfig }>('/api/config/pricing', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...config, updatedBy }),
  });
  return data.config;
};

export const fetchOrders = async (params?: { whatsapp?: string; status?: string; search?: string }): Promise<OrderItem[]> => {
  try {
    const query = new URLSearchParams();
    if (params?.whatsapp) query.set('whatsapp', params.whatsapp);
    if (params?.status) query.set('status', params.status);
    if (params?.search) query.set('search', params.search);

    return await safeFetchJson<OrderItem[]>(`/api/orders?${query.toString()}`);
  } catch (err) {
    console.error('Error fetching orders:', err);
    return [];
  }
};

export const fetchOrderById = async (id: string): Promise<OrderItem | null> => {
  try {
    return await safeFetchJson<OrderItem>(`/api/orders/${id}`);
  } catch (err) {
    return null;
  }
};

export const createOrder = async (orderData: any): Promise<OrderItem> => {
  const data = await safeFetchJson<{ success: boolean; order: OrderItem }>('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData),
  });
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
  const data = await safeFetchJson<{ order: OrderItem }>(`/api/orders/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return data.order;
};

export const updateOrderFee = async (
  id: string,
  customFeeAdjustment: number,
  customFeeNote?: string,
  updatedBy?: string
): Promise<OrderItem> => {
  const data = await safeFetchJson<{ order: OrderItem }>(`/api/orders/${id}/fee`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ customFeeAdjustment, customFeeNote, updatedBy }),
  });
  return data.order;
};

export const uploadPaymentProof = async (
  id: string,
  paymentMethod: string,
  paymentProofUrl?: string
): Promise<OrderItem> => {
  const data = await safeFetchJson<{ order: OrderItem }>(`/api/orders/${id}/payment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentMethod, paymentProofUrl }),
  });
  return data.order;
};

export const verifyPayment = async (
  id: string,
  action: 'APPROVE' | 'REJECT',
  note?: string,
  updatedBy?: string
): Promise<OrderItem> => {
  const data = await safeFetchJson<{ order: OrderItem }>(`/api/orders/${id}/verify-payment`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, note, updatedBy }),
  });
  return data.order;
};

export const deleteOrder = async (id: string): Promise<boolean> => {
  const data = await safeFetchJson<{ success: boolean }>(`/api/orders/${id}`, { method: 'DELETE' });
  return data.success;
};

export const clearOrderHistory = async (whatsapp?: string, status?: string): Promise<number> => {
  const params = new URLSearchParams();
  if (whatsapp) params.append('whatsapp', whatsapp);
  if (status) params.append('status', status);
  const data = await safeFetchJson<{ removedCount: number }>(`/api/orders?${params.toString()}`, { method: 'DELETE' });
  return data.removedCount;
};

export const fetchNotifications = async (whatsapp?: string): Promise<NotificationItem[]> => {
  try {
    const url = whatsapp ? `/api/notifications?whatsapp=${encodeURIComponent(whatsapp)}` : '/api/notifications';
    return await safeFetchJson<NotificationItem[]>(url);
  } catch (err) {
    return [];
  }
};

export const markNotificationRead = async (id: string): Promise<void> => {
  try {
    await fetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
  } catch (err) {
    // ignore
  }
};

export const fetchReports = async (): Promise<any> => {
  try {
    return await safeFetchJson<any>('/api/reports');
  } catch (err) {
    return null;
  }
};

export const fetchAuditLogs = async (): Promise<AuditLogItem[]> => {
  try {
    return await safeFetchJson<AuditLogItem[]>('/api/audit-logs');
  } catch (err) {
    return [];
  }
};
