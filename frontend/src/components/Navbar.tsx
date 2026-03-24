import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getConversations } from '../api';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const fetchUnread = () => {
      getConversations()
        .then((r) => setUnreadCount(r.data.reduce((s, c) => s + c.unread_count, 0)))
        .catch(() => {});
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">

          {/* Left: Logo + nav links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm group-hover:bg-indigo-500 transition-colors">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
                  <path d="M2 3a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
                  <path fillRule="evenodd" d="M2 7.5h16l-1.5 9a1 1 0 01-.99.84H4.49a1 1 0 01-.99-.84L2 7.5zm5 2a.5.5 0 01.5-.5h5a.5.5 0 010 1h-5a.5.5 0 01-.5-.5z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">MoveMarket</span>
            </Link>

            <div className="hidden md:flex items-center gap-7">
              <Link to="/listings" className="nav-link">Browse</Link>
              <Link to="/bundles" className="nav-link">Bundles</Link>
              <Link to="/moves" className="nav-link">Move Board</Link>
              {user && (
                <Link to="/messages" className="nav-link relative">
                  Messages
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-4 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* Right: Auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <Link to="/dashboard" className="nav-link text-sm">Dashboard</Link>
                <Link
                  to={`/profile/${user.id}`}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-sm text-slate-400 hover:text-red-500 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors font-medium text-sm shadow-sm"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-slate-500 hover:text-slate-900 p-2 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <div className="md:hidden border-t border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="px-4 py-3 space-y-1">
            {['Browse:/listings', 'Bundles:/bundles', 'Move Board:/moves'].map((item) => {
              const [label, href] = item.split(':');
              return (
                <Link key={href} to={href} onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium transition-colors">
                  {label}
                </Link>
              );
            })}
            {user ? (
              <>
                <Link to="/messages" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors">Messages</Link>
                <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium transition-colors">Dashboard</Link>
                <Link to={`/profile/${user.id}`} onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-500 text-sm transition-colors">{user.name}</Link>
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 text-red-500 text-sm font-medium">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg text-slate-600 hover:bg-slate-100 font-medium">Login</Link>
                <Link to="/register" onClick={() => setMobileOpen(false)} className="block px-3 py-2.5 rounded-lg bg-indigo-600 text-white font-medium text-center mt-2">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
