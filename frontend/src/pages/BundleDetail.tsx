import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { Bundle } from '../types';
import { getBundle, deleteBundle } from '../api';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export default function BundleDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bundle, setBundle] = useState<Bundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    getBundle(Number(id))
      .then((res) => setBundle(res.data))
      .catch(() => navigate('/bundles'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    if (!bundle || !confirm('Delete this bundle?')) return;
    setDeleting(true);
    try {
      await deleteBundle(bundle.id);
      navigate('/bundles');
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!bundle) return null;

  const savings = bundle.total_price - bundle.discounted_price;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/bundles" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mb-6 inline-block">
        &larr; Back to Bundles
      </Link>

      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                {bundle.discount_percentage}% OFF
              </span>
              <span className="text-gray-400 text-sm">{bundle.city}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{bundle.title}</h1>
            <p className="text-gray-500 mt-2">{bundle.description}</p>
            <p className="text-sm text-gray-400 mt-2">
              Posted by{' '}
              <Link to={`/profile/${bundle.user_id}`} className="text-indigo-600 hover:underline">
                {bundle.user?.name}
              </Link>
              {' '}&middot; {format(new Date(bundle.created_at), 'MMM d, yyyy')}
            </p>
          </div>

          {/* Pricing */}
          <div className="text-right shrink-0">
            <p className="text-gray-400 line-through text-lg">${bundle.total_price.toFixed(2)}</p>
            <p className="text-3xl font-bold text-indigo-600">${bundle.discounted_price.toFixed(2)}</p>
            <p className="text-green-600 text-sm font-medium">Save ${savings.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6 pt-6 border-t">
          <Link
            to={`/messages?user=${bundle.user_id}`}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Message Seller
          </Link>
          {user && user.id === bundle.user_id && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-50 text-red-600 border border-red-200 px-5 py-2.5 rounded-lg hover:bg-red-100 transition-colors font-medium disabled:opacity-50"
            >
              {deleting ? 'Deleting...' : 'Delete Bundle'}
            </button>
          )}
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Items in this bundle ({bundle.listings.length})
      </h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {bundle.listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  );
}
