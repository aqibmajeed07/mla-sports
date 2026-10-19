import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import StarRating from '../common/StarRating';
import { formatPrice } from '../../utils/formatters';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../common/Toast';

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItem } = useWishlist();
  const toast = useToast();

  const inWishlist = isInWishlist(product.id);
  const imageUrl =
    product.image_urls?.[0] ||
    `https://placehold.co/400x400/f1f5f9/94a3b8?text=${encodeURIComponent(product.name)}`;

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to add items to cart'); return; }
    try {
      await addToCart(product.id);
      toast.success('Added to cart');
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please login to save items'); return; }
    try {
      if (inWishlist) {
        const item = getWishlistItem(product.id);
        await removeFromWishlist(item.id);
        toast.success('Removed from wishlist');
      } else {
        await addToWishlist(product.id);
        toast.success('Added to wishlist');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Link to={`/products/${product.id}`} className="card-hover group block">
      {/* Image with Multi-View Hover Effect */}
      <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
        {/* Primary View */}
        <img
          src={product.image_urls?.[0] || imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover transition-all duration-500 ${
            product.image_urls?.[1]
              ? 'group-hover:opacity-0 group-hover:scale-105'
              : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />
        {/* Secondary View (Hover Angle: Spine / Edge / Back) */}
        {product.image_urls?.[1] && (
          <img
            src={product.image_urls[1]}
            alt={`${product.name} spine profile`}
            className="absolute inset-0 w-full h-full object-cover opacity-0 scale-95 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500"
            loading="lazy"
          />
        )}
        {/* Multiple image indicator */}
        {product.image_urls?.length > 1 && (
          <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-black/75 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] text-white/95 font-bold tracking-wider uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
            <span>Flip View</span>
          </div>
        )}
        {/* Wishlist */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-full shadow transition-colors ${inWishlist
              ? 'bg-red-50 text-red-500'
              : 'bg-white/90 text-gray-400 hover:text-red-400 dark:bg-gray-800/90'
            }`}
          id={`wishlist-btn-${product.id}`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`w-3.5 h-3.5 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
        {/* Out of stock overlay */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <span className="bg-white/90 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-0.5">
          {product.categories?.name || 'Cricket Bats'}
        </p>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5 line-clamp-1 leading-snug">
          {product.name}
        </h3>
        <StarRating rating={product.rating} count={product.rating_count} />
        <div className="flex items-center justify-between mt-3">
          <span className="text-base font-bold text-gray-900 dark:text-white">
            {formatPrice(product.price)}
          </span>
          {product.stock > 0 && (
            <button
              onClick={handleAddToCart}
              className="p-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              id={`add-to-cart-${product.id}`}
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
