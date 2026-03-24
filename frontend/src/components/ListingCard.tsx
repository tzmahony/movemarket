import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveListing, unsaveListing } from '../api';
import { useState } from 'react';

const categoryColors: Record<string, string> = {
  furniture: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  electronics: 'bg-purple-50 text-purple-700 ring-1 ring-purple-200',
  clothing: 'bg-pink-50 text-pink-700 ring-1 ring-pink-200',
  kitchen: 'bg-green-50 text-green-700 ring-1 ring-green-200',
  books: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200',
  sports: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  decor: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  boxes: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  other: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200',
};

const categoryGradients: Record<string, string> = {
  furniture: 'from-blue-500 to-blue-700',
  electronics: 'from-purple-500 to-purple-700',
  clothing: 'from-pink-500 to-pink-700',
  kitchen: 'from-green-500 to-green-700',
  books: 'from-yellow-500 to-yellow-700',
  sports: 'from-red-500 to-red-700',
  decor: 'from-teal-500 to-teal-700',
  boxes: 'from-amber-500 to-amber-700',
  other: 'from-slate-400 to-slate-600',
};

interface Props {
  listing: Listing;
  onSaveToggle?: () => void;
}

export default function ListingCard({ listing, onSaveToggle }: Props) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(listing.is_saved);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user || saving) return;
    setSaving(true);
    try {
      if (saved) {
        await unsaveListing(listing.id);
        setSaved(false);
      } else {
        await saveListing(listing.id);
        setSaved(true);
      }
      onSaveToggle?.();
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  };

  const gradient = categoryGradients[listing.category.toLowerCase()] || categoryGradients.other;
  const badgeColor = categoryColors[listing.category.toLowerCase()] || categoryColors.other;

  return (
    <Link to={`/listings/${listing.id}`} className="block group">
      <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-sm overflow-hidden transition-all duration-300 group-hover:shadow-xl group-hover:-translate-y-1">
        {/* Image */}
        <div className="relative">
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.title} className="w-full h-48 object-cover" />
          ) : (
            <div className={`w-full h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-white/60 text-5xl">📦</span>
            </div>
          )}
          {listing.urgent && (
            <span className="absolute top-3 left-3 bg-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              URGENT
              {listing.move_out_date && <> · {format(new Date(listing.move_out_date), 'MMM d')}</>}
            </span>
          )}
          {user && (
            <button
              onClick={handleSave}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-sm transition-all hover:scale-110"
            >
              {saved ? (
                <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-slate-400 group-hover:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-snug">
              {listing.title}
            </h3>
            <span className="text-base font-bold text-indigo-600 whitespace-nowrap">
              ${listing.price.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-slate-500 mb-3 flex items-center gap-1">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {listing.city}
          </p>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${badgeColor}`}>
              {listing.category}
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium ring-1 ring-slate-200">
              {listing.condition}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-3 pt-3 border-t border-slate-100">
            by {listing.user?.name || 'Unknown'}
          </p>
        </div>
      </div>
    </Link>
  );
}
