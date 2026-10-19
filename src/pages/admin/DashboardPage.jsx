import { useState, useEffect } from 'react';
import { Package, ShoppingBag, Users, DollarSign, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';
import { PageLoader } from '../../components/common/Loader';
import SEO from '../../components/common/SEO';
import { formatPrice } from '../../utils/formatters';

const StatCard = ({ icon: Icon, label, value, color, subtext }) => (
  <div className="card p-6">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    try {
      const res = await api.get('/api/admin/dashboard');
      setStats(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats(true);

    const channel = supabase
      .channel('admin-dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchStats(false))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchStats(false))
      .on('broadcast', { event: 'order_changed' }, () => fetchStats(false))
      .subscribe();

    const interval = setInterval(() => {
      if (typeof document !== 'undefined' && !document.hidden) {
        fetchStats(false);
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) return <PageLoader />;

  const cards = [
    { icon: Package, label: 'Total Products', value: stats?.totalProducts || 0, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { icon: ShoppingBag, label: 'Total Orders', value: stats?.totalOrders || 0, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
    { icon: Users, label: 'Total Customers', value: stats?.totalCustomers || 0, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { icon: DollarSign, label: 'Revenue', value: formatPrice(stats?.revenue || 0), color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { icon: Clock, label: 'Pending Orders', value: stats?.pendingOrders || 0, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    { icon: CheckCircle, label: 'Delivered', value: stats?.deliveredOrders || 0, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { icon: XCircle, label: 'Cancelled', value: stats?.cancelledOrders || 0, color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
    { icon: AlertTriangle, label: 'Low Stock Alerts', value: stats?.lowStockProducts?.length || 0, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
  ];

  return (
    <div>
      <SEO title="Admin Dashboard" path="/admin" />
      <h1 className="page-title">Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, i) => <StatCard key={i} {...card} />)}
      </div>

      {stats?.lowStockProducts?.length > 0 && (
        <div className="card p-6">
          <h2 className="section-title flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Low Stock Products
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Product</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Stock</th>
                </tr>
              </thead>
              <tbody>
                {stats.lowStockProducts.map((product) => (
                  <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800">
                    <td className="py-3 px-4 text-gray-900 dark:text-white">{product.name}</td>
                    <td className="py-3 px-4 text-right">
                      <span className={`badge ${product.stock === 0 ? 'badge-red' : 'badge-yellow'}`}>
                        {product.stock} left
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
