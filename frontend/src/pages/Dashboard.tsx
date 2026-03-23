import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { Listing, Bundle, MoveAnnouncement, Conversation } from '../types';
import { getListings, getBundles, getMoves, getMoveMatches, getSavedListings, getConversations } from '../api';
import ListingCard from '../components/ListingCard';
import BundleCard from '../components/BundleCard';
import MoveCard from '../components/MoveCard';
import { useAuth } from '../context/AuthContext';

const moveTypeLabel: Record<string, string> = {
  moving_in: 'Moving In',
  moving_out: 'Moving Out',
  settled: 'Settled',
};

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [myListings, setMyListings] = useState<Listing[]>([]);
  const [myBundles, setMyBundles] = useState<Bundle[]>([]);
  const [myMoves, setMyMoves] = useState<MoveAnnouncement[]>([]);
  const [matches, setMatches] = useState<MoveAnnouncement[]>([]);
  const [savedItems, setSavedItems] = useState<Listing[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    Promise.all([
      getListings({ limit: 100 }).catch(() => ({ data: [] })),
      getBundles({ limit: 100 }).catch(() => ({ data: [] })),
      getMoves({ limit: 100 }).catch(() => ({ data: [] })),
      getMoveMatches().catch(() => ({ data: [] })),
      getSavedListings().catch(() => ({ data: [] })),
      getConversations().catch(() => ({ data: [] })),
    ]).then(([listingsRes, bundlesRes, movesRes, matchesRes, savedRes, convsRes]) => {
      setMyListings((listingsRes.data as Listing[]).filter((l) => l.user_id === user.id));
      setMyBundles((bundlesRes.data as Bundle[]).filter((b) => b.user_id === user.id));
      setMyMoves((movesRes.data as MoveAnnouncement[]).filter((m) => m.user_id === user.id));
      setMatches(matchesRes.data as MoveAnnouncement[]);
      setSavedItems(savedRes.data as Listing[]);
      setConversations(convsRes.data as Conversation[]);
    }).finally(() => setLoading(false));
  }, [user, authLoading, navigate]);

  if (!user) return null;

  const unreadCount = conversations.reduce((s, c) => s + c.unread_count, 0);
  const activeListings = myListings.filter((l) => l.status === 'available');

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl p-6 text-white mb-8">
        <h1 className="text-2xl font-bold">Welcome back, {user.name}!</h1>
        {user.move_type && (
          <p className="text-indigo-200 mt-1">
            Status: <span className="text-white font-medium">{moveTypeLabel[user.move_type]}</span>
            {user.city && <> in {user.city}</>}
          </p>
        )}
        {!user.move_type && (
          <p className="text-indigo-200 mt-1">
            <Link to={`/profile/${user.id}`} className="underline hover:text-white">
              Update your move status
            </Link>
            {' '}to see personalized matches.
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Active Listings', value: activeListings.length, link: `/profile/${user.id}`, color: 'text-indigo-600' },
          { label: 'Bundles', value: myBundles.length, link: '/bundles', color: 'text-purple-600' },
          { label: 'Unread Messages', value: unreadCount, link: '/messages', color: unreadCount > 0 ? 'text-red-500' : 'text-gray-500' },
          { label: 'Saved Items', value: savedItems.length, link: `/profile/${user.id}`, color: 'text-green-600' },
        ].map(({ label, value, link, color }) => (
          <Link key={label} to={link} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link to="/listings/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm">
          + New Listing
        </Link>
        <Link to="/bundles/new"
          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm">
          + Create Bundle
        </Link>
        <Link to="/moves/new"
          className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium text-sm">
          + Post Move
        </Link>
        <Link to={`/profile/${user.id}`}
          className="border border-gray-300 text-gray-600 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm">
          View Profile
        </Link>
      </div>

      {/* My move announcements */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your Move Announcements</h2>
          <Link to="/moves/new" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            + Post Move
          </Link>
        </div>
        {myMoves.length > 0 ? (
          <div className="space-y-3">
            {myMoves.map((move) => (
              <MoveCard key={move.id} move={move} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-400 mb-3">You haven't posted any move announcements yet.</p>
            <Link to="/moves/new" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Post your move &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Move matches */}
      {matches.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Move Matches</h2>
              <p className="text-sm text-gray-500">People whose moves align with yours</p>
            </div>
            <Link to="/moves" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View all &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {matches.slice(0, 3).map((move) => (
              <MoveCard key={move.id} move={move} />
            ))}
          </div>
        </section>
      )}

      {/* My listings */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">Your Listings</h2>
          <Link to="/listings/new" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
            + Add new
          </Link>
        </div>
        {myListings.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myListings.slice(0, 6).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center">
            <p className="text-gray-400 mb-3">You haven't listed anything yet.</p>
            <Link to="/listings/new"
              className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Create your first listing &rarr;
            </Link>
          </div>
        )}
      </section>

      {/* Saved items */}
      {savedItems.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Saved Items</h2>
            <Link to={`/profile/${user.id}`} className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
              View all &rarr;
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedItems.slice(0, 3).map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
