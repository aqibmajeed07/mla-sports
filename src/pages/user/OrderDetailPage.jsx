import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  CreditCard,
  Package,
  ShieldCheck,
  Clock,
  AlertTriangle,
  UploadCloud,
  FileCheck2,
  Eye,
  X,
  ExternalLink,
  Download,
  Truck,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { PageLoader } from '../../components/common/Loader';
import { useToast } from '../../components/common/Toast';
import SEO from '../../components/common/SEO';
import { formatPrice, formatDateTime, generateOrderId } from '../../utils/formatters';
import { ORDER_STATUSES, STATUS_COLORS } from '../../utils/constants';
import { generateOrderInvoicePDF } from '../../utils/invoiceGenerator';

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);

  // Re-upload state if rejected or missing
  const [reuploading, setReuploading] = useState(false);
  const [newUtr, setNewUtr] = useState('');
  const [newProofUrl, setNewProofUrl] = useState('');
  const [newProofPreview, setNewProofPreview] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);

  const fetchOrder = async () => {
    try {
      const res = await api.get(`/api/orders/${id}`);
      setOrder(res.data);
      if (res.data?.payment_id) {
        setNewUtr(res.data.payment_id);
      }
    } catch (error) {
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, or WEBP)');
      return;
    }

    setNewProofPreview(URL.createObjectURL(file));
    setIsUploadingFile(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64Data = reader.result.split(',')[1];
          const res = await api.post('/api/upload', {
            base64: base64Data,
            fileName: file.name,
            contentType: file.type,
            bucket: 'payment-proofs',
          });
          if (res.data?.url) {
            setNewProofUrl(res.data.url);
            toast.success('Screenshot uploaded successfully!');
          }
        } catch (err) {
          toast.error(err.message || 'Upload failed');
        } finally {
          setIsUploadingFile(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setIsUploadingFile(false);
      toast.error('Failed to process image');
    }
  };

  const handleReuploadSubmit = async (e) => {
    e.preventDefault();
    if (!newUtr.trim() && !newProofUrl) {
      toast.error('Please provide a valid UTR number or upload a screenshot');
      return;
    }

    setReuploading(true);
    try {
      await api.put(`/api/orders/${id}/payment-proof`, {
        payment_id: newUtr.trim(),
        payment_proof_url: newProofUrl || order.payment_proof_url,
      });
      toast.success('Payment proof re-submitted for admin verification!');
      fetchOrder();
    } catch (error) {
      toast.error(error.message || 'Failed to submit proof');
    } finally {
      setReuploading(false);
    }
  };

  if (loading) return <PageLoader />;
  if (!order) return null;

  const isCancelled = order.status === 'Cancelled';
  const currentStep = isCancelled ? -1 : ORDER_STATUSES.indexOf(order.status);
  const address = order.addresses;
  const isUPI = order.payment_method?.includes('UPI') || order.payment_method?.includes('QR');
  const isVerified = order.payment_status === 'verified';
  const isRejected = order.payment_status === 'rejected';

  return (
    <div className="page-container py-8">
      <SEO title={`Order ${generateOrderId(order.id)}`} path={`/orders/${order.id}`} />

      <button
        onClick={() => navigate('/orders')}
        className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Order {generateOrderId(order.id)}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Placed on {formatDateTime(order.created_at)}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate(`/track/${order.id}`)}
            className="btn-primary inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider py-2 px-3.5 cursor-pointer shadow-sm"
            id="track-order-btn"
          >
            <Truck className="w-4 h-4" /> Track Order Live
          </button>
          {(order.payment_status === 'verified' || ['Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'].includes(order.status)) ? (
            <button
              onClick={() => {
                toast.success('Generating official tax invoice PDF...');
                generateOrderInvoicePDF(order);
              }}
              className="btn-secondary inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider py-2 px-3.5 cursor-pointer"
              id="user-download-invoice-btn"
            >
              <Download className="w-4 h-4" /> Download Invoice (PDF)
            </button>
          ) : (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 px-3 py-1.5 rounded-lg"
              title="Official invoice available after admin verifies payment proof"
            >
              Invoice available after payment verification
            </span>
          )}
          <span className={`badge-${STATUS_COLORS[order.status] || 'gray'} text-xs px-3 py-1.5 ml-1`}>
            {order.status}
          </span>
        </div>
      </div>

      {/* Expected Delivery Date Spotlight Banner */}
      {order.expected_delivery_date && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-blue-900 to-indigo-950 text-white shadow-lg border border-blue-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl text-blue-300">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 block">
                Estimated Arrival
              </span>
              <p className="text-lg font-black text-white">
                {order.expected_delivery_date}
              </p>
              <p className="text-xs text-blue-200 mt-0.5">
                Carrier: <span className="font-semibold text-white">{order.courier_name || 'Express Insured Cargo'}</span>
                {order.tracking_number ? ` • AWB: ${order.tracking_number}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate(`/track/${order.id}`)}
            className="px-4 py-2 rounded-xl bg-white text-blue-950 font-bold text-xs hover:bg-blue-50 transition-colors shadow self-start sm:self-auto cursor-pointer"
          >
            Open Live Tracker →
          </button>
        </div>
      )}

      {/* Payment Status Alert Banner */}
      {isUPI && (
        <div
          className={`p-4 rounded-2xl mb-8 border transition-all ${
            isVerified
              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300'
              : isRejected
              ? 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800 text-red-900 dark:text-red-300'
              : 'bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300'
          }`}
        >
          <div className="flex items-start gap-3">
            {isVerified ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            ) : isRejected ? (
              <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
            ) : (
              <Clock className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="font-bold text-sm">
                {isVerified
                  ? 'Payment Verified & Approved'
                  : isRejected
                  ? 'Payment Verification Needed'
                  : 'Payment Proof Under Verification'}
              </h3>
              <p className="text-xs mt-1 leading-relaxed">
                {isVerified
                  ? 'Your UPI payment has been verified by our workshop administrator. Your bat order is confirmed and proceeding with final oiling and packing.'
                  : isRejected
                  ? 'Our team could not confirm your UPI reference number with our bank statement. Please double check your UTR number or upload a fresh screenshot below.'
                  : 'We have received your payment proof and UTR reference. Our team will verify it with our bank records and dispatch an email confirmation to you shortly.'}
              </p>

              {/* Re-upload form if rejected */}
              {(isRejected || (!order.payment_proof_url && isUPI)) && (
                <form onSubmit={handleReuploadSubmit} className="mt-4 pt-3 border-t border-red-200 dark:border-red-800/50 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">
                        12-Digit UTR Number
                      </label>
                      <input
                        type="text"
                        value={newUtr}
                        onChange={(e) => setNewUtr(e.target.value)}
                        placeholder="e.g. 428901234567"
                        className="input-field text-xs bg-white dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider mb-1">
                        Upload Screenshot
                      </label>
                      <label className="flex items-center gap-2 px-3 py-2 border rounded-xl cursor-pointer text-xs bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700">
                        <UploadCloud className="w-4 h-4 text-primary-600" />
                        <span className="truncate">
                          {isUploadingFile ? 'Uploading...' : newProofUrl ? 'Screenshot attached' : 'Select image file'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={reuploading || isUploadingFile}
                    className="btn-primary text-xs py-2 px-4 cursor-pointer"
                  >
                    {reuploading ? 'Submitting...' : 'Submit Updated Proof'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fulfillment Status Tracker */}
      {!isCancelled && (
        <div className="card p-6 mb-8">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-6">Order Tracking</h2>
          <div className="relative">
            <div className="flex justify-between mb-2">
              {ORDER_STATUSES.map((status, i) => (
                <div key={status} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold z-10 ${
                      i <= currentStep
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <span
                    className={`text-xs mt-2 text-center hidden sm:block ${
                      i <= currentStep
                        ? 'text-primary-600 dark:text-primary-400 font-medium'
                        : 'text-gray-400'
                    }`}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0 mx-8">
              <div
                className="h-full bg-primary-600 transition-all duration-500"
                style={{ width: `${(currentStep / (ORDER_STATUSES.length - 1)) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium sm:hidden mt-4 text-center">
            Current: {order.status}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.order_items?.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 pb-4 border-b border-gray-100 dark:border-gray-700 last:border-0 last:pb-0"
                >
                  <div className="w-16 h-16 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                    <img
                      src={item.products?.image_urls?.[0] || 'https://placehold.co/100x100/e2e8f0/64748b?text=P'}
                      alt={item.product_name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{item.product_name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatPrice(item.price)} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 dark:text-white">
                    {formatPrice(item.price * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
            <hr className="my-4 border-gray-200 dark:border-gray-700" />
            <div className="flex justify-between">
              <span className="font-semibold text-gray-900 dark:text-white">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                {formatPrice(order.total_amount)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Delivery Address */}
          {address && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Delivery Address
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">{address.full_name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {address.address1}
                {address.address2 && `, ${address.address2}`}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {address.city}, {address.district}, {address.state} - {address.pincode}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Phone: {address.phone}</p>
            </div>
          )}

          {/* Payment Card */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> Payment Details
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{order.payment_method}</p>

            {order.payment_id && (
              <div className="mt-3 p-2.5 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-xs">
                <span className="text-gray-500 block">UPI Reference (UTR):</span>
                <span className="font-mono font-bold text-primary-600 dark:text-primary-400">
                  {order.payment_id}
                </span>
              </div>
            )}

            {order.payment_proof_url && (
              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-500 block mb-1.5">Submitted Proof Screenshot:</span>
                <div
                  className="relative group cursor-pointer w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
                  onClick={() => setPreviewImage(order.payment_proof_url)}
                >
                  <img
                    src={order.payment_proof_url}
                    alt="Payment Proof"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {order.order_notes && (
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" /> Order Notes
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300">{order.order_notes}</p>
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
              alt="Payment Proof"
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
    </div>
  );
};

export default OrderDetailPage;
