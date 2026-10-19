import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  RefreshCw,
  Radio,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Phone,
  Mail,
  User,
  Calendar,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import SEO from '../../components/common/SEO';
import { useToast } from '../../components/common/Toast';
import { formatPrice, formatDate, generateOrderId } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { useDebounce } from '../../hooks/useDebounce';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [lastSync, setLastSync] = useState(new Date());
  const [realtimeActive, setRealtimeActive] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const debouncedSearch = useDebounce(search, 300);
  const isInitialMount = useRef(true);
  const toast = useToast();

  const handleQuickStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId.slice(0, 8).toUpperCase()} updated to "${newStatus}"`);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      fetchOrders(false);
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const fetchOrders = useCallback(async (showLoader = false) => {
    if (showLoader) {
      setLoading(true);
    } else {
      setRefreshing(true);
    }

    try {
      const params = new URLSearchParams();
      if (debouncedSearch) params.set('search', debouncedSearch);
      if (statusFilter) params.set('status', statusFilter);
      params.set('limit', '100');

      const res = await api.get(`/api/orders/all?${params.toString()}`);
      const fetchedList = res.data?.orders || res.orders || [];
      setOrders(fetchedList);
      setLastSync(new Date());
    } catch (error) {
      console.error('[AdminOrdersPage] fetchOrders error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [debouncedSearch, statusFilter]);

  // Initial fetch and on search/filter changes
  useEffect(() => {
    fetchOrders(isInitialMount.current);
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [fetchOrders]);

  // Real-time Supabase Subscription & 4-second Polling Fallback
  useEffect(() => {
    // 1. Supabase Realtime Channel
    const channel = supabase
      .channel('admin-orders-live-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          console.log('[Admin Realtime] orders postgres_changes event:', payload.eventType);
          fetchOrders(false);
        }
      )
      .on(
        'broadcast',
        { event: 'order_changed' },
        (payload) => {
          console.log('[Admin Realtime] order_changed broadcast received:', payload);
          fetchOrders(false);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeActive(true);
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setRealtimeActive(false);
        }
      });

    // 2. Fallback Polling interval (every 4 seconds) to guarantee real-time updates even if WS disconnects
    const pollInterval = setInterval(() => {
      // Only poll if document is visible to save battery/bandwidth
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchOrders(false);
      }
    }, 4000);

    return () => {
      clearInterval(pollInterval);
      supabase.removeChannel(channel);
    };
  }, [fetchOrders]);

  const statuses = [
    'Order Placed',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  // Quick stats
  const totalCount = orders.length;
  const pendingPaymentCount = orders.filter((o) => o.payment_status === 'pending_verification').length;
  const confirmedCount = orders.filter((o) => o.status === 'Confirmed').length;
  const transitCount = orders.filter((o) => ['Packed', 'Shipped', 'Out for Delivery'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'Delivered').length;

  // Filter orders by payment status in-memory if paymentFilter is active
  const displayedOrders = paymentFilter
    ? orders.filter((o) => o.payment_status === paymentFilter)
    : orders;

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      <SEO title="Manage Orders | Realtime Sync" path="/admin/orders" />

      {/* Top Header & Real-time Indicator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="page-title mb-0">Orders Management</h1>
            {/* Realtime Status Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-all ${
                realtimeActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
              }`}
              title={realtimeActive ? 'Connected to Supabase Realtime channel' : 'Syncing via high-frequency background polling'}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  realtimeActive ? 'bg-emerald-500 animate-ping' : 'bg-amber-500 animate-pulse'
                }`}
              />
              <Radio className="w-3.5 h-3.5" />
              {realtimeActive ? 'Live Realtime' : 'Live Syncing'}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Realtime database sync active • Last synced at{' '}
            <span className="font-mono text-gray-700 dark:text-gray-300">
              {lastSync.toLocaleTimeString()}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchOrders(false)}
            disabled={refreshing}
            className="btn-secondary py-2 px-3 text-xs font-semibold inline-flex items-center gap-2 shadow-sm hover:border-primary-500 transition-all"
            id="admin-refresh-orders-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-primary-500' : ''}`} />
            {refreshing ? 'Syncing...' : 'Refresh Now'}
          </button>
        </div>
      </div>

      {/* Quick Filter Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => {
            setStatusFilter('');
            setPaymentFilter('');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            !statusFilter && !paymentFilter
              ? 'bg-primary-50 dark:bg-primary-950/40 border-primary-500 ring-1 ring-primary-500'
              : 'card hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>All Orders</span>
            <ShoppingBag className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{totalCount}</p>
        </button>

        <button
          onClick={() => {
            setPaymentFilter(paymentFilter === 'pending_verification' ? '' : 'pending_verification');
          }}
          className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden ${
            paymentFilter === 'pending_verification'
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-1 ring-amber-500'
              : 'card hover:border-amber-300 dark:hover:border-amber-700/50'
          }`}
        >
          {pendingPaymentCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>Verify UTR</span>
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
          <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
            {pendingPaymentCount}
          </p>
        </button>

        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'Confirmed' ? '' : 'Confirmed');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'Confirmed'
              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 ring-1 ring-blue-500'
              : 'card hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Confirmed</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{confirmedCount}</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'Shipped' ? '' : 'Shipped');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'Shipped'
              ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500 ring-1 ring-purple-500'
              : 'card hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>In Transit</span>
            <Truck className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{transitCount}</p>
        </button>

        <button
          onClick={() => {
            setStatusFilter(statusFilter === 'Delivered' ? '' : 'Delivered');
          }}
          className={`p-3 rounded-xl border text-left transition-all ${
            statusFilter === 'Delivered'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500'
              : 'card hover:border-gray-300 dark:hover:border-gray-700'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>Delivered</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">{deliveredCount}</p>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order ID (#83E1C52E), customer, phone, or UTR number..."
            className="input-field pl-9 py-2 text-sm"
            id="admin-order-search"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field py-2 text-sm sm:w-44"
            id="order-status-filter"
          >
            <option value="">All Fulfillment</option>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="input-field py-2 text-sm sm:w-44"
            id="order-payment-filter"
          >
            <option value="">All Payments</option>
            <option value="pending_verification">Review Pending (UTR)</option>
            <option value="verified">Verified &amp; Paid</option>
            <option value="rejected">Rejected Proof</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      {displayedOrders.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="No orders found"
          message={
            search || statusFilter || paymentFilter
              ? 'No orders match your active filter criteria. Try clearing search or filters.'
              : 'Orders will appear here automatically in real time as soon as customers place them.'
          }
          action={
            (search || statusFilter || paymentFilter) && (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('');
                  setPaymentFilter('');
                }}
                className="btn-secondary text-xs"
              >
                Clear All Filters
              </button>
            )
          }
        />
      ) : (
        <div className="card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-800 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="py-3.5 px-4">Order ID</th>
                  <th className="py-3.5 px-4">Customer Details</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Date &amp; Delivery</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Payment Verification</th>
                  <th className="py-3.5 px-4 text-center">Fulfillment</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {displayedOrders.map((order) => {
                  const isPendingPayment = order.payment_status === 'pending_verification';
                  const isVerifiedPayment = order.payment_status === 'verified';
                  const isRejectedPayment = order.payment_status === 'rejected';

                  const customerName =
                    order.profiles?.full_name || order.addresses?.full_name || 'Customer';
                  const customerEmail = order.profiles?.email;
                  const customerPhone =
                    order.profiles?.phone || order.addresses?.phone;

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/40 transition-colors ${
                        isPendingPayment
                          ? 'bg-amber-500/5 border-l-4 border-l-amber-500'
                          : ''
                      }`}
                    >
                      {/* Order ID */}
                      <td className="py-3.5 px-4 font-medium text-gray-900 dark:text-white align-top">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="font-mono font-bold text-primary-600 dark:text-primary-400 hover:underline inline-flex items-center gap-1"
                        >
                          {generateOrderId(order.id)}
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {order.order_items?.length || 1} item(s)
                        </p>
                      </td>

                      {/* Customer */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span>{customerName}</span>
                        </div>
                        {customerPhone && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5 mt-0.5">
                            <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                            <span>{customerPhone}</span>
                          </div>
                        )}
                        {customerEmail && (
                          <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5 truncate max-w-[200px]">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate">{customerEmail}</span>
                          </div>
                        )}
                      </td>

                      {/* Date & Expected Delivery */}
                      <td className="py-3.5 px-4 hidden md:table-cell text-xs text-gray-500 dark:text-gray-400 align-top">
                        <div className="font-medium text-gray-700 dark:text-gray-300">
                          {formatDate(order.created_at)}
                        </div>
                        {order.expected_delivery_date ? (
                          <div className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <Calendar className="w-3 h-3" />
                            <span>Est: {order.expected_delivery_date}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-gray-400 block mt-1">
                            Est. Delivery not set
                          </span>
                        )}
                      </td>

                      {/* Total Amount & Method */}
                      <td className="py-3.5 px-4 text-right align-top">
                        <span className="font-bold text-gray-900 dark:text-white text-base">
                          {formatPrice(order.total_amount)}
                        </span>
                        <div className="text-[11px] text-gray-400 mt-0.5 font-medium">
                          {order.payment_method || 'UPI / QR'}
                        </div>
                      </td>

                      {/* Payment Verification Status */}
                      <td className="py-3.5 px-4 text-center align-top">
                        {isPendingPayment && (
                          <div className="inline-flex flex-col items-center">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              Review Proof
                            </span>
                            {order.payment_id && (
                              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 mt-1 max-w-[120px] truncate" title={`UTR: ${order.payment_id}`}>
                                UTR: {order.payment_id}
                              </span>
                            )}
                          </div>
                        )}

                        {isVerifiedPayment && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            Verified &amp; Paid
                          </span>
                        )}

                        {isRejectedPayment && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-800/50">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            Rejected
                          </span>
                        )}

                        {!isPendingPayment && !isVerifiedPayment && !isRejectedPayment && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            {order.payment_status || 'Pending'}
                          </span>
                        )}
                      </td>

                      {/* Fulfillment Status & Quick Dispatcher */}
                      <td className="py-3.5 px-4 text-center align-top">
                        <div className="inline-flex flex-col items-center gap-1">
                          <select
                            value={order.status}
                            onChange={(e) => handleQuickStatusUpdate(order.id, e.target.value)}
                            disabled={updatingOrderId === order.id}
                            className="text-xs font-semibold py-1 px-2.5 rounded-lg border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 cursor-pointer shadow-xs transition-all disabled:opacity-50"
                            title="Update status (e.g. Going for Delivery, Packed, Delivered)"
                          >
                            {statuses.map((s) => (
                              <option key={s} value={s}>
                                {s === 'Out for Delivery' ? '🚚 Going for Delivery' : s}
                              </option>
                            ))}
                          </select>
                          {order.status === 'Out for Delivery' && (
                            <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1 animate-pulse">
                              <Truck className="w-3 h-3" /> Going for Delivery
                            </span>
                          )}
                          {order.status === 'Shipped' && (
                            <span className="text-[10px] font-medium text-purple-500">
                              In Transit
                            </span>
                          )}
                          {order.status === 'Delivered' && (
                            <span className="text-[10px] font-medium text-emerald-500 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Delivered
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right align-top">
                        {isPendingPayment ? (
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="btn-primary py-1 px-2.5 text-xs font-bold inline-flex items-center gap-1 shadow-sm whitespace-nowrap"
                          >
                            Verify
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        ) : (
                          <Link
                            to={`/admin/orders/${order.id}`}
                            className="btn-secondary py-1 px-2.5 text-xs font-medium inline-flex items-center gap-1 hover:text-primary-600"
                          >
                            Details
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrdersPage;
