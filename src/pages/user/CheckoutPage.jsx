import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Copy,
  Check,
  UploadCloud,
  FileCheck2,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Smartphone,
  Banknote,
} from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/common/Toast';
import { validateAddressForm } from '../../utils/validators';
import { formatPrice } from '../../utils/formatters';
import { INDIAN_STATES, PAYMENT_METHODS } from '../../utils/constants';
import SEO from '../../components/common/SEO';

const CheckoutPage = () => {
  const { items, cartTotal, fetchCart } = useCart();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI / QR Code');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // UPI State
  const [utrNumber, setUtrNumber] = useState('');
  const [proofPreview, setProofPreview] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedKey, setCopiedKey] = useState(null);

  const upiId = import.meta.env.VITE_UPI_ID || 'mlasports@upi';
  const upiPhone = import.meta.env.VITE_UPI_PHONE || '+91 78895 15654';
  const payeeName = 'MLA Sports (Syed Manzoor Mosvi)';

  const [addressForm, setAddressForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    address1: '',
    address2: '',
    landmark: '',
    city: '',
    district: 'Budgam',
    state: 'Jammu & Kashmir',
    pincode: '',
    country: 'India',
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
      return;
    }
    const fetchAddresses = async () => {
      try {
        const res = await api.get('/api/users/addresses');
        setAddresses(res.data || []);
        const defaultAddr = (res.data || []).find((a) => a.is_default);
        if (defaultAddr) setSelectedAddress(defaultAddr.id);
        else if (res.data?.length > 0) setSelectedAddress(res.data[0].id);
        else setShowNewAddress(true);
      } catch (error) {
        console.error(error);
        setShowNewAddress(true);
      }
    };
    fetchAddresses();
  }, [items.length, navigate]);

  const handleAddressChange = (e) => {
    setAddressForm({ ...addressForm, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success(`${key === 'upi' ? 'UPI ID' : 'Phone number'} copied!`);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleProofUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPG, PNG, or WEBP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Screenshot file size exceeds 10MB limit');
      return;
    }

    const preview = URL.createObjectURL(file);
    setProofPreview(preview);
    setUploadingProof(true);

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
            setProofUrl(res.data.url);
            toast.success('Payment receipt screenshot attached successfully!');
          }
        } catch (err) {
          console.error('Upload failed:', err);
          toast.error(err.message || 'Failed to upload screenshot. Please retry.');
          setProofPreview('');
        } finally {
          setUploadingProof(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingProof(false);
      toast.error('Error reading screenshot file');
    }
  };

  const removeProof = () => {
    setProofPreview('');
    setProofUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (showNewAddress || !selectedAddress) {
      const validationErrors = validateAddressForm(addressForm);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        toast.error('Please complete all required address fields');
        return;
      }
    }

    if (paymentMethod === 'UPI / QR Code') {
      if (!utrNumber.trim()) {
        toast.error('Please enter your 12-digit UPI Transaction / UTR Number');
        return;
      }
      if (!proofUrl) {
        toast.error('Please upload a screenshot of your payment confirmation receipt');
        return;
      }
    }

    setLoading(true);
    try {
      const orderData = {
        payment_method: paymentMethod,
        order_notes: orderNotes || null,
      };

      if (paymentMethod === 'UPI / QR Code') {
        orderData.payment_id = utrNumber.trim();
        orderData.payment_proof_url = proofUrl;
      }

      if (selectedAddress && !showNewAddress) {
        orderData.address_id = selectedAddress;
      } else {
        orderData.address = addressForm;
      }

      const res = await api.post('/api/orders', orderData);
      await fetchCart();
      toast.success('Order placed successfully! Verification in progress.');
      navigate(`/orders/${res.data.id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  const addressFields = [
    { name: 'full_name', label: 'Full Name', required: true },
    { name: 'phone', label: 'Phone Number', required: true },
    { name: 'address1', label: 'Address Line 1', required: true },
    { name: 'address2', label: 'Address Line 2', required: false },
    { name: 'landmark', label: 'Landmark', required: false },
    { name: 'city', label: 'City', required: true },
    { name: 'district', label: 'District', required: true },
  ];

  // Dynamic UPI URL for scanner apps
  const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('MLA Sports')}&am=${cartTotal}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=10&data=${encodeURIComponent(upiIntentUrl)}`;

  return (
    <div className="page-container py-8">
      <SEO title="Checkout" path="/checkout" />
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
          Secure Checkout
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Handcrafted cricket bats dispatched directly from our Mirgund workshop.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Card */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>1.</span> Delivery Address
              </h2>

              {addresses.length > 0 && !showNewAddress && (
                <div className="space-y-3 mb-4">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedAddress === addr.id
                          ? 'border-primary-600 bg-primary-50/50 dark:bg-primary-950/20 shadow-sm'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={addr.id}
                        checked={selectedAddress === addr.id}
                        onChange={() => setSelectedAddress(addr.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-gray-900 dark:text-white">{addr.full_name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          {addr.address1}, {addr.city}, {addr.district}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mt-1">
                          Phone: {addr.phone}
                        </p>
                      </div>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowNewAddress(true)}
                    className="text-xs text-primary-600 dark:text-primary-400 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    + Ship to a new address
                  </button>
                </div>
              )}

              {(showNewAddress || addresses.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addressFields.map((field) => (
                    <div key={field.name} className={field.name === 'address1' ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                        {field.label} {field.required && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        name={field.name}
                        value={addressForm[field.name]}
                        onChange={handleAddressChange}
                        className="input-field"
                        id={`checkout-${field.name}`}
                      />
                      {errors[field.name] && (
                        <p className="text-red-500 text-xs mt-1">{errors[field.name]}</p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      State <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="state"
                      value={addressForm.state}
                      onChange={handleAddressChange}
                      className="input-field"
                      id="checkout-state"
                    >
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1">
                      Pincode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={addressForm.pincode}
                      onChange={handleAddressChange}
                      className="input-field"
                      id="checkout-pincode"
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>
                    )}
                  </div>
                  {addresses.length > 0 && (
                    <div className="sm:col-span-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowNewAddress(false)}
                        className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline font-medium"
                      >
                        Cancel and use saved address
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <span>2.</span> Payment Method
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                {PAYMENT_METHODS.map((method) => {
                  const isSelected = paymentMethod === method.value;
                  const isUPI = method.value.includes('UPI');
                  return (
                    <label
                      key={method.value}
                      className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isSelected
                          ? 'border-primary-600 bg-primary-50/60 dark:bg-primary-950/20 ring-1 ring-primary-500/20'
                          : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.value}
                        checked={isSelected}
                        onChange={() => setPaymentMethod(method.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {isUPI ? (
                            <QrCode className="w-4 h-4 text-primary-600" />
                          ) : (
                            <Banknote className="w-4 h-4 text-emerald-600" />
                          )}
                          <span className="font-bold text-sm text-gray-900 dark:text-white">
                            {method.label}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {isUPI
                            ? 'Scan QR or pay via GPay, PhonePe, Paytm & enter UTR'
                            : 'Pay upon parcel arrival at your doorstep'}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              {/* UPI / QR Code Detailed Card */}
              {paymentMethod === 'UPI / QR Code' && (
                <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 text-white shadow-xl space-y-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* QR Code Container */}
                    <div className="bg-white p-3 rounded-2xl shadow-lg shrink-0 flex flex-col items-center">
                      <img
                        src={qrCodeUrl}
                        alt="MLA Sports UPI Payment QR Code"
                        className="w-44 h-44 object-contain rounded-lg"
                      />
                      <span className="text-[10px] font-black tracking-widest text-slate-800 uppercase mt-1.5">
                        Scan to Pay ₹{cartTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {/* UPI Details & Copy buttons */}
                    <div className="flex-1 space-y-3.5 w-full">
                      <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                        <Smartphone className="w-4 h-4" />
                        <span>Instant UPI Transfer</span>
                      </div>

                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold">Payee Name</span>
                        <p className="text-sm font-bold text-slate-100">{payeeName}</p>
                      </div>

                      {/* UPI ID Field with Copy */}
                      <div className="bg-slate-800/80 rounded-xl p-2.5 flex items-center justify-between border border-slate-700">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Official UPI ID</span>
                          <span className="text-xs font-mono font-bold text-amber-300">{upiId}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(upiId, 'upi')}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedKey === 'upi' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'upi' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      {/* Phone / Mobile UPI with Copy */}
                      <div className="bg-slate-800/80 rounded-xl p-2.5 flex items-center justify-between border border-slate-700">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-semibold block">Phone / GPay / PhonePe</span>
                          <span className="text-xs font-mono font-bold text-amber-300">{upiPhone}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(upiPhone, 'phone')}
                          className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          {copiedKey === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>{copiedKey === 'phone' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-slate-800 pt-5 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-400" />
                      Step 2: Enter Transaction ID &amp; Upload Payment Proof
                    </h3>

                    {/* UTR / Transaction ID Input */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        UPI Reference / UTR Number (12 Digits) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={utrNumber}
                        onChange={(e) => setUtrNumber(e.target.value)}
                        placeholder="e.g. 428901234567 or TXN123456"
                        className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
                        id="checkout-utr"
                      />
                      <p className="text-[11px] text-slate-400 mt-1">
                        Found in your GPay / PhonePe / Paytm payment receipt under &quot;UPI Ref No.&quot; or &quot;UTR&quot;.
                      </p>
                    </div>

                    {/* Screenshot File Upload */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                        Screenshot of Payment Receipt <span className="text-red-400">*</span>
                      </label>

                      {proofPreview ? (
                        <div className="relative inline-block border-2 border-emerald-500/50 rounded-xl overflow-hidden p-1 bg-slate-950">
                          <img
                            src={proofPreview}
                            alt="Payment Proof Preview"
                            className="w-36 h-36 object-cover rounded-lg"
                          />
                          {uploadingProof ? (
                            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-xs text-white">
                              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mb-1" />
                              Uploading...
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={removeProof}
                              className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1 rounded-full shadow"
                              title="Remove Screenshot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <div className="p-1 text-center">
                            <span className="text-[10px] text-emerald-400 font-bold">Screenshot Attached</span>
                          </div>
                        </div>
                      ) : (
                        <label className="border-2 border-dashed border-slate-700 hover:border-amber-500/70 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-950/60">
                          <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                          <span className="text-xs font-bold text-slate-200">
                            Click to upload payment screenshot
                          </span>
                          <span className="text-[11px] text-slate-500 mt-0.5">
                            PNG, JPG, or WEBP up to 10MB
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProofUpload}
                            className="hidden"
                            id="checkout-proof-file"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Order Notes */}
            <div className="card p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span>3.</span> Workshop Notes (Optional)
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Specify custom bat weight preference (e.g. 1180g), handle grip color, or delivery instructions.
              </p>
              <textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                className="input-field"
                rows={3}
                placeholder="e.g. Please select a bat with 8+ straight grains and semi-oval handle."
                id="checkout-notes"
              />
            </div>
          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24 space-y-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Order Summary
              </h2>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm py-1 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex-1 mr-2">
                      <p className="font-semibold text-gray-900 dark:text-white text-xs line-clamp-1">
                        {item.products?.name}
                      </p>
                      <span className="text-[11px] text-gray-500">Qty: {item.quantity}</span>
                    </div>
                    <span className="font-bold text-gray-900 dark:text-white text-xs shrink-0">
                      {formatPrice((item.products?.price || 0) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-2 text-xs">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Shipping &amp; Insurance</span>
                  <span className="text-emerald-600 font-bold uppercase">Free Direct Dispatch</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Willow Preparation &amp; Oiling</span>
                  <span className="text-emerald-600 font-bold uppercase">Complimentary</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span>Grand Total</span>
                  <span className="text-primary-600 dark:text-primary-400 text-lg">
                    {formatPrice(cartTotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || uploadingProof}
                className="btn-primary w-full py-3.5 text-sm uppercase tracking-wider font-black cursor-pointer shadow-lg disabled:opacity-50"
                id="place-order-btn"
              >
                {loading ? 'Processing Order...' : uploadingProof ? 'Uploading Receipt...' : 'Confirm & Place Order'}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 dark:text-gray-400 pt-2 text-center">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Direct Verification by MLA Sports Workshop</span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
