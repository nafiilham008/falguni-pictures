import { useState, useEffect, useRef } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image as ImageIcon, LogOut, Package, MessageSquareQuote, CalendarCheck, Settings as SettingsIcon, Home, Search, Loader2 } from 'lucide-react';
import { getAssetUrl } from '../config/constants';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        try {
          const token = localStorage.getItem('falguni_admin_token');
          const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(searchQuery)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
            setShowResults(true);
          }
        } catch (err) {
          console.error("Search failed", err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleResultClick = (type) => {
    setShowResults(false);
    setSearchQuery('');
    if (type === 'booking') navigate('/dashboard/bookings');
    else if (type === 'portfolio') navigate('/dashboard/portfolio');
    else if (type === 'testimonial') navigate('/dashboard/testimonials');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Booking Logs', path: '/dashboard/bookings', icon: CalendarCheck },
    { name: 'Manage Portfolio', path: '/dashboard/portfolio', icon: ImageIcon },
    { name: 'Manage Packages', path: '/dashboard/packages', icon: Package },
    { name: 'Manage Testimonials', path: '/dashboard/testimonials', icon: MessageSquareQuote },
    { name: 'Settings', path: '/dashboard/settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col fixed h-full z-10">
        <div className="h-20 flex items-center px-6 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center space-x-3 text-slate-900 hover:opacity-80 transition-opacity w-full">
            <img
              src={getAssetUrl('assets/media/logo-transparent.png')}
              alt="Falguni Picture"
              className="h-10 w-10 object-contain drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
            />
            <span className="text-lg font-black tracking-widest uppercase text-slate-800 font-sans">Falguni</span>
          </Link>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${isActive
                    ? 'bg-slate-900 text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                  }`}
              >
                <Icon size={20} />
                <span className="font-semibold">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <Link
            to="/"
            target="_blank"
            className="flex items-center space-x-3 px-4 py-3 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors font-semibold"
          >
            <Home size={20} />
            <span>View Website</span>
          </Link>
          <Link
            to="/"
            onClick={() => localStorage.removeItem('falguni_admin_token')}
            className="flex items-center space-x-3 px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors font-semibold"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen">
        {/* Top Navbar for Global Search */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10 flex items-center px-8 justify-between">
          <div className="flex-1 max-w-xl relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search Clients, Portfolio, Testimonials ..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowResults(true);
                }}
                onFocus={() => {
                  if (searchQuery.length >= 2) setShowResults(true);
                }}
                className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-transparent hover:border-gray-200 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-slate-900 rounded-xl transition-all outline-none text-sm font-semibold"
              />
              {isSearching && <Loader2 className="absolute right-3 top-2.5 animate-spin text-slate-400" size={16} />}
            </div>

            {/* Dropdown Results */}
            {showResults && searchQuery.length >= 2 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-50">
                <div className="max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="py-2">
                      {searchResults.map((item, idx) => (
                        <div
                          key={`${item.type}-${item.id}-${idx}`}
                          onClick={() => handleResultClick(item.type)}
                          className="px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <span className="font-bold text-slate-900 text-sm">{item.title}</span>
                            <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-md ${item.type === 'booking' ? 'bg-blue-100 text-blue-700' :
                                item.type === 'portfolio' ? 'bg-purple-100 text-purple-700' :
                                  'bg-green-100 text-green-700'
                              }`}>
                              {item.type}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{item.description || 'No description'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    !isSearching && <div className="p-6 text-center text-sm font-medium text-slate-500">No results found.</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </header>

        <div className="p-8 max-w-5xl mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
