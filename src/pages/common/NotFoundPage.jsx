import { Link } from 'react-router-dom';
import { Home, ArrowLeft, ShoppingBag } from 'lucide-react';
import SEO from '../../components/common/SEO';

const NotFoundPage = () => {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 text-center">
      <SEO title="Page Not Found (404)" path="/404" />
      <div className="max-w-md">
        <div className="relative mb-6">
          <span className="text-8xl sm:text-9xl font-extrabold tracking-tighter text-gray-200 dark:text-gray-800 select-none">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl sm:text-4xl">🏏</span>
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          Out of the Boundary!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-sm sm:text-base leading-relaxed">
          The page you are looking for doesn’t exist, has been moved, or is temporarily unavailable.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/" className="btn-primary w-full sm:w-auto inline-flex items-center justify-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <Link to="/products" className="btn-secondary w-full sm:w-auto inline-flex items-center justify-center gap-2">
            <ShoppingBag className="w-4 h-4" />
            Browse Products
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
