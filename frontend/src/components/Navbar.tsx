import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left: Logo + nav links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
              <span className="text-2xl">📦</span>
              MoveMarket
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/listings" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                Browse
              </Link>
              <Link to="/bundles" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                Bundles
              </Link>
              <Link to="/moves" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                Move Board
              </Link>
              {user && (
                <Link to="/messages" className="text-gray-600 hover:text-indigo-600 transition-colors font-medium">
                  Messages
                </Link>
              )}
            </div>
          </div>

          {/* Right: Auth */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                >
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-500 hover:text-red-600 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-600 hover:text-indigo-600 p-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            <Link to="/listings" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 hover:text-indigo-600 font-medium">
              Browse
            </Link>
            <Link to="/bundles" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 hover:text-indigo-600 font-medium">
              Bundles
            </Link>
            <Link to="/moves" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 hover:text-indigo-600 font-medium">
              Move Board
            </Link>
            {user ? (
              <>
                <Link to="/messages" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 hover:text-indigo-600 font-medium">
                  Messages
                </Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 hover:text-indigo-600 font-medium">
                  Dashboard
                </Link>
                <Link to={`/profile/${user.id}`} onClick={() => setMobileOpen(false)} className="block py-2 text-gray-500 text-sm">
                  {user.name}
                </Link>
                <button onClick={handleLogout} className="block py-2 text-red-600 text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block py-2 text-gray-600 hover:text-indigo-600 font-medium">
                  Login
                </Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block py-2 text-indigo-600 font-medium">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
