import { getAssetUrl } from '../config/constants';

export default function Navbar({ theme, setTheme }) {
  const isSport = theme === 'sport';

  return (
    <nav className={`fixed w-full z-50 top-0 transition-theme backdrop-blur-md border-b ${isSport ? 'bg-dark/95 border-gray-800' : 'bg-light/95 border-gray-300'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 cursor-pointer">
            <img 
              id="logo-img" 
              src={getAssetUrl('assets/media/logo-transparent.png')} 
              alt="Falguni Picture" 
              className={`h-12 md:h-16 transition-all duration-700 object-contain ${isSport ? 'invert drop-shadow-[0_2px_4px_rgba(255,255,255,0.2)]' : 'drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]'}`}
            />
          </div>
          <div className={`hidden md:flex space-x-8 items-center text-sm tracking-widest ${isSport ? 'font-semibold text-[#888]' : 'font-serif italic text-slate-600'}`}>
            <a href="#home" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>HOME</a>
            <a href="#portfolio" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>PORTFOLIO</a>
            <a href="#about" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>ABOUT</a>
            <a href="#testimonials" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>TESTIMONIALS</a>
            <a href="#contact" className={`nav-link transition-colors ${isSport ? 'hover:text-white' : 'hover:text-slate-900'}`}>CONTACT</a>

            {/* Vendor Switcher Tepat di Pojok Kanan Navigasi */}
            <button 
              onClick={() => setTheme(isSport ? 'portrait' : 'sport')}
              className={`ml-6 px-4 py-2 border rounded-full text-xs font-bold uppercase tracking-widest transition-all ${isSport ? 'border-gray-700 text-gray-400 hover:text-white hover:border-white' : 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 font-sans'}`}
            >
              ➔ Looking for {isSport ? 'Portrait' : 'Sport'} ?
            </button>
          </div>
          <div className="md:hidden flex items-center space-x-4">
            <button 
              onClick={() => setTheme(isSport ? 'portrait' : 'sport')}
              className={`p-2 border rounded-full text-[10px] font-bold uppercase transition-all ${isSport ? 'border-gray-700 text-gray-400' : 'border-rose-200 bg-rose-50 text-rose-700'}`}
            >
              {isSport ? 'Portrait' : 'Sport'}
            </button>
            <button className={`${isSport ? 'text-gray-300 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}>
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
