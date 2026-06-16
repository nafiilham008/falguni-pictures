import { useState, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Portfolio from './components/Portfolio';
import Pricing from './components/Pricing';
import About from './components/About';
import Testimonials from './components/Testimonials';
import Contact from './components/Contact';
import Footer from './components/Footer';
import ReviewForm from './pages/ReviewForm';
import GeneralLanding from './pages/GeneralLanding';
import BioLinks from './pages/BioLinks';

// Admin Components
import AdminLayout from './admin/AdminLayout';
import Dashboard from './admin/Dashboard';
import ManagePortfolio from './admin/ManagePortfolio';
import ManagePackages from './admin/ManagePackages';
import ManageTestimonials from './admin/ManageTestimonials';
import ManageBookings from './admin/ManageBookings';
import Notifications from './admin/Notifications';
import Settings from './admin/Settings';
import Login from './admin/Login';
import ProtectedRoute from './admin/ProtectedRoute';
import { API_BASE_URL } from './config/constants';

// Create a component for the main website to wrap existing logic
function MainWebsite({ theme }) {
  const [isInitializing, setIsInitializing] = useState(true);

  const location = useLocation();
  const isFirstMount = useRef(true);
  const navigate = useNavigate();

  // Reset initialization state on theme change
  useEffect(() => {
    setIsInitializing(false);
    
    // Scroll to top on load or route change
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [theme]);

  // Visitor Tracking
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        await fetch(`${API_BASE_URL}/api/analytics`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event_type: 'page_view',
            theme: theme,
            metadata: { path: location.pathname }
          })
        });
      } catch (err) {
        console.error("Failed to track visitor", err);
      }
    };
    
    // Slight delay to not block rendering
    const timer = setTimeout(trackVisitor, 2000);
    return () => clearTimeout(timer);
  }, [theme, location.pathname]);

  // Toggle Body Classes based on Theme
  useEffect(() => {
    const body = document.body;
    if (theme === 'sport') {
      body.className = "bg-dark text-gray-100 font-sans transition-theme relative no-scrollbar";
    } else {
      body.className = "bg-light text-slate-800 font-serif transition-theme relative no-scrollbar";
    }
  }, [theme]);

  const isSport = theme === 'sport';

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-700 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  // Theme switch handler that performs navigation instead of state toggle
  const handleSetTheme = (newTheme) => {
    navigate(newTheme === 'sport' ? '/velolens' : '/falguni');
  };

  return (
    <div className="min-h-screen">
      <div className="fixed inset-0 pointer-events-none -z-20 overflow-hidden transition-theme">
        <div className={`absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] transition-all duration-[1500ms] ${isSport ? 'mix-blend-screen opacity-20 bg-red-600' : 'mix-blend-multiply opacity-50 bg-rose-200'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-[1500ms] ${isSport ? 'mix-blend-screen opacity-20 bg-orange-600' : 'mix-blend-multiply opacity-50 bg-amber-100'}`}></div>
        <div className={`absolute inset-0 transition-opacity duration-1000 pointer-events-none mix-blend-overlay ${isSport ? 'opacity-100' : 'opacity-0'}`} style={{backgroundImage: "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.015) 0, rgba(255, 255, 255, 0.015) 2px, transparent 2px, transparent 15px)", backgroundSize: "auto"}}></div>
      </div>

      <div className={`fixed inset-0 pointer-events-none z-40 transition-theme overflow-hidden ${!isSport ? 'opacity-100' : 'opacity-0 hidden'}`}>
        <div className="falling-dust"></div>
        <div className="falling-dust delay-1"></div>
        <div className="falling-dust delay-2"></div>
        <div className="falling-dust delay-3"></div>
        <div className="falling-dust delay-4"></div>
      </div>

      <Navbar theme={theme} setTheme={handleSetTheme} />
      <Hero theme={theme} />
      <Portfolio theme={theme} />
      <Pricing theme={theme} />
      <About theme={theme} />
      <Testimonials theme={theme} />
      <Contact theme={theme} />
      <Footer theme={theme} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Main General Landing Route */}
        <Route path="/" element={<GeneralLanding />} />
        
        {/* Dynamic Bio Links Route (Linktree replacement) */}
        <Route path="/links" element={<BioLinks />} />
        
        {/* Brand Portfolios Routes */}
        <Route path="/falguni" element={<MainWebsite theme="portrait" />} />
        <Route path="/velolens" element={<MainWebsite theme="sport" />} />
        
        {/* Testimonial Submission Form */}
        <Route path="/review/:token" element={<ReviewForm />} />
        
        {/* Admin Login Route */}
        <Route path="/login" element={<Login />} />
        
        {/* Protected Admin Dashboard Routes */}
        <Route path="/dashboard" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="bookings" element={<ManageBookings />} />
            <Route path="portfolio" element={<ManagePortfolio />} />
            <Route path="packages" element={<ManagePackages />} />
            <Route path="testimonials" element={<ManageTestimonials />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<Notifications />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
