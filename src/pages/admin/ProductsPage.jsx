import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import SEO from '../../components/common/SEO';
import { formatPrice } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState(null);
  const debouncedSearch = useDebounce(search, 400);
  const toast = useToast();

  const fetchProducts = async () => {
    try {
      const params = debouncedSearch ? `?search=${debouncedSearch}&limit=100` : '?limit=100';
      const res = await api.get(`/api/products${params}`);
      setProducts(res.data?.products || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [debouncedSearch]);

  const handleDelete = async () => {
    try {
      await api.delete(`/api/products/${deleteId}`);
      toast.success('Product deleted');
      setDeleteId(null);
      fetchProducts();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <SEO title="Manage Products" path="/admin/products" />
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="page-title mb-0">Products</h1>
        <Link to="/admin/products/new" className="btn-primary inline-flex items-center gap-2" id="add-product-btn">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="input-field pl-10" id="admin-product-search" />
      </div>

      {products.length === 0 ? (
        <EmptyState icon={Package} title="No products found" message="Add your first product to get started." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Product</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Price</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Stock</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden flex-shrink-0">
                          <img
                            src={product.image_urls?.[0] || `https://placehold.co/80x80/e2e8f0/64748b?text=P`}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">
                      {product.categories?.name || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-gray-900 dark:text-white">
                      {formatPrice(product.price)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`badge ${product.stock === 0 ? 'badge-red' : product.stock <= 5 ? 'badge-yellow' : 'badge-green'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/admin/products/${product.id}/edit`} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteId(product.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Product" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminProductsPage;
