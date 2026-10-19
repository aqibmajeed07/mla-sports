import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import ProductCard from '../../components/user/ProductCard';
import Loader from '../../components/common/Loader';
import { CRICKET_BATS } from '../../data/cricketBats';

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/products?featured=true&limit=8')
      .then(res => {
        const fetched = res.data?.products || [];
        // If API returns bats, use them, otherwise use the rich cricket bats dataset
        setProducts(fetched.length > 0 ? fetched : CRICKET_BATS.filter(b => b.is_featured));
      })
      .catch(() => {
        setProducts(CRICKET_BATS.filter(b => b.is_featured));
      })
      .finally(() => setLoading(false));
  }, []);

  const displayProducts = products.length > 0 ? products : CRICKET_BATS.filter(b => b.is_featured);

  return (
    <section className="py-16 sm:py-24" id="featured-products">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8 sm:mb-12">
          <div className="animate-fade-in">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              Handcrafted Master Willow
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Featured Cricket Bats
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">
              Top rated Kashmir Willow blades engineered for raw boundary power
            </p>
          </div>
          <Link
            to="/products"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 dark:text-primary-400 hover:gap-2.5 transition-all"
            id="view-all-products"
          >
            Explore All Bats
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <Loader className="py-16" size="lg" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        <div className="sm:hidden text-center mt-10">
          <Link to="/products" className="btn-primary inline-flex items-center gap-2 text-sm w-full justify-center py-3">
            View All Products
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
