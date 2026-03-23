import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { saveListing, unsaveListing } from '../api';
import { useState } from 'react';

const categoryColors: Record<string, string> = {
  furniture: 'bg-blue-100 text-blue-700',
  electronics: 'bg-purple-100 text-purple-700',
  clothing: 'bg-pink-100 text-pink-700',
  kitchen: 'bg-green-100 text-green-700',
  books: 'bg-yellow-100 text-yellow-700',
  sports: 'bg-red-100 text-red-700',
  decor: 'bg-teal-100 text-teal-700',
  other: 'bg-gray-100 text-gray-700',
};

const categoryGradients: Record<string, string> = {
  furniture: 'from-blue-400 to-blue-600',
  electronics: 'from-purple-400 to-purple-600',
  clothing: 'from-pink-400 to-pink-600',
  kitchen: 'from-green-400 to-green-600',
  books: 'from-yellow-400 to-yellow-600',
  sports: 'from-red-400 to-red-600',
  decor: 'from-teal-400 to-teal-600',
  other: 'from-gray-400 to-gray-600',
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
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
        {/* Image area */}
        <div className="relative">
          {listing.image_url ? (
            <img
              src={listing.image_url}
              alt={listing.title}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className={`w-full h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
              <span className="text-white text-4xl opacity-80">📦</span>
            </div>
          )}
          {listing.urgent && (
            <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              URGENT
              {listing.move_out_date && (
                <> &middot; {format(new Date(listing.move_out_date), 'MMM d')}</>
              )}
            </span>
          )}
          {user && (
            <button
              onClick={handleSave}
              className="absolute top-2 right-2 p-1.5 bg-white/80 rounded-full hover:bg-white transition-colors"
            >
              {saved ? (
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-400 hover:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {listing.title}
            </h3>
            <span className="text-lg font-bold text-indigo-600 whitespace-nowrap">
              ${listing.price.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">{listing.city}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
              {listing.category}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">
              {listing.condition}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            by {listing.user?.name || 'Unknown'}
          </p>
        </div>
      </div>
    </Link>
  );
}
