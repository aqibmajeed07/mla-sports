import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { PageLoader } from './Loader';

const AdminRoute = ({ children }) => {
  const { adminUser, isAdmin, loading } = useAuth();

  if (loading) return <PageLoader />;
  if (!adminUser && !isAdmin) return <Navigate to="/admin/login" replace />;

  return children;
};

export default AdminRoute;
