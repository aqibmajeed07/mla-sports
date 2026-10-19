import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, count = 0, size = 'sm' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5' };
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Star key={i} className={`${sizes[size]} fill-yellow-400 text-yellow-400`} />);
    } else if (i - 0.5 <= rating) {
      stars.push(<Star key={i} className={`${sizes[size]} fill-yellow-400/50 text-yellow-400`} />);
    } else {
      stars.push(<Star key={i} className={`${sizes[size]} text-gray-300 dark:text-gray-600`} />);
    }
  }

  return (
    <div className="flex items-center gap-1">
      <div className="flex">{stars}</div>
      {count > 0 && (
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
          ({count})
        </span>
      )}
    </div>
  );
};

export default StarRating;
