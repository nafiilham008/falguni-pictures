import { useState, useEffect } from 'react';
import { getAssetUrl, API_BASE_URL } from '../config/constants';

export default function About({ theme }) {
  const isSport = theme === 'sport';
  const [aboutImageUrl, setAboutImageUrl] = useState('');

  useEffect(() => {
    const loadAboutImage = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (isSport) {
            setAboutImageUrl(data.about_image_sport || '');
          } else {
            const spotlight = data.portrait_spotlight || 'wisuda';
            setAboutImageUrl(data[`about_image_${spotlight}`] || '');
          }
        }
      } catch (err) {
        console.error("Failed to load about image", err);
      }
    };
    loadAboutImage();
  }, [theme]);

  const bgStyle = aboutImageUrl
    ? { backgroundImage: `url('${getAssetUrl(aboutImageUrl)}')` }
    : {};

  return (
    <section id="about" className="py-24 relative overflow-hidden">
      {aboutImageUrl && (
        <div 
          className={`absolute inset-0 transition-opacity duration-1000 bg-center bg-cover bg-fixed ${isSport ? 'opacity-20 filter grayscale blur-sm' : 'opacity-30 blur-sm'}`}
          style={bgStyle}
        ></div>
      )}
      {/* Fallback gradient when no image is set */}
      {!aboutImageUrl && (
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            background: isSport
              ? 'radial-gradient(ellipse at center, #7f1d1d 0%, transparent 70%)'
              : 'radial-gradient(ellipse at center, #fce7f3 0%, transparent 70%)'
          }}
        />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className={`text-center mb-16 p-8 rounded-3xl backdrop-blur-md border ${isSport ? 'bg-black/60 border-gray-800' : 'bg-white/60 border-white shadow-xl'}`}>
          <h2 className={`text-sm tracking-[0.2em] font-bold uppercase mb-4 ${isSport ? 'text-red-500' : 'text-slate-500'}`}>
            The Story Behind {isSport ? 'VeloLens' : 'Falguni'}
          </h2>
          <h3 className={`text-4xl md:text-5xl mb-8 ${isSport ? 'font-black uppercase tracking-tight' : 'font-serif italic text-slate-900'}`}>
            {isSport ? 'VeloLens' : 'Falguni'}
          </h3>
          <p className={`text-lg md:text-xl leading-relaxed max-w-3xl mx-auto mb-8 ${isSport ? 'text-gray-300' : 'text-slate-700'}`}>
            We are a visual collective dedicated to freezing the crucial moments in your life. 
            From the sweat of struggle on the green field to the happy tears at the wedding altar, 
            our cameras are always ready to retell your stories.
          </p>
          <div className="flex justify-center gap-8 text-center mt-12">
            <div>
              <h4 className={`text-4xl mb-2 ${isSport ? 'font-black text-white' : 'font-serif italic text-slate-900'}`}>5+</h4>
              <p className={`text-sm tracking-widest uppercase ${isSport ? 'text-gray-500' : 'text-slate-500'}`}>Years of Experience</p>
            </div>
            <div>
              <h4 className={`text-4xl mb-2 ${isSport ? 'font-black text-white' : 'font-serif italic text-slate-900'}`}>200+</h4>
              <p className={`text-sm tracking-widest uppercase ${isSport ? 'text-gray-500' : 'text-slate-500'}`}>Events Completed</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
