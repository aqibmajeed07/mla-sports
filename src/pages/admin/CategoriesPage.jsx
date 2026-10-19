import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Grid3X3 } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import SEO from '../../components/common/SEO';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const fetchCategories = async () => {
    try {
      const res = await api.get('/api/categories');
      setCategories(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCategories(); }, []);

  const openAdd = () => { setEditingCategory(null); setName(''); setModalOpen(true); };
  const openEdit = (cat) => { setEditingCategory(cat); setName(cat.name); setModalOpen(true); };

  const handleSave = async () => {
    if (!name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      if (editingCategory) {
        await api.put(`/api/categories/${editingCategory.id}`, { name: name.trim() });
        toast.success('Category updated');
      } else {
        await api.post('/api/categories', { name: name.trim() });
        toast.success('Category created');
      }
      setModalOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/categories/${deleteId}`);
      toast.success('Category deleted');
      setDeleteId(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <SEO title="Manage Categories" path="/admin/categories" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Categories</h1>
        <button onClick={openAdd} className="btn-primary inline-flex items-center gap-2" id="add-category-btn">
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <EmptyState icon={Grid3X3} title="No categories" message="Create your first category." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card p-5 flex items-center justify-between">
              <span className="font-medium text-gray-900 dark:text-white">{cat.name}</span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(cat)} className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(cat.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Add Category'} size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input-field" placeholder="e.g. Cricket" id="category-name-input" />
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary" id="save-category">
              {saving ? 'Saving...' : editingCategory ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Category" size="sm">
        <p className="text-gray-600 dark:text-gray-300 mb-6">Are you sure? Products in this category will become uncategorized.</p>
        <div className="flex gap-3 justify-end">
          <button onClick={() => setDeleteId(null)} className="btn-secondary">Cancel</button>
          <button onClick={handleDelete} className="btn-danger">Delete</button>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesPage;
