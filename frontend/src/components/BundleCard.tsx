import { Link } from 'react-router-dom';
import type { Bundle } from '../types';

interface Props {
  bundle: Bundle;
}

export default function BundleCard({ bundle }: Props) {
  return (
    <Link to={`/bundles/${bundle.id}`} className="block group">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        <div className="w-full h-36 bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center relative">
          <span className="text-white text-4xl opacity-80">🎁</span>
          <span className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {bundle.discount_percentage}% OFF
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
            {bundle.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {bundle.listings.length} item{bundle.listings.length !== 1 ? 's' : ''} &middot; {bundle.city}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-400 line-through">
              ${bundle.total_price.toFixed(2)}
            </span>
            <span className="text-lg font-bold text-indigo-600">
              ${bundle.discounted_price.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            by {bundle.user?.name || 'Unknown'}
          </p>
        </div>
      </div>
    </Link>
  );
}
