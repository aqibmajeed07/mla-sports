import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import ProductCard from '../../components/user/ProductCard';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import SEO from '../../components/common/SEO';
import { useDebounce } from '../../hooks/useDebounce';
import { CRICKET_BATS, BAT_CATEGORIES } from '../../data/cricketBats';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(BAT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'created_at');
  const [order, setOrder] = useState(searchParams.get('order') || 'desc');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const debouncedSearch = useDebounce(search, 400);

  // Sync category state if URL query param changes
  useEffect(() => {
    const urlCat = searchParams.get('category') || '';
    if (urlCat !== category) {
      setCategory(urlCat);
    }
  }, [searchParams]);

  useEffect(() => {
    api.get('/api/categories')
      .then(res => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
        } else {
          setCategories(BAT_CATEGORIES);
        }
      })
      .catch(() => {
        setCategories(BAT_CATEGORIES);
      });
  }, []);

  // Filter local fallback cricket bats
  const localFilteredBats = useMemo(() => {
    let result = [...CRICKET_BATS];

    if (category) {
      const catLower = category.toLowerCase();
      result = result.filter(
        b =>
          b.category_id?.toLowerCase() === catLower ||
          b.categories?.name?.toLowerCase().includes(catLower) ||
          b.categories?.name?.toLowerCase() === catLower.replace('-', ' ')
      );
    }

    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        b =>
          b.name.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q) ||
          b.categories?.name?.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sort === 'price') {
        return order === 'asc' ? a.price - b.price : b.price - a.price;
      }
      if (sort === 'rating') {
        return order === 'asc' ? a.rating - b.rating : b.rating - a.rating;
      }
      if (sort === 'name') {
        return order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      return 0;
    });

    return result;
  }, [debouncedSearch, category, sort, order]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (debouncedSearch) params.set('search', debouncedSearch);
        if (category) params.set('category', category);
        params.set('sort', sort);
        params.set('order', order);
        params.set('page', page.toString());
        params.set('limit', '12');
        setSearchParams(params, { replace: true });
        
        const res = await api.get(`/api/products?${params.toString()}`);
        const fetched = res.data?.products || [];
        if (fetched.length > 0) {
          setProducts(fetched);
          setTotalPages(res.data?.totalPages || 1);
        } else {
          setProducts(localFilteredBats);
          setTotalPages(1);
        }
      } catch {
        // Fallback to local cricket bats
        setProducts(localFilteredBats);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [debouncedSearch, category, sort, order, page, localFilteredBats]);

  const clearFilters = () => {
    setSearch('');
    setCategory('');
    setSort('created_at');
    setOrder('desc');
    setPage(1);
  };

  const hasActiveFilters = search || category || sort !== 'created_at';

  return (
    <div className="page-container">
      <SEO
        title="Cricket Bats Catalog | Handcrafted Kashmir Willow"
        path="/products"
        description="Explore our complete range of Grade-1 Kashmir Willow Leather Bats, Heavy Scoop Tennis Bats, and Pre-Knocked Match Bats."
      />

      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          100% Authentic Kashmir Timber Craft
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          Cricket Bats &amp; Match Blades
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base mt-1">
          Precision cleft selection, thick monster edges, and master-balanced pickup for competitive cricketers.
        </p>

        {/* Quick Category Filter Pills */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => { setCategory(''); setPage(1); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              !category
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            All Bats ({CRICKET_BATS.length})
          </button>
          {BAT_CATEGORIES.map((cat) => {
            const isSelected =
              category === cat.id ||
              category === cat.name ||
              category.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id}
                onClick={() => { setCategory(cat.id); setPage(1); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search + Filter Toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="input-field pl-9"
            id="product-search"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary inline-flex items-center gap-2 sm:w-auto ${showFilters ? 'ring-2 ring-primary-500 ring-offset-1' : ''}`}
          id="toggle-filters"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="w-2 h-2 bg-primary-500 rounded-full" />
          )}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="card p-5 mb-6 animate-fade-in-down">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Category</label>
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="input-field"
                id="filter-category"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Sort By</label>
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="input-field"
                id="filter-sort"
              >
                <option value="created_at">Newest</option>
                <option value="price">Price</option>
                <option value="name">Name</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">Order</label>
              <select
                value={order}
                onChange={(e) => { setOrder(e.target.value); setPage(1); }}
                className="input-field"
                id="filter-order"
              >
                <option value="desc">High to Low</option>
                <option value="asc">Low to High</option>
              </select>
            </div>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="mt-4 text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 inline-flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <Loader className="py-20" size="lg" />
      ) : products.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-1.5 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      ) : (
        <EmptyState title="No products found" message="Try adjusting your search or filters." />
      )}
    </div>
  );
};

export default ProductsPage;
