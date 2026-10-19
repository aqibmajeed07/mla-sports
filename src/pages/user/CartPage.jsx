import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import SEO from '../../components/common/SEO';
import { formatPrice } from '../../utils/formatters';

const CartPage = () => {
  const { items, loading, cartTotal, updateQuantity, removeItem } = useCart();
  const toast = useToast();
  const navigate = useNavigate();

  const handleQuantityChange = async (itemId, newQty) => {
    try {
      await updateQuantity(itemId, newQty);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
      toast.success('Removed from cart');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <SEO title="Cart" path="/cart" />

      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Continue Shopping
      </button>

      <h1 className="page-title">Shopping Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          message="Browse our products and add items to your cart."
          action={<Link to="/products" className="btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => {
              const product = item.products;
              const imageUrl = product?.image_urls?.[0] || `https://placehold.co/200x200/e2e8f0/64748b?text=${encodeURIComponent(product?.name || '')}`;
              return (
                <div key={item.id} className="card p-4 sm:p-6">
                  <div className="flex gap-4">
                    <Link to={`/products/${product?.id}`} className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
                      <img src={imageUrl} alt={product?.name} className="w-full h-full object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/products/${product?.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 line-clamp-1">
                        {product?.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {product?.categories?.name}
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white mt-2">
                        {formatPrice(product?.price)}
                      </p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(item.id, Math.max(1, item.quantity - 1))}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-10 text-center text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
                            disabled={item.quantity >= (product?.stock || 99)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className="font-bold text-gray-900 dark:text-white">
                            {formatPrice((product?.price || 0) * item.quantity)}
                          </span>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h2>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Subtotal ({items.length} items)</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Delivery</span>
                  <span className="text-green-600 font-medium">Free</span>
                </div>
                <hr className="border-gray-200 dark:border-gray-700" />
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">{formatPrice(cartTotal)}</span>
                </div>
              </div>
              <Link to="/checkout" className="btn-primary w-full text-center block" id="checkout-btn">
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
