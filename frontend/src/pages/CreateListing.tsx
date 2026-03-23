import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createListing } from '../api';
import ImageUpload from '../components/ImageUpload';

const CATEGORIES = ['furniture', 'electronics', 'clothing', 'kitchen', 'books', 'sports', 'decor', 'boxes', 'other'];
const CONDITIONS = ['new', 'like new', 'good', 'fair', 'poor'];

export default function CreateListing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'furniture',
    condition: 'good',
    city: user?.city || '',
    image_url: '',
    urgent: false,
    move_out_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/login');
    return null;
  }

  const update = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.title || !form.description || !form.price || !form.city) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const data: any = {
        title: form.title,
        description: form.description,
        price: Number(form.price),
        category: form.category,
        condition: form.condition,
        city: form.city,
        urgent: form.urgent,
      };
      if (form.image_url) data.image_url = form.image_url;
      if (form.urgent && form.move_out_date) data.move_out_date = form.move_out_date;

      const res = await createListing(data);
      navigate(`/listings/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create Listing</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="What are you selling?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={form.description}
              onChange={(e) => update('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
              placeholder="Describe the item, its condition, why you're selling..."
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update('price', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => update('city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                placeholder="Your city"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
              <select
                value={form.condition}
                onChange={(e) => update('condition', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo</label>
            <ImageUpload
              value={form.image_url}
              onChange={(url) => update('image_url', url)}
              label="Upload a photo of your item"
            />
          </div>

          <div className="border-t pt-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={form.urgent}
                onChange={(e) => update('urgent', e.target.checked)}
                className="w-4 h-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Urgent sale</span>
                <p className="text-xs text-gray-400">Mark if you need to sell before moving out</p>
              </div>
            </label>

            {form.urgent && (
              <div className="mt-3 ml-7">
                <label className="block text-sm font-medium text-gray-700 mb-1">Move-out Date</label>
                <input
                  type="date"
                  value={form.move_out_date}
                  onChange={(e) => update('move_out_date', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Listing'}
          </button>
        </form>
      </div>
    </div>
  );
}
