import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import type { User, Listing, Bundle } from '../types';
import { getUser, getListings, getBundles, getSavedListings, updateProfile } from '../api';
import ListingCard from '../components/ListingCard';
import BundleCard from '../components/BundleCard';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

type Tab = 'listings' | 'bundles' | 'saved';

const moveTypeLabel: Record<string, string> = {
  moving_in: 'Moving In',
  moving_out: 'Moving Out',
  settled: 'Settled',
};

const moveTypeBadge: Record<string, string> = {
  moving_in: 'bg-green-100 text-green-700',
  moving_out: 'bg-orange-100 text-orange-700',
  settled: 'bg-gray-100 text-gray-600',
};

export default function Profile() {
  const { id } = useParams<{ id: string }>();
  const { user: me, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [saved, setSaved] = useState<Listing[]>([]);
  const [tab, setTab] = useState<Tab>('listings');
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', city: '', move_type: '', move_date: '', bio: '', phone: '' });
  const [saving, setSaving] = useState(false);

  const isOwnProfile = me && Number(id) === me.id;

  useEffect(() => {
    if (!id) return;
    const uid = Number(id);
    setLoading(true);
    Promise.all([
      getUser(uid),
      getListings({ limit: 100 }),
      getBundles({ limit: 100 }),
    ]).then(([userRes, listingsRes, bundlesRes]) => {
      setProfileUser(userRes.data);
      setListings(listingsRes.data.filter((l: Listing) => l.user_id === uid));
      setBundles(bundlesRes.data.filter((b: Bundle) => b.user_id === uid));
      setEditForm({
        name: userRes.data.name || '',
        city: userRes.data.city || '',
        move_type: userRes.data.move_type || '',
        move_date: userRes.data.move_date || '',
        bio: userRes.data.bio || '',
        phone: userRes.data.phone || '',
      });
    }).catch(() => navigate('/'))
      .finally(() => setLoading(false));

    if (me && Number(id) === me.id) {
      getSavedListings().then((r) => setSaved(r.data)).catch(() => {});
    }
  }, [id, me, navigate]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name: editForm.name,
        city: editForm.city || undefined,
        move_type: editForm.move_type || undefined,
        move_date: editForm.move_date || undefined,
        bio: editForm.bio || undefined,
        phone: editForm.phone || undefined,
      } as any);
      await refreshUser();
      setEditing(false);
      const res = await getUser(Number(id));
      setProfileUser(res.data);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!profileUser) return null;

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: 'listings', label: 'Listings', count: listings.length },
    { key: 'bundles', label: 'Bundles', count: bundles.length },
    ...(isOwnProfile ? [{ key: 'saved' as Tab, label: 'Saved', count: saved.length }] : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Profile header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        {editing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Edit Profile</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" value={editForm.city} onChange={(e) => setEditForm((p) => ({ ...p, city: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Move Status</label>
                <select value={editForm.move_type} onChange={(e) => setEditForm((p) => ({ ...p, move_type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
                  <option value="">Not specified</option>
                  <option value="moving_in">Moving In</option>
                  <option value="moving_out">Moving Out</option>
                  <option value="settled">Settled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Move Date</label>
                <input type="date" value={editForm.move_date} onChange={(e) => setEditForm((p) => ({ ...p, move_date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea rows={3} value={editForm.bio} onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-y" />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={saving}
                className="bg-indigo-600 text-white px-5 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={() => setEditing(false)}
                className="bg-gray-100 text-gray-600 px-5 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-2xl shrink-0">
              {profileUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{profileUser.name}</h1>
                  {profileUser.city && (
                    <p className="text-gray-500 text-sm mt-0.5">{profileUser.city}</p>
                  )}
                </div>
                {isOwnProfile && (
                  <button onClick={() => setEditing(true)}
                    className="shrink-0 border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
                    Edit Profile
                  </button>
                )}
              </div>

              {profileUser.move_type && (
                <span className={`inline-block mt-2 text-xs font-bold px-2.5 py-1 rounded-full ${moveTypeBadge[profileUser.move_type]}`}>
                  {moveTypeLabel[profileUser.move_type]}
                  {profileUser.move_date && ` · ${format(new Date(profileUser.move_date), 'MMM d, yyyy')}`}
                </span>
              )}

              {profileUser.bio && (
                <p className="text-sm text-gray-600 mt-3">{profileUser.bio}</p>
              )}

              <div className="flex gap-4 mt-3 text-sm text-gray-400">
                {profileUser.phone && <span>{profileUser.phone}</span>}
                <span>Joined {format(new Date(profileUser.created_at), 'MMM yyyy')}</span>
              </div>
            </div>

            {!isOwnProfile && me && (
              <Link to={`/messages/${profileUser.id}`}
                className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
                Message
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {tabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === key
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {label} <span className="text-xs text-gray-400">({count})</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'listings' && (
        listings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">No listings yet.</p>
        )
      )}

      {tab === 'bundles' && (
        bundles.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((b) => <BundleCard key={b.id} bundle={b} />)}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">No bundles yet.</p>
        )
      )}

      {tab === 'saved' && isOwnProfile && (
        saved.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {saved.map((l) => <ListingCard key={l.id} listing={l} />)}
          </div>
        ) : (
          <p className="text-center text-gray-400 py-12">No saved listings yet.</p>
        )
      )}
    </div>
  );
}
