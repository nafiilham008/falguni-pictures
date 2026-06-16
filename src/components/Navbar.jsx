import { useState, useEffect } from 'react';
import { getAssetUrl, API_BASE_URL } from '../config/constants';

export default function Navbar({ theme }) {
  const isSport = theme === 'sport';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoUrl, setLogoUrl] = useState(null);
  const [useTextLogo, setUseTextLogo] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          const customLogo = isSport ? data.logo_sport : data.logo_portrait;
          if (customLogo) {
            setLogoUrl(getAssetUrl(customLogo));
            setUseTextLogo(false);
          } else {
            if (isSport) {
              // VeloLens has no default image, use typographic placeholder
              setUseTextLogo(true);
            } else {
              // Falguni has default image
              setLogoUrl(getAssetUrl('assets/media/logo-transparent.png'));
              setUseTextLogo(false);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch custom logo", err);
        if (!isSport) {
          setLogoUrl(getAssetUrl('assets/media/logo-transparent.png'));
        } else {
          setUseTextLogo(true);
        }
      }
    };
    fetchLogo();
  }, [theme]);

  return (
    <nav className={`fixed w-full z-50 top-0 transition-theme backdrop-blur-md border-b ${isSport ? 'bg-dark/95 border-gray-800' : 'bg-light/95 border-gray-300'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 cursor-pointer flex items-center">
            {useTextLogo ? (
              <span className="text-xl md:text-2xl font-black uppercase tracking-[0.2em] text-white select-none hover:text-red-500 transition-colors">
                VeloLens
              </span>
            ) : (
              logoUrl && (
                <img 
                  id="logo-img" 
                  src={logoUrl} 
                  alt={isSport ? "VeloLens" : "Falguni Portrait"} 
                  className={`h-12 md:h-16 transition-all duration-700 object-contain ${isSport ? 'invert drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]' : 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]'}`}
                />
              )
            )}
          </div>
          <div className={`hidden md:flex space-x-8 items-center text-sm tracking-widest ${isSport ? 'font-semibold text-[#888]' : 'font-serif italic text-slate-600'}`}>
            <a href="#home" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>HOME</a>
            <a href="#portfolio" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>PORTFOLIO</a>
            <a href="#about" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>ABOUT</a>
            <a href="#testimonials" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>TESTIMONIALS</a>
            <a href="#contact" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>CONTACT</a>
          </div>
          <div className="md:hidden flex items-center space-x-4">
            <button onClick={toggleMobileMenu} className={`p-2 transition-colors ${isSport ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className={`md:hidden absolute top-20 left-0 w-full border-b shadow-lg transition-theme ${isSport ? 'bg-dark/95 border-gray-800' : 'bg-light/95 border-gray-300'}`}>
          <div className={`flex flex-col px-4 pt-2 pb-6 space-y-4 text-center ${isSport ? 'font-semibold text-gray-300 tracking-widest' : 'font-serif italic text-slate-700'}`}>
            <a href="#home" onClick={closeMobileMenu} className={`block px-3 py-2 rounded-md ${isSport ? 'hover:text-white hover:bg-white/10' : 'hover:text-slate-900 hover:bg-slate-100'}`}>HOME</a>
            <a href="#portfolio" onClick={closeMobileMenu} className={`block px-3 py-2 rounded-md ${isSport ? 'hover:text-white hover:bg-white/10' : 'hover:text-slate-900 hover:bg-slate-100'}`}>PORTFOLIO</a>
            <a href="#about" onClick={closeMobileMenu} className={`block px-3 py-2 rounded-md ${isSport ? 'hover:text-white hover:bg-white/10' : 'hover:text-slate-900 hover:bg-slate-100'}`}>ABOUT</a>
            <a href="#testimonials" onClick={closeMobileMenu} className={`block px-3 py-2 rounded-md ${isSport ? 'hover:text-white hover:bg-white/10' : 'hover:text-slate-900 hover:bg-slate-100'}`}>TESTIMONIALS</a>
            <a href="#contact" onClick={closeMobileMenu} className={`block px-3 py-2 rounded-md ${isSport ? 'hover:text-white hover:bg-white/10' : 'hover:text-slate-900 hover:bg-slate-100'}`}>CONTACT</a>
          </div>
        </div>
      )}
    </nav>
  );
}
