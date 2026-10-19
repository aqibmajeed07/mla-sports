import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  Calendar,
  MapPin,
  Download,
  ArrowLeft,
  Search,
  ExternalLink,
  ShieldCheck,
  Phone,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { PageLoader } from '../../components/common/Loader';
import SEO from '../../components/common/SEO';
import { formatPrice, formatDateTime, generateOrderId } from '../../utils/formatters';
import { generateOrderInvoicePDF } from '../../utils/invoiceGenerator';

const TRACKING_STAGES = [
  {
    key: 'Order Placed',
    title: 'Order Placed',
    desc: 'Order received & logged in MLA Sports workshop ledger.',
    icon: Package,
  },
  {
    key: 'Confirmed',
    title: 'Payment Verified & Confirmed',
    desc: 'UTR matched with bank statement. Kashmir willow blank allocated.',
    icon: ShieldCheck,
  },
  {
    key: 'Packed',
    title: 'Cured, Knocked & Packed',
    desc: 'Precision machine knocked (15,000 strikes) & weatherproof packaging applied.',
    icon: Sparkles,
  },
  {
    key: 'Shipped',
    title: 'Dispatched with Courier',
    desc: 'Handed over to carrier partner for express transit across India.',
    icon: Truck,
  },
  {
    key: 'Out for Delivery',
    title: 'Out for Delivery',
    desc: 'Courier agent out on route to your doorstep.',
    icon: MapPin,
  },
  {
    key: 'Delivered',
    title: 'Delivered',
    desc: 'Package successfully delivered. Ready for match play!',
    icon: CheckCircle2,
  },
];

const TrackOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [orderIdInput, setOrderIdInput] = useState(id || '');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(Boolean(id));
  const [searching, setSearching] = useState(false);
  const [userOrders, setUserOrders] = useState([]);

  // Fetch recent user orders if no ID is selected so they can choose easily
  useEffect(() => {
    const fetchRecentOrders = async () => {
      try {
        const res = await api.get('/api/orders?limit=5');
        setUserOrders(res.data?.orders || []);
      } catch (err) {
        // Not logged in or error
      }
    };
    fetchRecentOrders();
  }, []);

  const loadOrder = async (orderId) => {
    if (!orderId) return;
    const cleanId = orderId.trim().replace(/^#/, '').replace(/^ORD-/, '');
    setSearching(true);
    try {
      const res = await api.get(`/api/orders/track/${cleanId}`);
      setOrder(res.data);
    } catch (err) {
      toast.error(err.message || 'Order not found. Please check your tracking ID.');
      setOrder(null);
    } finally {
      setSearching(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadOrder(id);
    }
  }, [id]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) {
      toast.error('Please enter an Order ID');
      return;
    }
    navigate(`/track/${orderIdInput.trim()}`);
  };

  const handleDownloadInvoice = () => {
    if (!order) return;
    try {
      toast.success('Generating official tax invoice PDF...');
      generateOrderInvoicePDF(order);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate PDF invoice');
    }
  };

  const getStageIndex = (status) => {
    if (!status) return 0;
    if (status === 'Cancelled') return -1;
    const stageKeys = TRACKING_STAGES.map((s) => s.key);
    const idx = stageKeys.indexOf(status);
    if (idx !== -1) return idx;
    if (status === 'Processing') return 1;
    return 0;
  };

  const currentStageIdx = order ? getStageIndex(order.status) : 0;
  const isCancelled = order?.status === 'Cancelled';

  return (
    <div className="page-container py-10 min-h-[80vh]">
      <SEO
        title={order ? `Track Order #${order.id.slice(0, 8).toUpperCase()}` : 'Live Order Tracking'}
        path={id ? `/track/${id}` : '/track'}
      />

      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8 text-center sm:text-left sm:flex sm:items-center sm:justify-between gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white mb-2"
          >
            <ArrowLeft className="w-4 h-4" /> Go Back
          </button>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3">
            <Truck className="w-8 h-8 text-primary-600" /> Live Order Tracking
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time status of your Kashmir willow handcrafted cricket bats from Budgam workshop to your crease.
          </p>
        </div>

        {order && (
          (order.payment_status === 'verified' || ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status)) ? (
            <button
              onClick={handleDownloadInvoice}
              className="btn-primary mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider py-2.5 px-4 shadow-md cursor-pointer"
              id="track-download-invoice-btn"
            >
              <Download className="w-4 h-4" /> Download Official Invoice (PDF)
            </button>
          ) : (
            <div className="mt-4 sm:mt-0 inline-flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Tax Invoice generated upon payment verification</span>
            </div>
          )
        )}
      </div>

      {/* Search Bar / Order Selector */}
      <div className="max-w-4xl mx-auto mb-8">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Enter your Order ID (e.g. 83e1c52e... or full UUID)"
              className="input-field pl-11 text-sm font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={searching}
            className="btn-primary text-sm px-6 font-bold"
          >
            {searching ? 'Locating...' : 'Track'}
          </button>
        </form>

        {/* Quick chip selector for logged in user */}
        {userOrders.length > 0 && !id && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Your recent orders:</span>
            {userOrders.map((o) => (
              <button
                key={o.id}
                onClick={() => {
                  setOrderIdInput(o.id);
                  navigate(`/track/${o.id}`);
                }}
                className="text-xs font-mono px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-primary-50 dark:bg-gray-800 dark:hover:bg-primary-950/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200"
              >
                #{o.id.slice(0, 8).toUpperCase()} ({formatPrice(o.total_amount)})
              </button>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="max-w-4xl mx-auto py-12">
          <PageLoader />
        </div>
      ) : !order ? (
        <div className="max-w-4xl mx-auto card p-10 text-center">
          <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Track Any MLA Sports Order</h2>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Enter your Order ID from your confirmation email or order history to track fulfillment, crafting status, and delivery.
          </p>
          <Link to="/orders" className="btn-secondary text-sm">
            View My Order History
          </Link>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Status Alert Banner / Cancelled Warning */}
          {isCancelled ? (
            <div className="p-4 bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 rounded-2xl flex items-center gap-3 text-red-800 dark:text-red-300">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <p className="font-bold text-sm">This order has been cancelled.</p>
                <p className="text-xs">If you have any questions or require a refund status update, contact workshop support.</p>
              </div>
            </div>
          ) : (
            /* Expected Delivery & Courier Hero Card */
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-primary-950 text-white p-6 sm:p-8 shadow-xl border border-slate-700/60">
              <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-xs font-semibold uppercase tracking-wider mb-3">
                    <Clock className="w-3.5 h-3.5" /> Order Status: {order.status}
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    Placed on {formatDateTime(order.created_at)} • Payment: <span className="text-white font-semibold">{order.payment_method}</span>
                  </p>
                </div>

                {/* Delivery Date Spotlight Box */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 shrink-0 min-w-[260px]">
                  <div className="flex items-center gap-2 text-primary-300 text-xs font-bold uppercase tracking-wider mb-1">
                    <Calendar className="w-4 h-4" /> Estimated Delivery
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white">
                    {order.expected_delivery_date ? (
                      order.expected_delivery_date
                    ) : (
                      <span className="text-sm font-semibold text-slate-300">
                        Calculating (Pending Admin Verification)
                      </span>
                    )}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 text-xs text-slate-300">
                    Carrier: <span className="text-white font-bold">{order.courier_name || 'Express Insured Air Cargo'}</span>
                    {order.tracking_number && (
                      <div className="mt-0.5 font-mono text-[11px] text-amber-300">
                        AWB: {order.tracking_number}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Detailed Step-by-Step Progress Timeline */}
          {!isCancelled && (
            <div className="card p-6 sm:p-8">
              <div className="flex items-center justify-between mb-8 border-b border-gray-100 dark:border-gray-800 pb-4">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary-600" /> Fulfillment Timeline
                </h3>
                <span className="text-xs text-gray-500">
                  Step {Math.min(currentStageIdx + 1, TRACKING_STAGES.length)} of {TRACKING_STAGES.length}
                </span>
              </div>

              {/* Desktop Horizontal Stepper */}
              <div className="hidden md:block relative mb-12">
                <div className="flex justify-between items-center relative z-10">
                  {TRACKING_STAGES.map((stage, idx) => {
                    const isDone = idx <= currentStageIdx;
                    const isCurrent = idx === currentStageIdx;
                    const Icon = stage.icon;

                    return (
                      <div key={stage.key} className="flex flex-col items-center text-center flex-1 px-1">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                            isCurrent
                              ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 scale-110 ring-4 ring-primary-100 dark:ring-primary-950'
                              : isDone
                              ? 'bg-emerald-600 text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 border border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <p
                          className={`text-xs font-bold mt-3 leading-snug ${
                            isCurrent
                              ? 'text-primary-600 dark:text-primary-400'
                              : isDone
                              ? 'text-gray-900 dark:text-white'
                              : 'text-gray-400'
                          }`}
                        >
                          {stage.title}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Progress Line */}
                <div className="absolute top-6 left-8 right-8 h-1 bg-gray-200 dark:bg-gray-700 -z-0">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-primary-600 transition-all duration-700"
                    style={{
                      width: `${(Math.max(0, currentStageIdx) / (TRACKING_STAGES.length - 1)) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Vertical Detailed Steps */}
              <div className="space-y-6 relative pl-6 before:content-[''] before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                {TRACKING_STAGES.map((stage, idx) => {
                  const isDone = idx <= currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  const Icon = stage.icon;

                  return (
                    <div key={stage.key} className="relative flex items-start gap-4">
                      {/* Node Bullet */}
                      <div
                        className={`absolute -left-6 w-6 h-6 rounded-full flex items-center justify-center text-xs transition-colors ${
                          isCurrent
                            ? 'bg-primary-600 text-white ring-4 ring-primary-100 dark:ring-primary-950'
                            : isDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                        }`}
                      >
                        {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                      </div>

                      <div
                        className={`flex-1 p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-primary-50/50 dark:bg-primary-950/20 border-primary-300 dark:border-primary-800'
                            : isDone
                            ? 'bg-gray-50 dark:bg-gray-800/40 border-gray-200 dark:border-gray-800'
                            : 'opacity-50 border-dashed border-gray-200 dark:border-gray-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                            <Icon className="w-4 h-4 text-primary-600" />
                            {stage.title}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-primary-600 text-white self-start sm:self-auto">
                              Active Stage
                            </span>
                          )}
                          {isDone && !isCurrent && (
                            <span className="text-[10px] uppercase font-semibold text-emerald-600 dark:text-emerald-400">
                              Completed
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {stage.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Two Columns: Ordered Items & Shipping Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ordered Bats Summary */}
            <div className="card p-6">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-4">
                Items in This Shipment ({order.order_items?.length || 0})
              </h3>
              <div className="space-y-3">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                    {item.products?.image_urls?.[0] && (
                      <img
                        src={item.products.image_urls[0]}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                        {item.product_name}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Qty: {item.quantity} • {formatPrice(item.price)} each
                      </p>
                    </div>
                    <span className="text-xs font-bold text-gray-900 dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-600 dark:text-gray-400">Total Paid:</span>
                <span className="font-black text-base text-gray-900 dark:text-white">
                  {formatPrice(order.total_amount)}
                </span>
              </div>
            </div>

            {/* Destination & Workshop Contact Card */}
            <div className="space-y-4">
              {order.addresses && (
                <div className="card p-6">
                  <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" /> Delivery Address
                  </h3>
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{order.addresses.full_name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {order.addresses.address1} {order.addresses.address2 && `, ${order.addresses.address2}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {order.addresses.city}, {order.addresses.state} - {order.addresses.pincode}
                  </p>
                  <p className="text-xs text-primary-600 font-semibold mt-1">
                    Contact: {order.addresses.phone}
                  </p>
                </div>
              )}

              {/* Direct Workshop Support Card (MLA Sports Store Support) */}
              <div className="card p-6 bg-slate-900 text-white border border-slate-800">
                <h4 className="font-bold text-sm mb-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-400" /> MLA Sports Workshop Support
                </h4>
                <p className="text-xs text-slate-300 mb-3">
                  Direct store support with proprietor Syed Manzoor Mosvi in Mirgund, Budgam for dispatch and delivery updates.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <a
                    href="tel:+917889515654"
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold flex items-center gap-1.5"
                  >
                    Call: +91 7889515654
                  </a>
                  <a
                    href="mailto:mlasportsbudgam@gmail.com"
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 font-semibold"
                  >
                    mlasportsbudgam@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrackOrderPage;
