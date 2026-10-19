import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../components/common/Toast';
import EmptyState from '../../components/common/EmptyState';
import { PageLoader } from '../../components/common/Loader';
import SEO from '../../components/common/SEO';
import { formatPrice } from '../../utils/formatters';

const WishlistPage = () => {
  const { items, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const toast = useToast();

  const handleMoveToCart = async (item) => {
    try {
      await addToCart(item.product_id);
      await removeFromWishlist(item.id);
      toast.success('Moved to cart');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeFromWishlist(itemId);
      toast.success('Removed from wishlist');
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div className="page-container">
      <SEO title="Wishlist" path="/wishlist" />
      <h1 className="page-title">My Wishlist</h1>

      {items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Your wishlist is empty"
          message="Save items you love for later."
          action={<Link to="/products" className="btn-primary">Browse Products</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.products;
            if (!product) return null;
            const imageUrl = product.image_urls?.[0] || `https://placehold.co/400x400/e2e8f0/64748b?text=${encodeURIComponent(product.name)}`;
            return (
              <div key={item.id} className="card overflow-hidden">
                <Link to={`/products/${product.id}`} className="block">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                    <img src={imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                  </div>
                </Link>
                <div className="p-4">
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium mb-1">
                    {product.categories?.name || 'Sports'}
                  </p>
                  <Link to={`/products/${product.id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 line-clamp-1">
                    {product.name}
                  </Link>
                  <p className="font-bold text-gray-900 dark:text-white mt-2">{formatPrice(product.price)}</p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => handleMoveToCart(item)} className="btn-primary flex-1 text-sm py-2 inline-flex items-center justify-center gap-1.5" disabled={product.stock === 0}>
                      <ShoppingCart className="w-3.5 h-3.5" />
                      {product.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                    </button>
                    <button onClick={() => handleRemove(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-gray-200 dark:border-gray-700">
                      <Heart className="w-4 h-4 fill-current" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
