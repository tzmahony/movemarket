import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Bundle } from '../types';
import { getBundles } from '../api';
import BundleCard from '../components/BundleCard';
import { useAuth } from '../context/AuthContext';
import CityInput from '../components/CityInput';
import MapPicker from '../components/MapPicker';

export default function Bundles() {
  const { user } = useAuth();
  const [bundles, setBundles] = useState<Bundle[]>([]);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 12;
  const [mapMode, setMapMode] = useState(false);
  const [mapLocation, setMapLocation] = useState<{ lat: number | null; lng: number | null; radius: number }>({ lat: null, lng: null, radius: 10 });

  const fetchBundles = async (reset = false) => {
    setLoading(true);
    const currentSkip = reset ? 0 : skip;
    try {
      const params: any = { skip: currentSkip, limit };
      if (mapMode && mapLocation.lat !== null) {
        params.lat = mapLocation.lat;
        params.lng = mapLocation.lng!;
        params.radius_km = mapLocation.radius;
      } else if (!mapMode && city) {
        params.city = city;
      }
      if (search) params.search = search;
      const res = await getBundles(params);
      if (reset) {
        setBundles(res.data);
        setSkip(limit);
      } else {
        setBundles((prev) => [...prev, ...res.data]);
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
    fetchBundles(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    setSkip(0);
    fetchBundles(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bundles</h1>
          <p className="text-gray-500 text-sm mt-1">Buy multiple items together at a discount</p>
        </div>
        {user && (
          <Link
            to="/bundles/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            + Create Bundle
          </Link>
        )}
      </div>

      <form onSubmit={handleFilter} className="bg-white rounded-lg shadow-md p-4 mb-8">
        <div className="flex flex-wrap gap-3 items-start">
          <input
            type="text"
            placeholder="Search bundles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm"
          />
          <div className={mapMode ? 'w-full' : 'min-w-32'}>
            <div className="flex flex-col gap-2">
              <div className="flex rounded-lg border border-gray-300 overflow-hidden text-sm w-fit">
                <button
                  type="button"
                  onClick={() => setMapMode(false)}
                  className={`px-3 py-2 ${!mapMode ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  City
                </button>
                <button
                  type="button"
                  onClick={() => setMapMode(true)}
                  className={`px-3 py-2 border-l border-gray-300 ${mapMode ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  Map
                </button>
              </div>
              {!mapMode ? (
                <CityInput
                  value={city}
                  onChange={setCity}
                  placeholder="City"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-sm w-full"
                />
              ) : (
                <MapPicker
                  mode="filter"
                  lat={mapLocation.lat}
                  lng={mapLocation.lng}
                  radius={mapLocation.radius}
                  onLocationChange={(lat, lng) => setMapLocation(prev => ({ ...prev, lat, lng }))}
                  onRadiusChange={(km) => setMapLocation(prev => ({ ...prev, radius: km }))}
                />
              )}
            </div>
          </div>
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
          >
            Filter
          </button>
        </div>
      </form>

      {bundles.length > 0 ? (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {bundles.map((bundle) => (
              <BundleCard key={bundle.id} bundle={bundle} />
            ))}
          </div>
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={() => fetchBundles(false)}
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
          <p className="text-gray-500 text-lg">No bundles found.</p>
          <p className="text-gray-400 mt-2">
            {user ? (
              <Link to="/bundles/new" className="text-indigo-600 hover:underline">Create the first bundle</Link>
            ) : 'Check back soon or create an account to post one.'}
          </p>
        </div>
      )}
    </div>
  );
}
