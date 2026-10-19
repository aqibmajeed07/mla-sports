import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, Truck, Download, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import SEO from '../../components/common/SEO';
import { formatPrice, formatDate, generateOrderId } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { generateOrderInvoicePDF } from '../../utils/invoiceGenerator';
import { useToast } from '../../components/common/Toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const toast = useToast();

  const fetchOrders = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.get('/api/orders?limit=50');
      setOrders(res.data?.orders || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(true);

    const channel = supabase
      .channel('user-orders-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        fetchOrders(false);
      })
      .on('broadcast', { event: 'order_changed' }, () => {
        fetchOrders(false);
      })
      .subscribe();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchOrders(false);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <PageLoader />;

  const getBadgeClass = (status) => {
    const color = STATUS_COLORS[status] || 'gray';
    return `badge-${color}`;
  };

  const handleDownloadInvoice = (e, order) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      toast.success('Generating official tax invoice PDF...');
      generateOrderInvoicePDF(order);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF invoice');
    }
  };

  return (
    <div className="page-container py-8">
      <SEO title="My Orders" path="/orders" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="page-title mb-1">My Orders &amp; Crafting Status</h1>
          <p className="text-sm text-gray-500">Track fulfillment of your Kashmir willow bats and download official invoices.</p>
        </div>
        <Link to="/track" className="btn-secondary text-xs inline-flex items-center gap-1.5 self-start sm:self-auto">
          <Truck className="w-4 h-4 text-primary-600" /> Track Any Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders yet"
          message="Start shopping to see your orders here."
          action={<Link to="/products" className="btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card p-6 hover:border-primary-500/30 transition-all">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Link to={`/orders/${order.id}`} className="flex-1 group">
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                      Order {generateOrderId(order.id)}
                    </p>
                    <span className={getBadgeClass(order.status)}>{order.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Placed on {formatDate(order.created_at)} • {order.order_items?.length || 0} item(s) • Total: <span className="font-bold text-gray-900 dark:text-white">{formatPrice(order.total_amount)}</span>
                  </p>

                  {order.expected_delivery_date && (
                    <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <Calendar className="w-3.5 h-3.5" />
                      Expected Delivery: <span className="font-bold">{order.expected_delivery_date}</span>
                      {order.courier_name && ` (${order.courier_name})`}
                    </div>
                  )}
                </Link>

                <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800">
                  <button
                    onClick={() => navigate(`/track/${order.id}`)}
                    className="btn-primary py-2 px-3 text-xs font-bold inline-flex items-center gap-1.5 shadow-sm"
                    title="Track Order Live"
                  >
                    <Truck className="w-3.5 h-3.5" /> Track Live
                  </button>

                  {(order.payment_status === 'verified' || ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status)) ? (
                    <button
                      onClick={(e) => handleDownloadInvoice(e, order)}
                      className="btn-secondary py-2 px-3 text-xs font-bold inline-flex items-center gap-1.5"
                      title="Download Official Tax Invoice PDF"
                    >
                      <Download className="w-3.5 h-3.5" /> Invoice
                    </button>
                  ) : (
                    <span
                      className="py-1.5 px-2.5 text-[10.5px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg"
                      title="Invoice available after admin payment verification"
                    >
                      Invoice Pending Verification
                    </span>
                  )}

                  <Link
                    to={`/orders/${order.id}`}
                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold px-2 py-2"
                  >
                    Details →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

