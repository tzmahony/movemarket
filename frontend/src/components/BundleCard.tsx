import { Link } from 'react-router-dom';
import type { Bundle } from '../types';

interface Props {
  bundle: Bundle;
}

export default function BundleCard({ bundle }: Props) {
  return (
    <Link to={`/bundles/${bundle.id}`} className="block group">
      <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        <div className="relative w-full h-40">
          {bundle.image_url ? (
            <img src={bundle.image_url} alt={bundle.title} className="w-full h-40 object-cover" />
          ) : (
            <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <span className="text-white/60 text-5xl">🎁</span>
            </div>
          )}
          <span className="absolute top-3 right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
            {bundle.discount_percentage}% OFF
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-1">
            {bundle.title}
          </h3>
          <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {bundle.listings.length} item{bundle.listings.length !== 1 ? 's' : ''} · {bundle.city}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-slate-400 line-through">${bundle.total_price.toFixed(2)}</span>
            <span className="text-lg font-bold text-indigo-600">${bundle.discounted_price.toFixed(2)}</span>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            by {bundle.user?.name || 'Unknown'}
          </p>
        </div>
      </div>
    </Link>
  );
}
