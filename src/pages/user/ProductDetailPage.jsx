import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Minus, Plus, Package, Star, ShieldCheck, Award, Zap } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useToast } from '../../components/common/Toast';
import StarRating from '../../components/common/StarRating';
import { PageLoader } from '../../components/common/Loader';
import SEO from '../../components/common/SEO';
import { formatPrice } from '../../utils/formatters';
import { getBatByIdOrSlug } from '../../data/cricketBats';

// Interactive star picker component
const StarPicker = ({ value, onChange, disabled }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform hover:scale-110 disabled:cursor-not-allowed"
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <Star
            className={`w-7 h-7 transition-colors ${star <= (hover || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 dark:text-gray-600'
              }`}
          />
        </button>
      ))}
    </div>
  );
};

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, getWishlistItem } = useWishlist();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);

  // Rating state
  const [userRating, setUserRating] = useState(0);
  const [submittingRating, setSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/api/products/${id}`);
        if (res.data) {
          setProduct(res.data);
          return;
        }
      } catch {
        // Fallback to local bats
      }

      // Check if this id matches one of our cricket bats
      const localBat = getBatByIdOrSlug(id);
      if (localBat) {
        setProduct(localBat);
      } else {
        toast.error('Product not found');
        navigate('/products');
      }
      setLoading(false);
    };
    fetchProduct().finally(() => setLoading(false));
  }, [id]);

  // Fetch user's existing rating
  useEffect(() => {
    if (!user || !id) return;
    api.get(`/api/products/${id}/my-rating`)
      .then(res => {
        if (res.data?.userRating) {
          setUserRating(res.data.userRating);
          setRatingSubmitted(true);
        }
      })
      .catch(() => { });
  }, [user, id]);

  if (loading) return <PageLoader />;
  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const images = product.image_urls?.length > 0
    ? product.image_urls
    : [`https://placehold.co/600x600/f1f5f9/94a3b8?text=${encodeURIComponent(product.name)}`];

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login to add items to cart'); navigate('/login'); return; }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      toast.success('Added to cart!');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!user) { toast.error('Please login to buy'); navigate('/login'); return; }
    setAddingToCart(true);
    try {
      await addToCart(product.id, quantity);
      navigate('/cart');
    } catch (error) {
      toast.error(error.message);
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!user) { toast.error('Please login first'); return; }
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

  const handleSubmitRating = async () => {
    if (!user) { toast.error('Please login to rate this product'); return; }
    if (!userRating) { toast.error('Please select a star rating'); return; }
    setSubmittingRating(true);
    try {
      const res = await api.post(`/api/products/${id}/rate`, { rating: userRating });
      setProduct(res.data);
      setRatingSubmitted(true);
      toast.success(ratingSubmitted ? 'Rating updated!' : 'Thanks for your rating!');
    } catch (error) {
      toast.error(error.message || 'Failed to submit rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const ratingLabels = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent' };

  return (
    <div className="page-container">
      <SEO title={product.name} path={`/products/${product.id}`} description={product.description} />

      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Images */}
        <div>
          <div className="card overflow-hidden mb-3 relative group bg-gray-950 rounded-2xl border border-gray-200 dark:border-gray-800">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full aspect-square object-cover"
            />
            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-white text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-white/10">
              {selectedImage === 0 ? 'Front Blade View' : selectedImage === 1 ? 'Rear Spine / Edge View' : `View ${selectedImage + 1}`}
            </div>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                    i === selectedImage
                      ? 'border-red-600 ring-2 ring-red-500/30 scale-102'
                      : 'border-gray-200 dark:border-gray-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <p className="text-xs text-red-600 dark:text-red-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5" />
            {product.categories?.name || 'Cricket Bats'}
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mb-3 leading-tight tracking-tight">
            {product.name}
          </h1>

          {/* Overall Rating Display */}
          <div className="flex items-center gap-2 mb-4">
            <StarRating rating={product.rating} count={product.rating_count} size="md" />
            {product.rating > 0 && (
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {product.rating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-5">
            <span className="text-3xl font-black text-gray-900 dark:text-white">
              {formatPrice(product.price)}
            </span>
            {product.original_price && (
              <span className="text-lg line-through text-gray-400 font-medium">
                {formatPrice(product.original_price)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 mb-5">
            <Package className="w-4 h-4 text-gray-400" />
            {product.stock > 0 ? (
              <span className="text-sm text-green-600 dark:text-green-400 font-semibold">
                In Stock ({product.stock} bats available)
              </span>
            ) : (
              <span className="text-sm text-red-600 dark:text-red-400 font-semibold">Out of Stock</span>
            )}
          </div>

          {product.description && (
            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Blade Profile &amp; Craftsmanship</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Bat Specifications Grid */}
          {product.specs && (
            <div className="mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Handcrafted Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {product.specs.willow && (
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Willow Cleft</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{product.specs.willow}</span>
                  </div>
                )}
                {product.specs.edge_thickness && (
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Edge Profile</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{product.specs.edge_thickness}</span>
                  </div>
                )}
                {product.specs.grains && (
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Grains / Cavities</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{product.specs.grains}</span>
                  </div>
                )}
                {product.specs.weight && (
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Dead Weight &amp; Pickup</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{product.specs.weight}</span>
                  </div>
                )}
                {product.specs.handle_type && (
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Handle Construction</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{product.specs.handle_type}</span>
                  </div>
                )}
                {product.specs.sweet_spot && (
                  <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                    <span className="text-gray-400 block text-[10px] uppercase font-bold tracking-wider">Sweet Spot Profile</span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{product.specs.sweet_spot}</span>
                  </div>
                )}
                {product.specs.readiness && (
                  <div className="sm:col-span-2 p-2.5 rounded-xl bg-red-50/70 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                    <span className="text-red-600 dark:text-red-400 block text-[10px] uppercase font-bold tracking-wider flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      Match Readiness
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{product.specs.readiness}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {product.stock > 0 && (
            <>
              <div className="flex items-center gap-4 mb-5">
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Quantity:</span>
                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold text-gray-900 dark:text-white">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleAddToCart} disabled={addingToCart} className="btn-primary flex-1 gap-2" id="add-to-cart-detail">
                  <ShoppingCart className="w-4 h-4" />
                  {addingToCart ? 'Adding...' : 'Add to Cart'}
                </button>
                <button onClick={handleBuyNow} disabled={addingToCart} className="btn-outline flex-1" id="buy-now-detail">
                  Buy Now
                </button>
                <button
                  onClick={handleWishlistToggle}
                  className={`p-3 rounded-lg border-2 transition-colors ${inWishlist
                      ? 'border-red-300 bg-red-50 text-red-500 dark:border-red-700 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-red-500 hover:border-red-300'
                    }`}
                  id="wishlist-detail"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
                </button>
              </div>
            </>
          )}

          {/* ─── User Rating Section ─── */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1 uppercase tracking-wide">
              {ratingSubmitted ? 'Your Rating' : 'Rate this Product'}
            </h3>
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <StarPicker
                    value={userRating}
                    onChange={setUserRating}
                    disabled={submittingRating}
                  />
                  {userRating > 0 && (
                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {ratingLabels[userRating]}
                    </span>
                  )}
                </div>
                <button
                  onClick={handleSubmitRating}
                  disabled={submittingRating || !userRating}
                  className="btn-primary py-2 px-5 text-sm gap-2"
                  id="submit-rating"
                >
                  <Star className="w-4 h-4" />
                  {submittingRating ? 'Submitting...' : ratingSubmitted ? 'Update Rating' : 'Submit Rating'}
                </button>
                {ratingSubmitted && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    ✓ You rated this product {userRating} star{userRating > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                <a href="/login" className="text-primary-600 dark:text-primary-400 hover:underline font-medium">Login</a> to rate this product.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
