import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Package,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  FileText,
  Printer,
  Shield,
  Settings,
  DollarSign,
  Download,
  Share2,
  Plus,
  Minus,
  AlertCircle,
  QrCode,
  Users,
  Database,
  Activity,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Check,
  X,
  Lock,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  fetchOrders,
  fetchPricingConfig,
  updatePricingConfig,
  updateOrderStatus,
  updateOrderFee,
  verifyPayment,
  fetchReports,
  fetchAuditLogs,
  deleteOrder,
  clearOrderHistory,
} from '../lib/api';
import { OrderItem, OrderStatus, PricingConfig, AuditLogItem } from '../types';
import { formatRupiah, ORDER_STATUS_CONFIG, FINISHING_LABELS } from '../lib/constants';
import { InvoiceModal } from '../components/InvoiceModal';
import { useAuth } from '../context/AuthContext';

export const AdminDashboardView: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORDERS' | 'PAYMENTS' | 'PRICING' | 'REPORTS' | 'SYSTEM'>('OVERVIEW');

  // Data states
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [pricing, setPricing] = useState<PricingConfig | null>(null);
  const [reports, setReports] = useState<any>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [paperFilter, setPaperFilter] = useState('ALL');

  // Selected Order for Detail Drawer / Modal
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  // Instant Print State & Popup Modal
  const [printingOrder, setPrintingOrder] = useState<OrderItem | null>(null);
  const [showPrintConfirmModal, setShowPrintConfirmModal] = useState(false);

  // Modal controls
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const [showFeeModal, setShowFeeModal] = useState(false);
  const [customFeeAmount, setCustomFeeAmount] = useState<number>(0);
  const [customFeeNote, setCustomFeeNote] = useState('');

  const [showInvoice, setShowInvoice] = useState(false);

  // Pricing Form State
  const [pricingForm, setPricingForm] = useState<Partial<PricingConfig>>({});
  const [pricingSaved, setPricingSaved] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const [ordersData, pricingData, reportsData, logsData] = await Promise.all([
      fetchOrders({ search, status: statusFilter }),
      fetchPricingConfig(),
      fetchReports(),
      fetchAuditLogs(),
    ]);

    setOrders(ordersData);
    setPricing(pricingData);
    setPricingForm(pricingData);
    setReports(reportsData);
    setAuditLogs(logsData);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Actions
  const handleACC = async (orderId: string) => {
    // 1. Update status to SEDANG_DICETAK immediately
    const updated = await updateOrderStatus(orderId, {
      status: 'SEDANG_DICETAK',
      note: 'Pesanan di-ACC dan langsung diproses ke antrean printer.',
      updatedBy: user?.name || 'Admin',
    });
    setSelectedOrder(updated);
    setPrintingOrder(updated);

    // 2. Trigger browser print dialog instantly
    setTimeout(() => {
      window.print();
      // 3. Open confirmation modal after print dialog
      setShowPrintConfirmModal(true);
    }, 300);

    loadData();
  };

  const handleConfirmPrintSuccess = async (isSuccess: boolean) => {
    if (!printingOrder) return;
    if (isSuccess) {
      const updated = await updateOrderStatus(printingOrder.id, {
        status: 'SIAP_DIAMBIL',
        note: 'Hasil cetak berhasil diselesaikan dan siap diambil/diantar.',
        updatedBy: user?.name || 'Admin',
      });
      setSelectedOrder(updated);
    }
    setShowPrintConfirmModal(false);
    setPrintingOrder(null);
    loadData();
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus permanen pesanan #${orderId}?`)) return;
    try {
      await deleteOrder(orderId);
      setSelectedOrder(null);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus pesanan');
    }
  };

  const handleClearCompletedHistory = async () => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus SEMUA riwayat pesanan yang Selesai / Dibatalkan dari database?')) return;
    try {
      await clearOrderHistory();
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Gagal membersihkan riwayat');
    }
  };

  const handleRePrint = () => {
    window.print();
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !rejectionReason.trim()) return;
    const updated = await updateOrderStatus(selectedOrder.id, {
      status: 'DITOLAK',
      rejectionReason,
      note: `Ditolak: ${rejectionReason}`,
      updatedBy: user?.name || 'Admin',
    });
    setSelectedOrder(updated);
    setShowRejectModal(false);
    setRejectionReason('');
    loadData();
  };

  const handleFeeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const updated = await updateOrderFee(selectedOrder.id, customFeeAmount, customFeeNote, user?.name || 'Admin');
    setSelectedOrder(updated);
    setShowFeeModal(false);
    loadData();
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const updated = await updateOrderStatus(orderId, {
      status: newStatus,
      updatedBy: user?.name || 'Admin',
    });
    setSelectedOrder(updated);
    loadData();
  };

  const handleVerifyPaymentAction = async (orderId: string, action: 'APPROVE' | 'REJECT') => {
    const updated = await verifyPayment(orderId, action, action === 'APPROVE' ? 'Pembayaran terverifikasi' : 'Bukti bayar tidak valid', user?.name || 'Admin');
    setSelectedOrder(updated);
    loadData();
  };

  const handleSavePricing = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updatePricingConfig(pricingForm, user?.name || 'Super Admin');
    setPricing(updated);
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 2000);
  };

  // Export Excel CSV
  const handleExportCSV = () => {
    const headers = ['ID Pesanan', 'Tanggal', 'Nama Customer', 'WhatsApp', 'Jenis Kertas', 'Warna', 'Jumlah Lembar', 'Copy', 'Finishing', 'Total Biaya', 'Status'];
    const rows = orders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleDateString('id-ID'),
      o.customerName,
      o.whatsapp,
      o.paperType,
      o.colorMode,
      o.pageCount,
      o.copyCount,
      FINISHING_LABELS[o.finishing],
      o.grandTotal,
      o.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_RevinaPrint_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    const matchesPaper = paperFilter === 'ALL' || o.paperType === paperFilter;
    return matchesPaper;
  });

  const pieData = [
    { name: 'A4 Hitam Putih', value: reports?.paperStats?.A4_BW || 3, color: '#3b82f6' },
    { name: 'A4 Warna', value: reports?.paperStats?.A4_COLOR || 5, color: '#8b5cf6' },
    { name: 'F4 Hitam Putih', value: reports?.paperStats?.F4_BW || 2, color: '#06b6d4' },
    { name: 'F4 Warna', value: reports?.paperStats?.F4_COLOR || 4, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Admin Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
              System Control
            </span>
            <span className="text-xs text-slate-400 font-mono">Hak Akses: {user?.role || 'SUPER_ADMIN'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Panel Dashboard Administrasi</h1>
          <p className="text-xs text-slate-300 mt-1">
            Kelola transaksi masuk, persetujuan pesanan, verifikasi pembayaran, dan laporan pendapatan Revina Print.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Laporan (Excel/CSV)</span>
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'OVERVIEW'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Ringkasan & Analitik
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'ORDERS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <Package className="w-4 h-4" />
          Manajemen Pesanan ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('PAYMENTS')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'PAYMENTS'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <QrCode className="w-4 h-4" />
          Verifikasi Pembayaran
        </button>

        <button
          onClick={() => setActiveTab('PRICING')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'PRICING'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Pengaturan Harga
        </button>

        <button
          onClick={() => setActiveTab('SYSTEM')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs whitespace-nowrap transition-all flex items-center gap-2 ${
            activeTab === 'SYSTEM'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50'
          }`}
        >
          <Activity className="w-4 h-4" />
          Audit Log & Sistem
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          {/* Key Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pendapatan</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                {formatRupiah(reports?.totalRevenue || 0)}
              </h3>
              <p className="text-[10px] text-slate-500 mt-2">Terverifikasi Lunas</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Pesanan</p>
              <h3 className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">
                {reports?.totalOrders || 0} <span className="text-xs font-semibold text-slate-400">transaksi</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-2">Semua riwayat pesanan</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pesanan Hari Ini</p>
              <h3 className="text-2xl font-black text-purple-600 dark:text-purple-400 mt-1">
                {reports?.todayOrders || 0} <span className="text-xs font-semibold text-slate-400">masuk</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-2">Transaksi terbaru</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sedang Diproses</p>
              <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                {reports?.processingOrders || 0} <span className="text-xs font-semibold text-slate-400">dokumen</span>
              </h3>
              <p className="text-[10px] text-slate-500 mt-2">Perlu perhatian admin</p>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4">Grafik Tren Pendapatan 7 Hari Terakhir</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reports?.revenueChart || []}>
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip
                      formatter={(val: any) => [formatRupiah(val), 'Pendapatan']}
                      contentStyle={{ backgroundColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                    />
                    <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Paper Distribution Pie */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-2">Distribusi Cetak Kertas</h3>
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-700">
                {pieData.map((p) => (
                  <div key={p.name} className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: p.color }}></div>
                    <span className="truncate">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDER MANAGEMENT TABLE */}
      {(activeTab === 'ORDERS' || activeTab === 'OVERVIEW') && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Tabel Manajemen Pesanan</h3>
              <p className="text-xs text-slate-500">ACC, Tolak, Ubah Biaya, dan Atur Status Cetak Realtime.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              {/* Search Form */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 md:w-56">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari ID / WhatsApp / Nama..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 dark:text-white"
                />
              </form>

              {/* Status Filter */}
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

              {/* Paper Filter */}
              <select
                value={paperFilter}
                onChange={(e) => setPaperFilter(e.target.value)}
                className="bg-slate-50 dark:bg-slate-700/60 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-white font-medium"
              >
                <option value="ALL">Semua Kertas</option>
                <option value="A4">A4</option>
                <option value="F4">F4</option>
              </select>

              {orders.some((o) => o.status === 'SELESAI' || o.status === 'DITOLAK') && (
                <button
                  type="button"
                  onClick={handleClearCompletedHistory}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-all flex items-center gap-1"
                  title="Hapus semua pesanan dengan status Selesai atau Ditolak"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Memuat data pesanan...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">Tidak ada pesanan yang sesuai filter.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-400 font-semibold uppercase text-[10px]">
                    <th className="py-3 px-2">No. Pesanan</th>
                    <th className="py-3 px-2">Tanggal</th>
                    <th className="py-3 px-2">Customer</th>
                    <th className="py-3 px-2">Kertas</th>
                    <th className="py-3 px-2">Finishing</th>
                    <th className="py-3 px-2 text-right">Total Harga</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-2 text-center">Aksi Utama</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-3 px-2 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {order.id}
                      </td>
                      <td className="py-3 px-2 text-slate-500">
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-3 px-2">
                        <p className="font-semibold text-slate-900 dark:text-white">{order.customerName}</p>
                        <p className="text-[10px] text-slate-400">{order.whatsapp}</p>
                      </td>
                      <td className="py-3 px-2 text-slate-700 dark:text-slate-300">
                        {order.paperType} {order.colorMode} ({order.pageCount}lbr x {order.copyCount})
                      </td>
                      <td className="py-3 px-2 text-slate-600 dark:text-slate-400">
                        {FINISHING_LABELS[order.finishing]}
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
                        <div className="flex items-center justify-center gap-1">
                          {order.status === 'MENUNGGU_PERSETUJUAN' && (
                            <>
                              <button
                                onClick={() => handleACC(order.id)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] hover:bg-emerald-700 transition-colors"
                              >
                                ACC
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setShowRejectModal(true);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[10px] hover:bg-rose-700 transition-colors"
                              >
                                Tolak
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200"
                            title="Lihat Detail"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="p-1 rounded-lg bg-slate-100 dark:bg-slate-700 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-950/40"
                            title="Hapus Pesanan Ini"
                          >
                            <Trash2 className="w-4 h-4" />
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
      )}

      {/* TAB 3: VERIFIKASI PEMBAYARAN */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Verifikasi Bukti Pembayaran Customer</h3>
          <p className="text-xs text-slate-500">Tinjau bukti transfer / QRIS yang diupload oleh customer.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {orders
              .filter((o) => o.paymentStatus === 'PENDING_VERIFICATION' || o.paymentProofUrl)
              .map((o) => (
                <div key={o.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-700/40 border border-slate-200 dark:border-slate-600 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono font-bold text-sm text-indigo-600 dark:text-indigo-400">#{o.id}</span>
                      <p className="font-bold text-xs text-slate-900 dark:text-white mt-0.5">{o.customerName} ({o.whatsapp})</p>
                      <p className="text-[11px] text-slate-500">Metode: {o.paymentMethod || 'QRIS'}</p>
                    </div>
                    <span className="font-black text-base text-emerald-600 dark:text-emerald-400">
                      {formatRupiah(o.grandTotal)}
                    </span>
                  </div>

                  {o.paymentProofUrl && (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 relative group">
                      <img src={o.paymentProofUrl} alt="Bukti Transfer" className="w-full h-full object-cover" />
                      <a
                        href={o.paymentProofUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs transition-opacity"
                      >
                        Buka Gambar Ukuran Penuh
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleVerifyPaymentAction(o.id, 'APPROVE')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors"
                    >
                      Verifikasi ACC Pembayaran
                    </button>
                    <button
                      onClick={() => handleVerifyPaymentAction(o.id, 'REJECT')}
                      className="py-2 px-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors"
                    >
                      Tolak
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: PENGATURAN HARGA */}
      {activeTab === 'PRICING' && pricing && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm max-w-3xl space-y-6">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Konfigurasi Tarif Cetak & Finishing</h3>
            <p className="text-xs text-slate-500">Ubah harga satuan tanpa perlu mengubah kode program. Perubahan berlaku langsung pada pesanan baru.</p>
          </div>

          {pricingSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan tarif berhasil disimpan!</span>
            </div>
          )}

          <form onSubmit={handleSavePricing} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  A4 Hitam Putih (Rp / lembar)
                </label>
                <input
                  type="number"
                  value={pricingForm.a4_bw || 500}
                  onChange={(e) => setPricingForm({ ...pricingForm, a4_bw: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  A4 Warna (Rp / lembar)
                </label>
                <input
                  type="number"
                  value={pricingForm.a4_color || 2000}
                  onChange={(e) => setPricingForm({ ...pricingForm, a4_color: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  F4 Hitam Putih (Rp / lembar)
                </label>
                <input
                  type="number"
                  value={pricingForm.f4_bw || 700}
                  onChange={(e) => setPricingForm({ ...pricingForm, f4_bw: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  F4 Warna (Rp / lembar)
                </label>
                <input
                  type="number"
                  value={pricingForm.f4_color || 2500}
                  onChange={(e) => setPricingForm({ ...pricingForm, f4_color: Number(e.target.value) })}
                  className="w-full bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-colors shadow-md"
            >
              Simpan Perubahan Tarif
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: AUDIT LOG & SYSTEM */}
      {activeTab === 'SYSTEM' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Audit Log & Catatan Aktivitas Admin</h3>

          <div className="space-y-3 divide-y divide-slate-100 dark:divide-slate-700/50">
            {auditLogs.map((log) => (
              <div key={log.id} className="pt-3 flex items-start justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{log.action}</p>
                  <p className="text-slate-500 mt-0.5">{log.details}</p>
                  <span className="text-[10px] text-slate-400">Aktor: {log.actorName} ({log.actorRole})</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(log.timestamp).toLocaleString('id-ID')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SELECTED ORDER DETAIL DRAWER / MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl h-full shadow-2xl p-6 overflow-y-auto border-l border-slate-200 dark:border-slate-800 space-y-6 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <span className="font-mono text-lg font-black text-indigo-600 dark:text-indigo-400">#{selectedOrder.id}</span>
                <p className="text-xs text-slate-500">Detail Lengkap Pesanan Customer</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleACC(selectedOrder.id)}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
              >
                ACC Pesanan
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700"
              >
                Tolak
              </button>
              <button
                onClick={() => setShowFeeModal(true)}
                className="px-3 py-1.5 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700"
              >
                ± Ubah Biaya
              </button>
              <button
                onClick={() => setShowInvoice(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Invoice
              </button>
              <button
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 font-bold text-xs hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-1 transition-colors"
                title="Hapus pesanan ini dari database"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Hapus Pesanan
              </button>
            </div>

            {/* Change Status Dropdown */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Ubah Status Transaksi:
              </label>
              <select
                value={selectedOrder.status}
                onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value as OrderStatus)}
                className="w-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="MENUNGGU_PERSETUJUAN">Menunggu Persetujuan</option>
                <option value="MENUNGGU_PEMBAYARAN">Menunggu Pembayaran</option>
                <option value="SEDANG_DICETAK">Sedang Dicetak</option>
                <option value="SIAP_DIAMBIL">Siap Diambil</option>
                <option value="SEDANG_DIANTAR">Sedang Diantar</option>
                <option value="SELESAI">Selesai</option>
                <option value="DITOLAK">Ditolak</option>
              </select>
            </div>

            {/* Specs & Customer Info */}
            <div className="space-y-3 text-xs">
              <p className="font-bold text-slate-900 dark:text-white">Informasi Customer:</p>
              <p className="text-slate-600 dark:text-slate-300">Nama: {selectedOrder.customerName}</p>
              <p className="text-slate-600 dark:text-slate-300">WhatsApp: {selectedOrder.whatsapp}</p>
              <p className="text-slate-600 dark:text-slate-300">Email: {selectedOrder.email || '-'}</p>

              <p className="font-bold text-slate-900 dark:text-white pt-2">File Dokumen Yang Diunggah:</p>
              <div className="space-y-2">
                {selectedOrder.files && selectedOrder.files.length > 0 ? (
                  selectedOrder.files.map((file, idx) => (
                    <div key={file.id || idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400">
                          Ukuran: {(file.size / (1024 * 1024)).toFixed(2)} MB | Tipe: {file.type || 'Dokumen'}
                        </p>
                      </div>
                      {file.dataUrl ? (
                        <a
                          href={file.dataUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] shrink-0 transition-colors inline-flex items-center gap-1 shadow-sm"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Buka & Cetak Dokumen
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">File Lokal Mock</span>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 italic">File: {selectedOrder.fileName || 'Dokumen Cetak'}</p>
                )}
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-[11px] text-amber-900 dark:text-amber-200">
                <p className="font-bold mb-0.5">💡 Cara Mencetak Dokumen Pelanggan Pas di Printer:</p>
                <ol className="list-decimal list-inside space-y-0.5 text-[10.5px]">
                  <li>Klik <strong>"Buka & Cetak Dokumen"</strong> di atas untuk membuka berkas asli (PDF/Gambar) di tab baru browser.</li>
                  <li>Tekan <kbd className="bg-white dark:bg-slate-800 px-1 py-0.5 rounded border">Ctrl + P</kbd> di tab tersebut untuk kirim langsung ke fisik mesin printer.</li>
                  <li>Klik tombol <strong>"ACC & Cetak SPK"</strong> untuk mencetak tiket kerja / nota internal toko.</li>
                </ol>
              </div>

              <p className="font-bold text-slate-900 dark:text-white pt-2">Spesifikasi Cetakan:</p>
              <p className="text-slate-600 dark:text-slate-300">Kertas: {selectedOrder.paperType} ({selectedOrder.colorMode})</p>
              <p className="text-slate-600 dark:text-slate-300">Volume: {selectedOrder.pageCount} lembar x {selectedOrder.copyCount} copy</p>
              <p className="text-slate-600 dark:text-slate-300">Mode: {selectedOrder.printMode === 'DOUBLE' ? 'Bolak Balik' : 'Satu Sisi'}</p>
              <p className="text-slate-600 dark:text-slate-300">Finishing: {FINISHING_LABELS[selectedOrder.finishing]}</p>
              <p className="text-slate-600 dark:text-slate-300">Catatan: {selectedOrder.additionalNotes || 'Tidak ada'}</p>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-sm font-black text-blue-600 dark:text-blue-400">
                <span>Grand Total:</span>
                <span>{formatRupiah(selectedOrder.grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* REJECT REASON MODAL */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Alasan Penolakan Pesanan</h3>
            <textarea
              rows={3}
              placeholder="Tuliskan alasan penolakan (misal: ukuran file terlalu kecil, dokumen berpassword, dll)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            ></textarea>
            <div className="flex gap-2">
              <button
                onClick={handleRejectSubmit}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs"
              >
                Konfirmasi Tolak
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEE ADJUSTMENT MODAL */}
      {showFeeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Penyesuaian Biaya (+ / -)</h3>
            <p className="text-xs text-slate-500">Gunakan angka positif untuk biaya tambahan atau negatif untuk diskon.</p>
            <input
              type="number"
              placeholder="Contoh: 5000 atau -2000"
              value={customFeeAmount}
              onChange={(e) => setCustomFeeAmount(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-900 dark:text-white"
            />
            <input
              type="text"
              placeholder="Catatan penyesuaian biaya..."
              value={customFeeNote}
              onChange={(e) => setCustomFeeNote(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white"
            />
            <div className="flex gap-2">
              <button
                onClick={handleFeeSubmit}
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                Simpan Penyesuaian
              </button>
              <button
                onClick={() => setShowFeeModal(false)}
                className="py-2 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs text-slate-700 dark:text-slate-300"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INVOICE MODAL */}
      {showInvoice && selectedOrder && (
        <InvoiceModal order={selectedOrder} onClose={() => setShowInvoice(false)} />
      )}

      {/* PRINT CONFIRMATION MODAL (POPUP SETELAH ACC & CETAK) */}
      {showPrintConfirmModal && printingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <Printer className="w-7 h-7" />
            </div>

            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">
                Apakah Hasil Cetak Berhasil?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Dokumen untuk pesanan <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">#{printingOrder.id}</span> ({printingOrder.customerName}) telah dikirim ke printer.
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Kertas & Sisi:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{printingOrder.paperType} ({printingOrder.printMode === 'DOUBLE' ? 'Bolak Balik' : 'Satu Sisi'})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Warna & Copy:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{printingOrder.colorMode} x {printingOrder.copyCount} Copy ({printingOrder.pageCount} Hal)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Finishing:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{FINISHING_LABELS[printingOrder.finishing]}</span>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                onClick={() => handleConfirmPrintSuccess(true)}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                Ya, Hasil Cetak Sempurna (Siap Diambil)
              </button>

              <button
                onClick={handleRePrint}
                className="w-full py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Cetak Ulang Ke Printer
              </button>

              <button
                onClick={() => handleConfirmPrintSuccess(false)}
                className="w-full py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-semibold text-xs transition-all"
              >
                Tutup (Tetap Status Sedang Dicetak)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE WORK ORDER (SPK CETAK CETAKAN REVINA PRINT UNTUK HARDCOPY / DIKIRIM KE PRINTER) */}
      {(printingOrder || selectedOrder) && (
        <div className="hidden printable-work-order">
          {(() => {
            const po = printingOrder || selectedOrder!;
            return (
              <div className="p-8 max-w-2xl mx-auto font-sans text-black">
                <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-wider">REVINA PRINTING</h1>
                    <p className="text-xs">Surat Perintah Kerja (SPK) & Lembar Antrean Cetak</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold text-lg">#{po.id}</p>
                    <p className="text-xs">{new Date(po.createdAt).toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-6 border p-4 rounded">
                  <div>
                    <p className="font-bold text-gray-600">PELANGGAN:</p>
                    <p className="font-bold text-sm">{po.customerName}</p>
                    <p>WA: {po.whatsapp}</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-600">METODE / STATUS:</p>
                    <p className="font-bold text-sm">{po.deliveryMethod === 'PICKUP' ? 'AMBIL DI TOKO' : 'DELIVERY / KURIR'}</p>
                    <p>Status: {po.status}</p>
                  </div>
                </div>

                <table className="w-full text-xs border-collapse border border-black mb-6">
                  <thead>
                    <tr className="bg-gray-100 border-b border-black">
                      <th className="p-2 text-left border-r border-black">Spesifikasi</th>
                      <th className="p-2 text-left">Detail Rincian</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-bold border-r border-black">Nama File / Judul</td>
                      <td className="p-2 font-mono">{po.fileName}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-bold border-r border-black">Jenis Kertas</td>
                      <td className="p-2">{po.paperType} ({po.paperGramature || '70gr'})</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-bold border-r border-black">Mode Warna</td>
                      <td className="p-2">{po.colorMode === 'COLOR' ? 'Warna / Full Color' : 'Hitam Putih (B/W)'}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-bold border-r border-black">Muka Cetak</td>
                      <td className="p-2">{po.printMode === 'DOUBLE' ? 'Bolak-Balik (2 Sisi)' : 'Satu Sisi (1 Sisi)'}</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-bold border-r border-black">Jumlah Halaman & Copy</td>
                      <td className="p-2 font-bold">{po.pageCount} Halaman x {po.copyCount} Copy (Total {po.pageCount * po.copyCount} Lembar)</td>
                    </tr>
                    <tr className="border-b border-gray-300">
                      <td className="p-2 font-bold border-r border-black">Finishing</td>
                      <td className="p-2 font-bold">{FINISHING_LABELS[po.finishing]}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold border-r border-black">Catatan Tambahan</td>
                      <td className="p-2">{po.additionalNotes || 'Tidak Ada'}</td>
                    </tr>
                  </tbody>
                </table>

                <div className="border-t-2 border-black pt-4 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold">Total Pembayaran: {formatRupiah(po.grandTotal)}</p>
                    <p className="text-gray-500">Dicetak oleh Operator Admin Revina Print</p>
                  </div>
                  <div className="text-center">
                    <p className="mb-8 font-bold">Operator Cetak,</p>
                    <p className="underline">( .................................... )</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
