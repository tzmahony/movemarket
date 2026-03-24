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
    <div className="bg-slate-50">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-3xl pointer-events-none translate-y-1/3" />
        {/* Dot grid */}
        <div className="absolute inset-0 dot-grid pointer-events-none opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-36">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/15 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-300 mb-8 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
            The marketplace built for movers
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05]">
            Buy & sell when<br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-300 bg-clip-text text-transparent">
              you move.
            </span>
          </h1>

          <p className="mt-6 text-lg md:text-xl text-slate-400 max-w-xl leading-relaxed">
            List furniture and items you can't take with you. Find deals from people leaving your city. Connect, negotiate, and trade — all in one place.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/listings/new"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:-translate-y-px"
            >
              List my items
            </Link>
            <Link
              to="/listings"
              className="border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white font-semibold px-7 py-3.5 rounded-xl transition-all hover:-translate-y-px"
            >
              Browse deals
            </Link>
          </div>

          {/* Feature chips */}
          <div className="mt-14 flex flex-wrap gap-3">
            {[
              '✓ Free to list',
              '✓ Message sellers directly',
              '✓ Bundle deals',
              '✓ Move announcements',
            ].map((f) => (
              <span key={f} className="text-sm text-slate-500 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5">
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-3">How it works</p>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Simple as three steps</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '📋', title: 'Post your move', desc: "Announce that you're moving in or out. Let people know what you need or what you're selling." },
              { icon: '🏷️', title: 'List or browse items', desc: 'Create listings for items you can\'t take, or find deals from people leaving your city.' },
              { icon: '🤝', title: 'Connect & trade', desc: 'Message sellers, negotiate deals, and pick up items. Build bundles for bigger discounts.' },
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="absolute -top-3 -left-1 text-8xl font-black text-slate-100 select-none leading-none group-hover:text-indigo-50 transition-colors">
                  {i + 1}
                </div>
                <div className="relative bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-slate-200 rounded-2xl p-7 hover:border-indigo-200 transition-colors">
                  <div className="text-3xl mb-4">{step.icon}</div>
                  <h3 className="font-bold text-slate-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Moving Boxes Banner ───────────────────────────────────────────── */}
      <section className="py-10 bg-amber-50 border-y border-amber-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-2xl">📦</div>
            <div>
              <h2 className="text-lg font-bold text-amber-900">Moving boxes — free or cheap</h2>
              <p className="text-amber-700 text-sm mt-0.5">Got boxes from your move? List them. Moving in? Grab someone else's.</p>
            </div>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link to="/listings?category=boxes" className="bg-amber-500 text-white font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-600 transition-colors text-sm shadow-sm">
              Browse boxes
            </Link>
            <Link to="/listings/new" className="bg-white text-amber-700 border border-amber-200 font-semibold px-5 py-2.5 rounded-xl hover:bg-amber-50 transition-colors text-sm">
              List my boxes
            </Link>
          </div>
        </div>
      </section>

      {/* ── Recent Listings ──────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-1">Fresh inventory</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Recent listings</h2>
            </div>
            <Link to="/listings" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : listings.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {listings.map((listing) => <ListingCard key={listing.id} listing={listing} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-slate-500">No listings yet. Be the first to post!</p>
              <Link to="/listings/new" className="mt-4 inline-block text-sm text-indigo-600 font-semibold hover:text-indigo-500">Create a listing →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Recent Moves ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p className="text-indigo-600 font-semibold text-sm uppercase tracking-widest mb-1">People on the move</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Move announcements</h2>
            </div>
            <Link to="/moves" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 transition-colors">
              View all
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            </div>
          ) : moves.length > 0 ? (
            <div className="space-y-4">
              {moves.map((move) => <MoveCard key={move.id} move={move} />)}
            </div>
          ) : (
            <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="text-4xl mb-3">🗺️</div>
              <p className="text-slate-500">No move announcements yet.</p>
              <Link to="/moves/new" className="mt-4 inline-block text-sm text-indigo-600 font-semibold hover:text-indigo-500">Post your move →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="grid md:grid-cols-3 gap-10 pb-10 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <svg viewBox="0 0 20 20" fill="white" width="14" height="14">
                    <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
                    <path fillRule="evenodd" d="M2 7.5h16l-1.5 9a1 1 0 01-.99.84H4.49a1 1 0 01-.99-.84L2 7.5zm5 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white font-bold">MoveMarket</span>
              </div>
              <p className="text-sm leading-relaxed">The marketplace for people on the move.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Marketplace</h4>
              <div className="space-y-2.5 text-sm">
                <Link to="/listings" className="block hover:text-white transition-colors">Browse listings</Link>
                <Link to="/bundles" className="block hover:text-white transition-colors">Bundles</Link>
                <Link to="/moves" className="block hover:text-white transition-colors">Move board</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4 text-sm">Account</h4>
              <div className="space-y-2.5 text-sm">
                <Link to="/register" className="block hover:text-white transition-colors">Create account</Link>
                <Link to="/login" className="block hover:text-white transition-colors">Sign in</Link>
              </div>
            </div>
          </div>
          <div className="pt-8 text-center text-xs text-slate-600">
            &copy; {new Date().getFullYear()} MoveMarket. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
