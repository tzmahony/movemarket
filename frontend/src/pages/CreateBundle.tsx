import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getListings, createBundle } from '../api';
import type { Listing } from '../types';
import ImageUpload from '../components/ImageUpload';
import CityInput from '../components/CityInput';

export default function CreateBundle() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [form, setForm] = useState({
    title: '',
    description: '',
    city: user?.city || '',
    discount_percentage: 10,
    image_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    getListings({ limit: 100 })
      .then((res) => {
        const mine = res.data.filter(
          (l) => l.user_id === user.id && l.status === 'available'
        );
        setMyListings(mine);
      })
      .finally(() => setFetching(false));
  }, [user, authLoading, navigate]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectedListings = myListings.filter((l) => selectedIds.has(l.id));
  const totalPrice = selectedListings.reduce((s, l) => s + l.price, 0);
  const discountedPrice = totalPrice * (1 - form.discount_percentage / 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (selectedIds.size < 2) {
      setError('Select at least 2 items for a bundle.');
      return;
    }
    if (!form.title || !form.city) {
      setError('Title and city are required.');
      return;
    }
    setLoading(true);
    try {
      const payload: any = {
        ...form,
        listing_ids: Array.from(selectedIds),
      };
      if (!form.image_url) delete payload.image_url;
      const res = await createBundle(payload);
      navigate(`/bundles/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create bundle.');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Create Bundle</h1>
      <p className="text-gray-500 text-sm mb-6">Group your listings together and offer a discount to buyers.</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g. Full Kitchen Set, Office Setup"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
              placeholder="Describe what's included in this bundle..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bundle Cover Photo</label>
            <ImageUpload
              value={form.image_url}
              onChange={(url) => setForm((p) => ({ ...p, image_url: url }))}
              label="Upload a cover photo for this bundle"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <CityInput required value={form.city} onChange={(v) => setForm((p) => ({ ...p, city: v }))} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Discount: <span className="text-indigo-600 font-bold">{form.discount_percentage}%</span>
              </label>
              <input
                type="range"
                min={5}
                max={50}
                step={5}
                value={form.discount_percentage}
                onChange={(e) => setForm((p) => ({ ...p, discount_percentage: Number(e.target.value) }))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>5%</span><span>50%</span>
              </div>
            </div>
          </div>

          {/* Item selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Items ({selectedIds.size} selected)
            </label>
            {myListings.length === 0 ? (
              <p className="text-gray-400 text-sm">You have no available listings to bundle.</p>
            ) : (
              <div className="border border-gray-200 rounded-lg divide-y max-h-64 overflow-y-auto">
                {myListings.map((listing) => (
                  <label
                    key={listing.id}
                    className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(listing.id)}
                      onChange={() => toggleSelect(listing.id)}
                      className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{listing.title}</p>
                      <p className="text-xs text-gray-400">{listing.category} &middot; {listing.condition}</p>
                    </div>
                    <span className="text-sm font-bold text-indigo-600">${listing.price.toFixed(2)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Price preview */}
          {selectedIds.size >= 1 && (
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Total ({selectedIds.size} items)</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-green-600 mt-1">
                <span>Discount ({form.discount_percentage}%)</span>
                <span>-${(totalPrice - discountedPrice).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-indigo-700 mt-2 pt-2 border-t border-indigo-200">
                <span>Bundle Price</span>
                <span>${discountedPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || selectedIds.size < 2}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Bundle'}
          </button>
        </form>
      </div>
    </div>
  );
}
