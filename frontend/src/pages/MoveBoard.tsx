import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { MoveAnnouncement } from '../types';
import { getMoves } from '../api';
import MoveCard from '../components/MoveCard';
import { useAuth } from '../context/AuthContext';

type MoveTypeFilter = '' | 'moving_in' | 'moving_out';

export default function MoveBoard() {
  const { user } = useAuth();
  const [moves, setMoves] = useState<MoveAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [moveType, setMoveType] = useState<MoveTypeFilter>('');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 10;

  const fetchMoves = async (reset = false) => {
    setLoading(true);
    const currentSkip = reset ? 0 : skip;
    try {
      const params: any = { skip: currentSkip, limit };
      if (city) params.city = city;
      if (moveType) params.move_type = moveType;
      const res = await getMoves(params);
      if (reset) {
        setMoves(res.data);
        setSkip(limit);
      } else {
        setMoves((prev) => [...prev, ...res.data]);
        setSkip((prev) => prev + limit);
      }
      setHasMore(res.data.length === limit);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMoves(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchMoves(true);
  };

  const setTypeAndReset = (val: MoveTypeFilter) => {
    setMoveType(val);
    setSkip(0);
    // Trigger fetch on next render cycle
    setTimeout(() => fetchMoves(true), 0);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Move Board</h1>
          <p className="text-gray-500 text-sm mt-1">People announcing moves — find your match</p>
        </div>
        {user && (
          <Link
            to="/moves/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            + Post Your Move
          </Link>
        )}
      </div>

      {/* Type tabs */}
      <div className="flex gap-2 mb-4">
        {(['', 'moving_in', 'moving_out'] as MoveTypeFilter[]).map((t) => (
          <button
            key={t}
            onClick={() => setTypeAndReset(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              moveType === t
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 border border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
            }`}
          >
            {t === '' ? 'All' : t === 'moving_in' ? 'Moving In' : 'Moving Out'}
          </button>
        ))}
      </div>

      {/* City filter */}
      <form onSubmit={handleFilter} className="flex gap-3 mb-6">
        <input
          type="text"
          placeholder="Filter by city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
        />
        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
        >
          Search
        </button>
      </form>

      {moves.length > 0 ? (
        <div className="space-y-4">
          {moves.map((move) => (
            <MoveCard key={move.id} move={move} />
          ))}
          {hasMore && (
            <div className="text-center pt-4">
              <button
                onClick={() => fetchMoves(false)}
                disabled={loading}
                className="bg-white text-indigo-600 border border-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </div>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No move announcements yet.</p>
          {user ? (
            <Link to="/moves/new" className="text-indigo-600 hover:underline text-sm mt-2 inline-block">
              Be the first to post
            </Link>
          ) : (
            <p className="text-gray-400 text-sm mt-2">Sign in to post your move.</p>
          )}
        </div>
      )}
    </div>
  );
}
