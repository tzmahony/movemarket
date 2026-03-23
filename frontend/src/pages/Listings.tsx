import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Listing } from '../types';
import { getListings } from '../api';
import ListingCard from '../components/ListingCard';
import { useAuth } from '../context/AuthContext';
import CityInput from '../components/CityInput';

const CATEGORIES = ['', 'furniture', 'electronics', 'clothing', 'kitchen', 'books', 'sports', 'decor', 'boxes', 'other'];
const CONDITIONS = ['', 'new', 'like new', 'good', 'fair', 'poor'];

export default function Listings() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    category: searchParams.get('category') || '',
    condition: '',
    min_price: '',
    max_price: '',
    search: '',
  });
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;

  const fetchListings = async (reset = false) => {
    setLoading(true);
    const currentSkip = reset ? 0 : skip;
    try {
      const params: any = { skip: currentSkip, limit };
      if (filters.city) params.city = filters.city;
      if (filters.category) params.category = filters.category;
      if (filters.condition) params.condition = filters.condition;
      if (filters.min_price) params.min_price = Number(filters.min_price);
      if (filters.max_price) params.max_price = Number(filters.max_price);
      if (filters.search) params.search = filters.search;

      const res = await getListings(params);
      if (reset) {
        setListings(res.data);
        setSkip(limit);
      } else {
        setListings((prev) => [...prev, ...res.data]);
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
    fetchListings(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchListings(true);
  };

  const updateFilter = (field: string, value: string) =>
    setFilters((prev) => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Browse Listings</h1>
        {user && (
          <Link
            to="/listings/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            + Create Listing
          </Link>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <input
            type="text"
            placeholder="Search..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          />
          <CityInput
            value={filters.city}
            onChange={(v) => updateFilter('city', v)}
            placeholder="City"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm w-full"
          />
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          >
            <option value="">All Categories</option>
            {CATEGORIES.filter(Boolean).map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <select
            value={filters.condition}
            onChange={(e) => updateFilter('condition', e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          >
            <option value="">All Conditions</option>
            {CONDITIONS.filter(Boolean).map((c) => (
              <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min $"
              value={filters.min_price}
              onChange={(e) => updateFilter('min_price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
            <input
              type="number"
              placeholder="Max $"
              value={filters.max_price}
              onChange={(e) => updateFilter('max_price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            Filter
          </button>
        </div>
      </form>

      {/* Grid */}
      {listings.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchListings(false)}
                disabled={loading}
                className="bg-white text-indigo-600 border border-indigo-600 px-6 py-2 rounded-lg hover:bg-indigo-50 transition-colors font-medium text-sm disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Load More'}
              </button>
            </div>
          )}
        </>
      ) : loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-500 text-lg">No listings found.</p>
          <p className="text-gray-400 mt-2">Try adjusting your filters or create a new listing.</p>
        </div>
      )}
    </div>
  );
}
