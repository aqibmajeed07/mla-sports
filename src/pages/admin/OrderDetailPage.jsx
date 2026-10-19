import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CheckCircle,
  XCircle,
  ExternalLink,
  Copy,
  Check,
  Eye,
  X,
  CreditCard,
  ShieldCheck,
  AlertTriangle,
  Download,
  Calendar,
  Truck,
  FileText,
  Package,
} from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { PageLoader } from '../../components/common/Loader';
import SEO from '../../components/common/SEO';
import { formatPrice, formatDateTime, generateOrderId } from '../../utils/formatters';
import { STATUS_COLORS } from '../../utils/constants';
import { generateOrderInvoicePDF } from '../../utils/invoiceGenerator';

const AdminOrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('Transaction reference (UTR) not found in bank statement.');
  const [previewImage, setPreviewImage] = useState(null);
  const [copiedUtr, setCopiedUtr] = useState(false);

  // Expected Delivery & Courier states
  const [expectedDate, setExpectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [courierName, setCourierName] = useState('Delhivery Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/orders/${id}`);
      setOrder(res.data);
      if (res.data.expected_delivery_date) {
        setExpectedDate(res.data.expected_delivery_date);
      }
      if (res.data.courier_name) {
        setCourierName(res.data.courier_name);
      }
      if (res.data.tracking_number) {
        setTrackingNumber(res.data.tracking_number);
      }
    } catch (error) {
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const updateStatus = async (newStatus, extraParams = {}) => {
    setUpdating(true);
    try {
      await api.put(`/api/orders/${id}/status`, {
        status: newStatus,
        expected_delivery_date: extraParams.expected_delivery_date || expectedDate,
        courier_name: extraParams.courier_name || courierName,
        tracking_number: extraParams.tracking_number || trackingNumber,
      });
      toast.success(`Order status updated to "${newStatus}"! Notification sent.`);
      fetchOrder();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleOpenVerifyModal = () => {
    if (order?.expected_delivery_date) {
      setExpectedDate(order.expected_delivery_date);
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 5);
      setExpectedDate(d.toISOString().split('T')[0]);
    }
    if (order?.courier_name) setCourierName(order.courier_name);
    if (order?.tracking_number) setTrackingNumber(order.tracking_number);
    setVerifyModalOpen(true);
  };

  const handleConfirmVerifyPayment = async () => {
    if (!expectedDate) {
      toast.error('Please specify an expected delivery date for the customer.');
      return;
    }
    setVerifyingPayment(true);
    try {
      await api.put(`/api/orders/${id}/verify-payment`, {
        action: 'verify',
        expected_delivery_date: expectedDate,
        courier_name: courierName,
        tracking_number: trackingNumber,
        notes: adminNotes,
      });
      toast.success('Payment verified! Expected delivery date set and notifications sent.');
      setVerifyModalOpen(false);
      fetchOrder();
    } catch (error) {
      toast.error(error.message || 'Failed to verify payment');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleRejectPayment = async () => {
    setVerifyingPayment(true);
    try {
      await api.put(`/api/orders/${id}/verify-payment`, {
        action: 'reject',
        notes: rejectReason,
      });
      toast.success('Payment rejected. Email notification sent to customer.');
      setRejectModalOpen(false);
      fetchOrder();
    } catch (error) {
      toast.error(error.message || 'Failed to reject payment');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const copyUtr = (utr) => {
    if (!utr) return;
    navigator.clipboard.writeText(utr);
    setCopiedUtr(true);
    toast.success('Transaction ID copied to clipboard');
    setTimeout(() => setCopiedUtr(false), 2000);
  };

  const handleDownloadInvoice = () => {
    try {
      toast.success('Generating official tax invoice PDF...');
      generateOrderInvoicePDF(order);
    } catch (err) {
      console.error('Invoice error:', err);
      toast.error('Failed to generate PDF invoice');
    }
  };

  const setQuickDate = (days) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    setExpectedDate(d.toISOString().split('T')[0]);
  };

  if (loading) return <PageLoader />;
  if (!order) return null;

  const address = order.addresses;
  const statuses = ['Order Placed', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];
  const currentIdx = statuses.indexOf(order.status);
  const nextStatus = currentIdx >= 0 && currentIdx < statuses.length - 1 ? statuses[currentIdx + 1] : null;

  const isUPI = order.payment_method?.includes('UPI') || order.payment_method?.includes('QR');
  const isVerified = order.payment_status === 'verified';
  const isRejected = order.payment_status === 'rejected';

  return (
    <div>
      <SEO title={`Order ${generateOrderId(order.id)}`} path={`/admin/orders/${order.id}`} />

      {/* Top action bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('/admin/orders')}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <button
          onClick={handleDownloadInvoice}
          className="btn-primary inline-flex items-center gap-2 text-sm shadow-md cursor-pointer"
          id="download-invoice-btn"
        >
          <Download className="w-4 h-4" /> Download Official PDF Invoice
        </button>
      </div>

      {/* Order Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order {generateOrderId(order.id)}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge-${STATUS_COLORS[order.status] || 'gray'} text-sm px-4 py-1.5`}>
            {order.status}
          </span>
          {isVerified ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
              Payment Verified
            </span>
          ) : isRejected ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 border border-red-500/20">
              Payment Rejected
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
              Payment Pending Check
            </span>
          )}
        </div>
      </div>

      {/* Comprehensive Order Fulfillment & Delivery Status Management */}
      <div className="card p-6 mb-6 border border-gray-200 dark:border-gray-800 shadow-sm print:hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              <h2 className="text-base font-bold text-gray-900 dark:text-white">
                Order Fulfillment &amp; Delivery Management
              </h2>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Current Status:{' '}
              <span className="font-bold text-gray-900 dark:text-white">{order.status}</span>
              {order.status === 'Out for Delivery' && (
                <span className="ml-2 text-amber-500 font-bold animate-pulse">
                  (Going for Delivery today)
                </span>
              )}
            </p>
          </div>

          {/* Quick 1-Click Status Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {order.status !== 'Packed' && order.status !== 'Delivered' && (
              <button
                onClick={() => updateStatus('Packed')}
                disabled={updating}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold inline-flex items-center gap-1.5"
                title="Mark items as knocked and packed in thermal bat sleeve"
              >
                <Package className="w-3.5 h-3.5 text-blue-500" />
                <span>Mark Packed</span>
              </button>
            )}

            {order.status !== 'Shipped' && order.status !== 'Delivered' && (
              <button
                onClick={() => updateStatus('Shipped')}
                disabled={updating}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold inline-flex items-center gap-1.5"
                title="Mark order as dispatched with courier"
              >
                <Truck className="w-3.5 h-3.5 text-purple-500" />
                <span>Mark Shipped</span>
              </button>
            )}

            {order.status !== 'Out for Delivery' && order.status !== 'Delivered' && (
              <button
                onClick={() => updateStatus('Out for Delivery')}
                disabled={updating}
                className="btn-primary py-1.5 px-3 text-xs font-bold inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-white border-amber-600 shadow-sm"
                title="Update status to Going for Delivery / Out for Delivery"
                id="btn-out-for-delivery"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>🚚 Going for Delivery</span>
              </button>
            )}

            {order.status !== 'Delivered' && (
              <button
                onClick={() => updateStatus('Delivered')}
                disabled={updating}
                className="btn-secondary py-1.5 px-3 text-xs font-semibold inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:border-emerald-500"
                title="Mark as successfully handed over to customer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark Delivered</span>
              </button>
            )}

            {order.status !== 'Cancelled' && order.status !== 'Delivered' && (
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to cancel this order?')) {
                    updateStatus('Cancelled');
                  }
                }}
                disabled={updating}
                className="btn-danger py-1.5 px-3 text-xs font-medium"
              >
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Change to Any Status & Dispatch Details Form */}
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Change Status To:
            </label>
            <select
              value={order.status}
              onChange={(e) => updateStatus(e.target.value)}
              disabled={updating}
              className="input-field py-1.5 text-xs font-semibold"
            >
              <option value="Order Placed">Order Placed</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Packed">Packed</option>
              <option value="Shipped">Shipped</option>
              <option value="Out for Delivery">🚚 Going for Delivery (Out for Delivery)</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Courier Partner:
            </label>
            <input
              type="text"
              value={courierName}
              onChange={(e) => setCourierName(e.target.value)}
              placeholder="e.g. Delhivery, DTDC, Speed Post"
              className="input-field py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
              Tracking / AWB Number:
            </label>
            <input
              type="text"
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="e.g. DEL-982347102"
              className="input-field py-1.5 text-xs"
            />
          </div>

          <div>
            <button
              onClick={() => updateStatus(order.status, { courier_name: courierName, tracking_number: trackingNumber, expected_delivery_date: expectedDate })}
              disabled={updating}
              className="btn-secondary py-1.5 px-3 text-xs font-semibold w-full flex items-center justify-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-primary-500" />
              <span>{updating ? 'Saving...' : 'Save Courier & Tracking'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items Table */}
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 dark:text-white mb-4">Ordered Items</h2>
            <div className="space-y-3">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    {item.products?.image_urls?.[0] && (
                      <img
                        src={item.products.image_urls[0]}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">
                        {item.product_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between text-base">
              <span className="font-semibold text-gray-700 dark:text-gray-300">Total Amount</span>
              <span className="font-extrabold text-xl text-gray-900 dark:text-white">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>

          {/* Payment Verification & Proof Center */}
          <div className="card p-6 border-2 border-primary-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary-600" />
                <h2 className="text-base font-bold text-gray-900 dark:text-white">
                  Payment Verification &amp; Proof
                </h2>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    : isRejected
                    ? 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {order.payment_status || 'Pending Check'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-[11px] font-semibold text-gray-500 uppercase block">Payment Method</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">{order.payment_method}</span>
              </div>

              <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <span className="text-[11px] font-semibold text-gray-500 uppercase block">Transaction Reference / UTR</span>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-sm font-mono font-bold text-primary-600 dark:text-primary-400">
                    {order.payment_id || 'Not provided'}
                  </span>
                  {order.payment_id && (
                    <button
                      type="button"
                      onClick={() => copyUtr(order.payment_id)}
                      className="text-xs text-gray-500 hover:text-gray-900 dark:hover:text-white p-1"
                      title="Copy UTR"
                    >
                      {copiedUtr ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Proof Screenshot Section */}
            <div className="mb-6">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase block mb-2">
                Customer Payment Receipt Screenshot:
              </span>

              {order.payment_proof_url ? (
                <div className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div
                    className="relative cursor-pointer group rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shrink-0"
                    onClick={() => setPreviewImage(order.payment_proof_url)}
                  >
                    <img
                      src={order.payment_proof_url}
                      alt="Payment Proof"
                      className="w-28 h-28 object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                      <Eye className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white">
                      Proof Image Uploaded
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Uploaded by customer to secure Supabase container. Click image or button below to inspect full receipt.
                    </p>
                    <button
                      type="button"
                      onClick={() => setPreviewImage(order.payment_proof_url)}
                      className="inline-flex items-center gap-1.5 text-xs text-primary-600 font-bold hover:underline pt-1 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Full Resolution Screenshot
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-center text-xs text-gray-500">
                  No payment screenshot has been uploaded for this order yet.
                </div>
              )}
            </div>

            {/* Expected Delivery & Courier Info (If already verified or set) */}
            {order.expected_delivery_date && (
              <div className="mb-6 p-4 bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg text-emerald-700 dark:text-emerald-300">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                      Confirmed Delivery Schedule
                    </span>
                    <p className="text-sm font-extrabold text-gray-900 dark:text-white">
                      Expected Arrival: <span className="text-emerald-600 dark:text-emerald-400">{order.expected_delivery_date}</span>
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mt-0.5">
                      Carrier: <span className="font-semibold">{order.courier_name || 'Express Courier'}</span>
                      {order.tracking_number ? ` • Tracking AWB: ${order.tracking_number}` : ' • AWB will update upon pickup'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleOpenVerifyModal}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:underline px-2 py-1 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700 shrink-0 self-start sm:self-auto"
                >
                  Edit Delivery Info
                </button>
              </div>
            )}

            {/* Admin Verification Action Buttons */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={verifyingPayment}
                onClick={handleOpenVerifyModal}
                className="btn-primary py-2.5 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer shadow-md"
                id="verify-payment-btn"
              >
                <CheckCircle className="w-4 h-4" />
                {isVerified ? 'Update Delivery & Confirm Again' : 'Verify Payment & Enter Delivery Date'}
              </button>

              <button
                type="button"
                disabled={verifyingPayment}
                onClick={() => setRejectModalOpen(true)}
                className="btn-danger py-2.5 px-4 text-xs font-bold uppercase tracking-wider inline-flex items-center gap-2 cursor-pointer"
                id="reject-payment-btn"
              >
                <XCircle className="w-4 h-4" />
                {isRejected ? 'Update Rejection Note' : 'Reject Payment Proof'}
              </button>
            </div>
          </div>
        </div>

        {/* Customer & Address Details */}
        <div className="space-y-4">
          <div className="card p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-3 text-sm">Customer Details</h3>
            <p className="text-sm text-gray-900 dark:text-white font-bold">{order.profiles?.full_name}</p>
            <p className="text-xs text-gray-500 mt-1">{order.profiles?.email}</p>
            <p className="text-xs text-gray-500">{order.profiles?.phone || 'No phone registered'}</p>
          </div>

          {address && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4 text-primary-600" /> Delivery Address
              </h3>
              <p className="text-xs text-gray-800 dark:text-gray-200 font-semibold">{address.full_name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {address.address1}
                {address.address2 && `, ${address.address2}`}
              </p>
              <p className="text-xs text-gray-500">
                {address.city}, {address.state} - {address.pincode}
              </p>
              <p className="text-xs font-semibold text-primary-600 mt-1">Recipient Phone: {address.phone}</p>
            </div>
          )}

          {order.order_notes && (
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-sm">Workshop Instructions</h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 italic">{order.order_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden shadow-2xl p-2 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black text-white p-2 rounded-full cursor-pointer z-10"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImage}
              alt="Full Resolution Payment Proof"
              className="max-h-[80vh] w-auto mx-auto object-contain rounded-xl"
            />
            <div className="p-3 text-center">
              <a
                href={previewImage}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1 font-semibold"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Open in New Browser Tab
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Verify Payment & Enter Expected Delivery Date Modal */}
      {verifyModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
              <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle className="w-6 h-6" />
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Verify Payment & Set Delivery</h3>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 bg-gray-50 dark:bg-gray-900/50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Order:</span>
                <span className="font-mono font-bold text-gray-900 dark:text-white">#{order.id.slice(0, 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-semibold text-gray-900 dark:text-white">{order.profiles?.full_name} ({order.profiles?.email})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Amount Paid:</span>
                <span className="font-bold text-emerald-600">{formatPrice(order.total_amount)}</span>
              </div>
              {order.payment_id && (
                <div className="flex justify-between">
                  <span className="text-gray-500">UTR / Ref:</span>
                  <span className="font-mono font-bold text-primary-600">{order.payment_id}</span>
                </div>
              )}
            </div>

            {/* Expected Delivery Date Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary-600" /> Expected Delivery Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={expectedDate}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setExpectedDate(e.target.value)}
                className="input-field text-sm font-semibold"
                required
              />

              {/* Quick Date Chips */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[11px] text-gray-500">Quick set:</span>
                <button
                  type="button"
                  onClick={() => setQuickDate(3)}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-primary-50 dark:bg-gray-700 dark:hover:bg-primary-950 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors"
                >
                  +3 Days
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(5)}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-primary-50 dark:bg-gray-700 dark:hover:bg-primary-950 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors"
                >
                  +5 Days (Std)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(7)}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-primary-50 dark:bg-gray-700 dark:hover:bg-primary-950 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors"
                >
                  +7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(10)}
                  className="px-2.5 py-1 text-xs bg-gray-100 hover:bg-primary-50 dark:bg-gray-700 dark:hover:bg-primary-950 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors"
                >
                  +10 Days (Custom Craft)
                </button>
              </div>
            </div>

            {/* Courier Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-primary-600" /> Courier Partner
              </label>
              <input
                type="text"
                value={courierName}
                onChange={(e) => setCourierName(e.target.value)}
                placeholder="e.g. Delhivery Express, Blue Dart, DTDC, Speed Post"
                className="input-field text-xs"
              />
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['Delhivery', 'Blue Dart', 'DTDC', 'Speed Post', 'MLA Valley Express'].map((partner) => (
                  <button
                    key={partner}
                    type="button"
                    onClick={() => setCourierName(partner)}
                    className="text-[11px] px-2 py-0.5 rounded border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    {partner}
                  </button>
                ))}
              </div>
            </div>

            {/* Tracking / AWB Number */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Tracking AWB Number (Optional)
              </label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DEL-9823471023 (Can also be added later)"
                className="input-field text-xs font-mono"
              />
            </div>

            {/* Verification Note */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Internal / Customer Note
              </label>
              <input
                type="text"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="e.g. Payment verified in HDFC account. Preparing Kashmir willow bat for knocking."
                className="input-field text-xs"
              />
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300">
              ⚡ Clicking confirm will immediately:
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                <li>Mark order as <strong>Confirmed</strong> with verified payment</li>
                <li>Send the customer an <strong>In-App Notification</strong> with delivery date</li>
                <li>Send an <strong>Official Confirmation Email</strong> with tracking &amp; invoice download</li>
              </ul>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setVerifyModalOpen(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerifyPayment}
                disabled={verifyingPayment}
                className="btn-primary text-xs font-bold px-4 py-2"
                id="confirm-verification-btn"
              >
                {verifyingPayment ? 'Verifying & Notifying...' : 'Approve & Dispatch Notification'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Reject Payment Proof</h3>
            </div>
            <p className="text-xs text-gray-500">
              This will update the order status and trigger an email requesting the customer to re-upload their proof.
            </p>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-1">
                Reason for Rejection
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                rows={3}
                className="input-field text-xs"
                placeholder="e.g. UTR reference not matching bank account records."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectPayment}
                disabled={verifyingPayment}
                className="btn-danger text-xs"
              >
                {verifyingPayment ? 'Rejecting...' : 'Confirm Rejection & Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrderDetailPage;
