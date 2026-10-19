import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ShieldCheck,
  Mail,
  Phone,
  Settings,
  Truck,
  CheckCircle2,
  Package,
  Clock,
  ArrowRight,
  RefreshCw,
  ShoppingBag,
} from 'lucide-react';
import SEO from '../../components/common/SEO';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { APP_NAME, OWNER_NAME, LOCATION, PHONE } from '../../utils/constants';
import { formatPrice, generateOrderId } from '../../utils/formatters';

const SettingsPage = () => {
  const { adminUser, profile } = useAuth();
  const toast = useToast();
  const [activeOrders, setActiveOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchActiveOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await api.get('/api/orders/all?limit=10');
      const orders = res.data?.orders || res.orders || [];
      setActiveOrders(orders);
    } catch (err) {
      console.error('[SettingsPage] Error fetching active orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    fetchActiveOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.put(`/api/orders/${orderId}/status`, { status: newStatus });
      toast.success(`Order #${orderId.slice(0, 8).toUpperCase()} updated to "${newStatus}"!`);
      setActiveOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      toast.error(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const statuses = [
    'Order Placed',
    'Confirmed',
    'Packed',
    'Shipped',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
  ];

  return (
    <div className="space-y-8 max-w-5xl">
      <SEO title="Admin Profile &amp; Settings" path="/admin/settings" />

      <div>
        <h1 className="page-title mb-1">Admin Profile &amp; Store Operations</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Manage administrator profile details, dispatch fulfillment statuses, and store settings.
        </p>
      </div>

      {/* 1. Admin Profile Card */}
      <div className="card p-6 border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 text-white flex items-center justify-center font-extrabold text-2xl shadow-md border-2 border-primary-400/30">
              {(adminUser?.full_name || profile?.full_name || 'Aqib Majeed')
                .charAt(0)
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {adminUser?.full_name || profile?.full_name || 'Aqib Majeed'}
                </h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 uppercase">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  {adminUser?.role || 'Super Admin'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 font-mono">
                @{adminUser?.username || 'aqib'} · Authorized System Administrator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Active Admin Session
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-sm">
          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 block mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-gray-400" /> Official Email
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {adminUser?.email || 'miraqib12@gmail.com'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 block mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> Contact Phone
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              +91 {adminUser?.phone || '9103696238'}
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <span className="text-xs text-gray-400 block mb-1 flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5 text-gray-400" /> Platform Role
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              Master Full-Access Administrator
            </span>
          </div>
        </div>
      </div>

      {/* 2. Order Fulfillment Status Management Panel */}
      <div className="card p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Quick Order Status &amp; Delivery Management
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Quickly update order status to <strong>&ldquo;Going for Delivery&rdquo;</strong>, <strong>&ldquo;Shipped&rdquo;</strong>, or <strong>&ldquo;Delivered&rdquo;</strong>.
              Customers automatically receive live in-app notifications and email alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchActiveOrders}
              disabled={loadingOrders}
              className="btn-secondary py-1.5 px-3 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
              <span>Refresh Orders</span>
            </button>
            <Link
              to="/admin/orders"
              className="btn-primary py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1"
            >
              <span>All Orders Table</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {loadingOrders ? (
          <div className="py-8 text-center text-sm text-gray-500">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary-500" />
            Loading active orders...
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="py-8 text-center text-sm text-gray-500">
            <ShoppingBag className="w-8 h-8 mx-auto mb-2 text-gray-400 opacity-60" />
            No orders found in database.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800/60">
            {activeOrders.map((order) => {
              const customerName =
                order.profiles?.full_name || order.addresses?.full_name || 'Customer';
              const isGoingForDelivery = order.status === 'Out for Delivery';

              return (
                <div
                  key={order.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 p-2 rounded-xl transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5">
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-mono font-bold text-primary-600 dark:text-primary-400 hover:underline text-sm"
                      >
                        {generateOrderId(order.id)}
                      </Link>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm">
                        {customerName}
                      </span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="font-bold text-gray-900 dark:text-white text-sm">
                        {formatPrice(order.total_amount)}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span>Status:</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded-md ${
                          isGoingForDelivery
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold animate-pulse'
                            : order.status === 'Delivered'
                            ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                            : order.status === 'Shipped'
                            ? 'bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {order.status}
                      </span>
                      {order.courier_name && (
                        <span>· Courier: {order.courier_name}</span>
                      )}
                      {order.expected_delivery_date && (
                        <span>· Est. Arrival: {order.expected_delivery_date}</span>
                      )}
                    </div>
                  </div>

                  {/* Actions for Status Update */}
                  <div className="flex items-center gap-2 shrink-0">
                    <select
                      value={order.status}
                      onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                      disabled={updatingId === order.id}
                      className="input-field py-1 px-2.5 text-xs font-semibold w-40"
                    >
                      {statuses.map((s) => (
                        <option key={s} value={s}>
                          {s === 'Out for Delivery' ? '🚚 Going for Delivery' : s}
                        </option>
                      ))}
                    </select>

                    {order.status !== 'Out for Delivery' && order.status !== 'Delivered' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Out for Delivery')}
                        disabled={updatingId === order.id}
                        className="btn-primary py-1 px-2.5 text-xs font-bold inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-xs"
                        title="Mark status as Going for Delivery immediately"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Going for Delivery</span>
                      </button>
                    )}

                    {order.status !== 'Delivered' && (
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'Delivered')}
                        disabled={updatingId === order.id}
                        className="btn-secondary py-1 px-2.5 text-xs font-semibold inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500"
                        title="Mark order as delivered"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Delivered</span>
                      </button>
                    )}

                    <Link
                      to={`/admin/orders/${order.id}`}
                      className="btn-secondary py-1 px-2 text-xs font-medium text-gray-600 dark:text-gray-300"
                    >
                      View
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. Store Information Card */}
      <div className="card p-6 border border-gray-200 dark:border-gray-800 shadow-sm">
        <h2 className="section-title flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-primary-500" />
          Workshop &amp; Store Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
              Store Brand
            </label>
            <p className="font-semibold text-gray-900 dark:text-white">{APP_NAME}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
              Master Craftsperson &amp; Owner
            </label>
            <p className="font-semibold text-gray-900 dark:text-white">{OWNER_NAME}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
              Workshop Location
            </label>
            <p className="font-semibold text-gray-900 dark:text-white">{LOCATION}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-0.5">
              Store Inquiries Phone
            </label>
            <p className="font-semibold text-gray-900 dark:text-white">+91 {PHONE}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
