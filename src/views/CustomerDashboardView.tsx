import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  FileText,
  Printer,
  ChevronRight,
  RefreshCw,
  PlusCircle,
  CreditCard,
  Trash2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchOrders, deleteOrder, clearOrderHistory } from '../lib/api';
import { OrderItem } from '../types';
import { formatRupiah, ORDER_STATUS_CONFIG } from '../lib/constants';

interface CustomerDashboardViewProps {
  onNavigate: (tab: string, params?: any) => void;
}

export const CustomerDashboardView: React.FC<CustomerDashboardViewProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    if (user?.whatsapp) {
      const data = await fetchOrders({ whatsapp: user.whatsapp });
      setOrders(data);
    } else {
      const data = await fetchOrders();
      setOrders(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleDeleteSingle = async (id: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pesanan #${id} dari riwayat?`)) return;
    setDeletingId(id);
    try {
      await deleteOrder(id);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pesanan');
    } finally {
      setDeletingId(null);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus SEMUA riwayat pesanan yang sudah Selesai atau Dibatalkan?')) return;
    setLoading(true);
    try {
      await clearOrderHistory(user?.whatsapp);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus riwayat pesanan');
    } finally {
      setLoading(false);
    }
  };

  // Derived metrics
  const totalOrders = orders.length;
  const processingOrders = orders.filter((o) =>
    ['MENUNGGU_PERSETUJUAN', 'MENUNGGU_PEMBAYARAN', 'SEDANG_DICETAK'].includes(o.status)
  ).length;
  const completedOrders = orders.filter((o) => o.status === 'SELESAI' || o.status === 'SIAP_DIAMBIL').length;

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    const matchesSearch =
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.files.some((f) => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const latestActiveOrder = orders.find((o) => o.status !== 'SELESAI' && o.status !== 'DITOLAK') || orders[0];

  return (
    <div className="space-y-8 pb-12">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            Selamat Datang, {user?.name || 'Pelanggan Setia'}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Nomor WA: <span className="font-semibold text-slate-700 dark:text-slate-300">{user?.whatsapp || '081234567890'}</span>
          </p>
        </div>

        <button
          onClick={() => onNavigate('order-form')}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:scale-105 transition-all flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Buat Pesanan Cetak Baru</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 flex items-center justify-center font-bold">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Pesanan</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{totalOrders}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pesanan Diproses</p>
            <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400">{processingOrders}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-300 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pesanan Selesai</p>
            <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">{completedOrders}</p>
          </div>
        </div>
      </div>

      {/* Status Pesanan Terbaru Preview Widget */}
      {latestActiveOrder && (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
                Pesanan Aktif Terbaru
              </span>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>#{latestActiveOrder.id}</span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${ORDER_STATUS_CONFIG[latestActiveOrder.status].badgeClass}`}>
                  {ORDER_STATUS_CONFIG[latestActiveOrder.status].label}
                </span>
              </h3>
            </div>

            <button
              onClick={() => onNavigate('order-status', { orderId: latestActiveOrder.id })}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-blue-50 transition-colors flex items-center gap-1.5"
            >
              <span>Lacak Detail & Pembayaran</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-300">
            <div>
              <p className="text-[10px] text-slate-400">Dokumen:</p>
              <p className="font-semibold text-white truncate">{latestActiveOrder.files[0]?.name || 'Dokumen'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Spesifikasi:</p>
              <p className="font-semibold text-white">{latestActiveOrder.paperType} {latestActiveOrder.colorMode}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Grand Total:</p>
              <p className="font-bold text-emerald-300">{formatRupiah(latestActiveOrder.grandTotal)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Estimasi Selesai:</p>
              <p className="font-semibold text-white">{latestActiveOrder.estimatedCompletion}</p>
            </div>
          </div>
        </div>
      )}

      {/* Table & Filter History */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Riwayat Semua Pesanan Saya</h2>
            {orders.some((o) => o.status === 'SELESAI' || o.status === 'DITOLAK') && (
              <button
                onClick={handleClearHistory}
                className="px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1"
                title="Hapus riwayat pesanan selesai / dibatalkan"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan History</span>
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari ID / nama file..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
              />
            </div>

            {/* Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium"
            >
              <option value="ALL">Semua Status</option>
              <option value="MENUNGGU_PERSETUJUAN">Menunggu Persetujuan</option>
              <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
              <option value="SEDANG_DICETAK">Sedang Dicetak</option>
              <option value="SIAP_DIAMBIL">Siap Diambil</option>
              <option value="SELESAI">Selesai</option>
              <option value="DITOLAK">Ditolak</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Memuat riwayat pesanan...</div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <FileText className="w-12 h-12 text-slate-300 mx-auto" />
            <p className="text-xs font-semibold text-slate-500">Belum ada pesanan yang sesuai filter.</p>
            <button
              onClick={() => onNavigate('order-form')}
              className="px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Buat Pesanan Cetak Sekarang
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-semibold uppercase text-[10px]">
                  <th className="py-3 px-2">No. Pesanan</th>
                  <th className="py-3 px-2">Tanggal</th>
                  <th className="py-3 px-2">File Dokumen</th>
                  <th className="py-3 px-2">Spek Kertas</th>
                  <th className="py-3 px-2 text-right">Total Biaya</th>
                  <th className="py-3 px-2 text-center">Status</th>
                  <th className="py-3 px-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-2 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {order.id}
                    </td>
                    <td className="py-3 px-2 text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="py-3 px-2 max-w-[180px] truncate">
                      <p className="font-semibold text-slate-900 dark:text-white truncate">
                        {order.files[0]?.name || 'Dokumen'}
                      </p>
                      <p className="text-[10px] text-slate-400">{order.files.length} file diunggah</p>
                    </td>
                    <td className="py-3 px-2 text-slate-700 dark:text-slate-300">
                      {order.paperType} {order.colorMode} ({order.pageCount} lbr x {order.copyCount})
                    </td>
                    <td className="py-3 px-2 text-right font-black text-slate-900 dark:text-white">
                      {formatRupiah(order.grandTotal)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className={`inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${ORDER_STATUS_CONFIG[order.status].badgeClass}`}>
                        {ORDER_STATUS_CONFIG[order.status].label}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onNavigate('order-status', { orderId: order.id })}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 font-bold text-[11px] transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Detail
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(order.id)}
                          disabled={deletingId === order.id}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Hapus Pesanan Ini"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
