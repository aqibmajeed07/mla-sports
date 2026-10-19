import { useState, useEffect } from 'react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { api } from '../../services/api';
import { PageLoader } from '../../components/common/Loader';
import SEO from '../../components/common/SEO';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

const AnalyticsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30');
  const { isDark } = useTheme();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/admin/analytics?period=${period}`);
        setData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [period]);

  if (loading) return <PageLoader />;

  const textColor = isDark ? '#9ca3af' : '#6b7280';
  const gridColor = isDark ? '#374151' : '#f3f4f6';

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { labels: { color: textColor } } },
    scales: {
      x: { ticks: { color: textColor }, grid: { color: gridColor } },
      y: { ticks: { color: textColor }, grid: { color: gridColor } },
    },
  };

  const salesDates = Object.keys(data?.dailySales || {});
  const salesValues = Object.values(data?.dailySales || {});

  const salesChartData = {
    labels: salesDates.map((d) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })),
    datasets: [{
      label: 'Daily Sales (₹)',
      data: salesValues,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
    }],
  };

  const categoryColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

  const categoryChartData = {
    labels: (data?.topCategories || []).map((c) => c.name),
    datasets: [{
      data: (data?.topCategories || []).map((c) => c.quantity),
      backgroundColor: categoryColors.slice(0, (data?.topCategories || []).length),
    }],
  };

  const bestSellingData = {
    labels: (data?.bestSelling || []).map((p) => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
    datasets: [{
      label: 'Units Sold',
      data: (data?.bestSelling || []).map((p) => p.quantity),
      backgroundColor: '#3b82f6',
      borderRadius: 6,
    }],
  };

  return (
    <div>
      <SEO title="Analytics" path="/admin/analytics" />
      <div className="flex items-center justify-between mb-6">
        <h1 className="page-title mb-0">Analytics</h1>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="input-field w-auto" id="analytics-period">
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Orders</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{data?.totalOrders || 0}</p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Revenue</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
            ₹{(data?.totalRevenue || 0).toLocaleString('en-IN')}
          </p>
        </div>
        <div className="card p-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">Best Seller</p>
          <p className="text-lg font-bold text-gray-900 dark:text-white mt-1 line-clamp-1">
            {data?.bestSelling?.[0]?.name || '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="section-title">Sales Trend</h2>
          <div className="h-72">
            {salesDates.length > 0 ? (
              <Line data={salesChartData} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center py-20">No sales data for this period</p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="section-title">Top Categories</h2>
          <div className="h-72 flex items-center justify-center">
            {(data?.topCategories || []).length > 0 ? (
              <Doughnut data={categoryChartData} options={{ ...chartOptions, scales: undefined }} />
            ) : (
              <p className="text-gray-500">No category data</p>
            )}
          </div>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h2 className="section-title">Best Selling Products</h2>
          <div className="h-72">
            {(data?.bestSelling || []).length > 0 ? (
              <Bar data={bestSellingData} options={chartOptions} />
            ) : (
              <p className="text-gray-500 text-center py-20">No product sales data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
