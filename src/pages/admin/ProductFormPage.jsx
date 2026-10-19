import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ImagePlus, X } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { PageLoader } from '../../components/common/Loader';
import SEO from '../../components/common/SEO';

const ProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const isEditing = !!id;

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '', category_id: '', description: '', price: '', stock: '0',
    image_urls: [], is_featured: false,
    blade_type: 'Kashmir Willow', willow_grade: 'Grade 1 Pro',
    weight_range: '1160g – 1220g', grains_range: '6–9 Straight Grains',
    edge_thickness: '38mm – 42mm', sweet_spot: 'Mid-to-Low Profile',
  });

  useEffect(() => {
    const init = async () => {
      try {
        const catRes = await api.get('/api/categories');
        setCategories(catRes.data || []);

        if (isEditing) {
          const prodRes = await api.get(`/api/products/${id}`);
          const p = prodRes.data;
          setFormData({
            name: p.name || '', category_id: p.category_id || '', description: p.description || '',
            price: p.price?.toString() || '', stock: p.stock?.toString() || '0',
            image_urls: p.image_urls || [], is_featured: p.is_featured || false,
            blade_type: p.blade_type || 'Kashmir Willow',
            willow_grade: p.willow_grade || 'Grade 1 Pro',
            weight_range: p.weight_range || '1160g – 1220g',
            grains_range: p.grains_range || '6–9 Straight Grains',
            edge_thickness: p.edge_thickness || '38mm – 42mm',
            sweet_spot: p.sweet_spot || 'Mid-to-Low Profile',
          });
        }
      } catch (error) {
        toast.error('Failed to load data');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      try {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64 = reader.result.split(',')[1];
          const res = await api.post('/api/upload', {
            base64, fileName: file.name, contentType: file.type,
          });
          setFormData((prev) => ({
            ...prev,
            image_urls: [...prev.image_urls, res.data.url],
          }));
          toast.success('Image uploaded');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error('Image upload failed');
      }
    }
  };

  const removeImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price) {
      toast.error('Name and price are required');
      return;
    }

    setSaving(true);
    try {
      if (isEditing) {
        await api.put(`/api/products/${id}`, formData);
        toast.success('Product updated!');
      } else {
        await api.post('/api/products', formData);
        toast.success('Product created!');
      }
      navigate('/admin/products');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <SEO title={isEditing ? 'Edit Product' : 'Add Product'} path={isEditing ? `/admin/products/${id}/edit` : '/admin/products/new'} />

      <button onClick={() => navigate('/admin/products')} className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 text-sm">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </button>

      <h1 className="page-title">{isEditing ? 'Edit Product' : 'Add New Product'}</h1>

      <form onSubmit={handleSubmit} className="max-w-3xl">
        <div className="card p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="input-field" id="product-name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select name="category_id" value={formData.category_id} onChange={handleChange} className="input-field" id="product-category">
                <option value="">Select category</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹) *</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="input-field" min="0" step="0.01" id="product-price" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="input-field" min="0" id="product-stock" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} id="product-featured" className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
              <label htmlFor="product-featured" className="text-sm font-medium text-gray-700 dark:text-gray-300">Featured Product</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} className="input-field" rows={3} id="product-description" />
          </div>

          {/* Cricket Bat Workshop Specs */}
          <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Cricket Bat Craftsmanship Specifications
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Willow / Blade Type</label>
                <input
                  type="text"
                  name="blade_type"
                  value={formData.blade_type}
                  onChange={handleChange}
                  className="input-field text-xs"
                  placeholder="e.g. Kashmir Willow Grade 1"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Willow Grade</label>
                <input
                  type="text"
                  name="willow_grade"
                  value={formData.willow_grade}
                  onChange={handleChange}
                  className="input-field text-xs"
                  placeholder="e.g. Grade 1 Pro / Master Reserve"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Sweet Spot Profile</label>
                <input
                  type="text"
                  name="sweet_spot"
                  value={formData.sweet_spot}
                  onChange={handleChange}
                  className="input-field text-xs"
                  placeholder="e.g. Mid-to-Low Profile"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Weight Range</label>
                <input
                  type="text"
                  name="weight_range"
                  value={formData.weight_range}
                  onChange={handleChange}
                  className="input-field text-xs"
                  placeholder="e.g. 1160g – 1220g"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Grains Range</label>
                <input
                  type="text"
                  name="grains_range"
                  value={formData.grains_range}
                  onChange={handleChange}
                  className="input-field text-xs"
                  placeholder="e.g. 6–9 Straight Grains"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 dark:text-gray-300 mb-1">Edge Thickness</label>
                <input
                  type="text"
                  name="edge_thickness"
                  value={formData.edge_thickness}
                  onChange={handleChange}
                  className="input-field text-xs"
                  placeholder="e.g. 38mm – 42mm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Images</label>
            <div className="flex flex-wrap gap-3 mb-3">
              {formData.image_urls.map((url, i) => (
                <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(i)} className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-24 h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 transition-colors">
                <ImagePlus className="w-6 h-6 text-gray-400 mb-1" />
                <span className="text-xs text-gray-400">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button type="submit" disabled={saving} className="btn-primary inline-flex items-center gap-2" id="save-product">
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
            </button>
            <button type="button" onClick={() => navigate('/admin/products')} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductFormPage;
