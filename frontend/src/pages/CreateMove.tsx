import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createMove } from '../api';
import ImageUpload from '../components/ImageUpload';
import CityInput from '../components/CityInput';
import MapPicker from '../components/MapPicker';

const CATEGORIES = ['furniture', 'electronics', 'kitchen', 'bedroom', 'bathroom', 'office', 'books', 'clothing', 'sports', 'other'];

export default function CreateMove() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    move_type: 'moving_out',
    from_city: user?.city || '',
    to_city: '',
    move_date: '',
    message: '',
    looking_for: [] as string[],
    budget_range: '',
    image_url: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [mapCoords, setMapCoords] = useState<{ lat: number | null; lng: number | null }>({ lat: null, lng: null });

  if (authLoading) return null;
  if (!user) {
    navigate('/login');
    return null;
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleCategory = (cat: string) => {
    setForm((prev) => ({
      ...prev,
      looking_for: prev.looking_for.includes(cat)
        ? prev.looking_for.filter((c) => c !== cat)
        : [...prev.looking_for, cat],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.move_date) {
      setError('Move date is required.');
      return;
    }
    setLoading(true);
    try {
      const data: any = {
        move_type: form.move_type,
        move_date: form.move_date,
      };
      if (form.from_city) data.from_city = form.from_city;
      if (form.to_city) data.to_city = form.to_city;
      if (form.message) data.message = form.message;
      if (form.looking_for.length > 0) data.looking_for = form.looking_for.join(', ');
      if (form.budget_range) data.budget_range = form.budget_range;
      if (form.image_url) data.image_url = form.image_url;
      if (mapCoords.lat !== null) { data.latitude = mapCoords.lat; data.longitude = mapCoords.lng!; }

      await createMove(data);
      navigate('/moves');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to post move.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Post Your Move</h1>
      <p className="text-gray-500 text-sm mb-6">Let the community know you're on the move.</p>

      <div className="bg-white rounded-lg shadow-md p-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Move type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">I am...</label>
            <div className="flex gap-3">
              {[
                { value: 'moving_out', label: 'Moving Out', color: 'orange' },
                { value: 'moving_in', label: 'Moving In', color: 'green' },
              ].map(({ value, label, color }) => (
                <label
                  key={value}
                  className={`flex-1 flex items-center justify-center gap-2 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    form.move_type === value
                      ? color === 'orange'
                        ? 'border-orange-400 bg-orange-50 text-orange-700'
                        : 'border-green-400 bg-green-50 text-green-700'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="move_type"
                    value={value}
                    checked={form.move_type === value}
                    onChange={(e) => update('move_type', e.target.value)}
                    className="sr-only"
                  />
                  <span className="font-medium">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">From City</label>
              <CityInput value={form.from_city} onChange={(v) => update('from_city', v)} placeholder="Leaving from..." />
              <div className="mt-2">
                <button type="button" onClick={() => setShowMap(s => !s)} className="text-xs text-indigo-600 hover:underline">
                  {showMap ? 'Hide map' : '+ Pin exact location on map (optional)'}
                </button>
                {showMap && (
                  <div className="mt-2">
                    <MapPicker
                      mode="pick"
                      lat={mapCoords.lat}
                      lng={mapCoords.lng}
                      onLocationChange={(lat, lng) => setMapCoords({ lat, lng })}
                      onClear={() => setMapCoords({ lat: null, lng: null })}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">To City</label>
              <CityInput value={form.to_city} onChange={(v) => update('to_city', v)} placeholder="Moving to..." />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Move Date *</label>
            <input
              type="date"
              required
              value={form.move_date}
              onChange={(e) => update('move_date', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              rows={3}
              value={form.message}
              onChange={(e) => update('message', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y"
              placeholder="Tell people what you're looking for or selling, any details about your move..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Photo (optional)</label>
            <ImageUpload
              value={form.image_url}
              onChange={(url) => update('image_url', url)}
              label="Add a photo — yourself, your packing, anything!"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Looking For (select all that apply)
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                    form.looking_for.includes(cat)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
                  }`}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget Range</label>
            <input
              type="text"
              value={form.budget_range}
              onChange={(e) => update('budget_range', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              placeholder="e.g. $100-$500, Under $200"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting...' : 'Post Move Announcement'}
          </button>
        </form>
      </div>
    </div>
  );
}
