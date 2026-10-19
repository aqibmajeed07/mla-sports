import { PackageOpen } from 'lucide-react';

const EmptyState = ({ icon: Icon = PackageOpen, title, message, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <Icon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      {message && <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">{message}</p>}
      {action && action}
    </div>
  );
};

export default EmptyState;
