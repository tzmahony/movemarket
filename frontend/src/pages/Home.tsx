import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Listing, MoveAnnouncement } from '../types';
import { getListings, getMoves } from '../api';
import ListingCard from '../components/ListingCard';
import MoveCard from '../components/MoveCard';

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [moves, setMoves] = useState<MoveAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getListings({ limit: 6 }).catch(() => ({ data: [] })),
      getMoves({ limit: 4 }).catch(() => ({ data: [] })),
    ]).then(([listingsRes, movesRes]) => {
      setListings(listingsRes.data);
      setMoves(movesRes.data);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Buy & Sell When You Move
            </h1>
            <p className="mt-4 text-lg md:text-xl text-indigo-100">
              The marketplace for people on the move. List items you can't take, find deals from people leaving town, and connect with your new community.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/listings/new"
                className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                I'm Moving Out
              </Link>
              <Link
                to="/listings"
                className="bg-indigo-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-400 transition-colors border border-indigo-400"
              >
                I'm Moving In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📋', title: 'Post Your Move', desc: 'Announce that you\'re moving in or out. Let people know what you need or what you\'re selling.' },
              { icon: '🏷️', title: 'List or Browse Items', desc: 'Create listings for items you can\'t take, or browse deals from people leaving your city.' },
              { icon: '🤝', title: 'Connect & Trade', desc: 'Message sellers, negotiate deals, and pick up items. Build bundles for bigger discounts.' },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl mb-4">{step.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
                <p className="mt-2 text-gray-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
            <Link to="/listings" className="text-indigo-600 hover:text-indigo-700 font-medium">
              View all &rarr;
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : listings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No listings yet. Be the first to post!</p>
          )}
        </div>
      </section>

      {/* Recent Moves */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Recent Move Announcements</h2>
            <Link to="/moves" className="text-indigo-600 hover:text-indigo-700 font-medium">
              View all &rarr;
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : moves.length > 0 ? (
            <div className="space-y-4">
              {moves.map((move) => (
                <MoveCard key={move.id} move={move} />
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-12">No move announcements yet.</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-white font-bold text-lg mb-3">📦 MoveMarket</h3>
              <p className="text-sm">The marketplace for people on the move.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link to="/listings" className="block hover:text-white transition-colors">Browse Listings</Link>
                <Link to="/bundles" className="block hover:text-white transition-colors">Bundles</Link>
                <Link to="/moves" className="block hover:text-white transition-colors">Move Board</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Get Started</h4>
              <div className="space-y-2 text-sm">
                <Link to="/register" className="block hover:text-white transition-colors">Create Account</Link>
                <Link to="/login" className="block hover:text-white transition-colors">Sign In</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} MoveMarket. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
