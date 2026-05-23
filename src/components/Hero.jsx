import { useState, useEffect } from 'react';
import { getAssetUrl, API_BASE_URL } from '../config/constants';

export default function Hero({ theme }) {
  const isSport = theme === 'sport';
  const [heroImageUrl, setHeroImageUrl] = useState('');

  useEffect(() => {
    const loadHeroImage = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (isSport) {
            setHeroImageUrl(data.hero_image_sport || '');
          } else {
            const spotlight = data.portrait_spotlight || 'wisuda';
            setHeroImageUrl(data[`hero_image_${spotlight}`] || '');
          }
        }
      } catch (err) {
        console.error("Failed to load hero image", err);
      }
    };
    loadHeroImage();
  }, [theme]);

  const bgStyle = heroImageUrl
    ? { backgroundImage: `url('${getAssetUrl(heroImageUrl)}')`, filter: 'brightness(0.5)' }
    : { background: isSport
        ? 'linear-gradient(135deg, #0f0f0f 0%, #1a0000 50%, #0f0f0f 100%)'
        : 'linear-gradient(135deg, #fdf2f8 0%, #fce7f3 50%, #fff7ed 100%)'
      };

  return (
    <section id="home" className="h-screen relative flex items-center justify-center pt-20 overflow-hidden">
      <div className={`absolute inset-0 transition-theme opacity-30 ${isSport ? 'bg-black' : 'bg-transparent'}`}></div>
      <div 
        className="absolute inset-0 transition-opacity duration-1000 bg-center bg-cover bg-no-repeat" 
        style={bgStyle}
      ></div>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className={`mb-6 transition-theme drop-shadow-md ${isSport ? 'text-5xl md:text-7xl font-black tracking-tighter uppercase text-white' : 'text-5xl md:text-7xl font-serif italic text-white drop-shadow-xl'}`}>
          {isSport ? 'Capturing The Sweat & Glory' : 'Creating Timeless Memories'}
        </h1>
        <p className={`text-xl md:text-2xl font-light mb-12 tracking-wide ${isSport ? 'text-gray-300' : 'text-slate-200 font-sans'}`}>
          Professional Photography Services for Your Most Important Moments
        </p>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className={`w-6 h-6 ${isSport ? 'text-white' : 'text-slate-800'}`} fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
        </svg>
      </div>
    </section>
  );
}
