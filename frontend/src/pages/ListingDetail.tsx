import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { Listing } from '../types';
import { getListing, deleteListing, saveListing, unsaveListing } from '../api';
import { useAuth } from '../context/AuthContext';

const categoryGradients: Record<string, string> = {
  furniture: 'from-blue-400 to-blue-600',
  electronics: 'from-purple-400 to-purple-600',
  clothing: 'from-pink-400 to-pink-600',
  kitchen: 'from-green-400 to-green-600',
  books: 'from-yellow-400 to-yellow-600',
  sports: 'from-red-400 to-red-600',
  decor: 'from-teal-400 to-teal-600',
  boxes: 'from-amber-400 to-amber-600',
  other: 'from-gray-400 to-gray-600',
};

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getListing(Number(id))
      .then((res) => {
        setListing(res.data);
        setSaved(res.data.is_saved);
      })
      .catch(() => navigate('/listings'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!listing || !confirm('Are you sure you want to delete this listing?')) return;
    setDeleting(true);
    try {
      await deleteListing(listing.id);
      navigate('/listings');
    } catch {
      setDeleting(false);
    }
  };

  const handleSave = async () => {
    if (!listing || !user) return;
    try {
      if (saved) {
        await unsaveListing(listing.id);
        setSaved(false);
      } else {
        await saveListing(listing.id);
        setSaved(true);
      }
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!listing) return null;

  const isOwner = user?.id === listing.user_id;
  const gradient = categoryGradients[listing.category.toLowerCase()] || categoryGradients.other;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-700 text-sm mb-4 inline-flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Image + details */}
        <div className="lg:col-span-3 space-y-6">
          {listing.image_url ? (
            <img src={listing.image_url} alt={listing.title} className="w-full h-80 object-cover rounded-lg" />
          ) : (
            <div className={`w-full h-80 bg-gradient-to-br ${gradient} rounded-lg flex items-center justify-center`}>
              <span className="text-white text-6xl opacity-80">📦</span>
            </div>
          )}

          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
              <span className="text-2xl font-bold text-indigo-600 whitespace-nowrap">
                ${listing.price.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
                {listing.category}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                {listing.condition}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
                {listing.city}
              </span>
              {listing.status !== 'available' && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
                  {listing.status}
                </span>
              )}
              {listing.urgent && (
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-500 text-white font-bold">
                  URGENT{listing.move_out_date && ` - Move out ${format(new Date(listing.move_out_date), 'MMM d')}`}
                </span>
              )}
            </div>

            <p className="text-gray-600 mt-4 whitespace-pre-wrap">{listing.description}</p>

            <p className="text-xs text-gray-400 mt-4">
              Posted {format(new Date(listing.created_at), 'MMM d, yyyy')}
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {/* Seller card */}
          <div className="bg-white rounded-lg shadow-md p-5">
            <h3 className="font-semibold text-gray-900 mb-3">Seller</h3>
            <Link to={`/profile/${listing.user.id}`} className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors -mx-2">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {listing.user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{listing.user.name}</p>
                {listing.user.city && <p className="text-sm text-gray-500">{listing.user.city}</p>}
              </div>
            </Link>

            {!isOwner && user && (
              <Link
                to={`/messages?user=${listing.user_id}&listing=${listing.id}`}
                className="mt-4 block w-full bg-indigo-600 text-white text-center py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Message Seller
              </Link>
            )}

            {!user && (
              <Link
                to="/login"
                className="mt-4 block w-full bg-gray-100 text-gray-600 text-center py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Login to Contact
              </Link>
            )}
          </div>

          {/* Action buttons */}
          {user && !isOwner && (
            <button
              onClick={handleSave}
              className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors ${
                saved
                  ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {saved ? (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Saved
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Save Listing
                </>
              )}
            </button>
          )}

          {isOwner && (
            <div className="space-y-2">
              <Link
                to={`/listings/${listing.id}/edit`}
                className="block w-full bg-white text-indigo-600 border border-indigo-600 text-center py-2.5 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
              >
                Edit Listing
              </Link>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-full bg-white text-red-600 border border-red-300 py-2.5 rounded-lg font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Listing'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
