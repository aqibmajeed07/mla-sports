import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, Ban, CheckCircle } from 'lucide-react';
import { api } from '../../services/api';
import { useToast } from '../../components/common/Toast';
import { PageLoader } from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import SEO from '../../components/common/SEO';
import { formatDate } from '../../utils/formatters';
import { useDebounce } from '../../hooks/useDebounce';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 400);
  const toast = useToast();

  const fetchCustomers = async () => {
    try {
      const params = debouncedSearch ? `?search=${debouncedSearch}` : '';
      const res = await api.get(`/api/admin/customers${params}`);
      setCustomers(res.data?.customers || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCustomers(); }, [debouncedSearch]);

  const toggleBlock = async (id, isBlocked) => {
    try {
      await api.put(`/api/admin/customers/${id}/block`, { is_blocked: !isBlocked });
      toast.success(`Customer ${isBlocked ? 'unblocked' : 'blocked'}`);
      fetchCustomers();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (loading) return <PageLoader />;

  return (
    <div>
      <SEO title="Customers" path="/admin/customers" />
      <h1 className="page-title">Customers</h1>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..." className="input-field pl-10" id="customer-search" />
      </div>

      {customers.length === 0 ? (
        <EmptyState icon={Users} title="No customers found" message="Customers will appear after they sign up." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Name</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 hidden sm:table-cell">Email</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Phone</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-500 dark:text-gray-400 hidden md:table-cell">Joined</th>
                  <th className="text-center py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-500 dark:text-gray-400">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">{customer.full_name}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 hidden sm:table-cell">{customer.email}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">{customer.phone || '—'}</td>
                    <td className="py-3 px-4 text-gray-500 dark:text-gray-400 hidden md:table-cell">{formatDate(customer.created_at)}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={customer.is_blocked ? 'badge-red' : 'badge-green'}>
                        {customer.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => toggleBlock(customer.id, customer.is_blocked)}
                        className={`p-2 rounded-lg transition-colors ${
                          customer.is_blocked
                            ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                            : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                        }`}
                        title={customer.is_blocked ? 'Unblock' : 'Block'}
                      >
                        {customer.is_blocked ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                      </button>
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

export default CustomersPage;
