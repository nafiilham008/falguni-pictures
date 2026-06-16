import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssetUrl, API_BASE_URL } from '../config/constants';
import { ArrowRight, Link2 } from 'lucide-react';

export default function GeneralLanding() {
  const [settings, setSettings] = useState({
    landing_title: 'MRF Photography',
    landing_bio: 'Capturing stories, emotions, and action. Specialized in elegant portraiture and high-impact sports photography.',
    landing_avatar: '',
    landing_cover_portrait: '',
    landing_cover_sport: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lock body scroll and set background to dark
    document.body.className = "bg-[#0a0a0a] text-gray-100 font-sans transition-colors duration-500 no-scrollbar";
    
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(prev => ({
            ...prev,
            ...data
          }));
        }
      } catch (err) {
        console.error("Failed to fetch settings for landing", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-slate-800 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  const avatarUrl = settings.landing_avatar 
    ? getAssetUrl(settings.landing_avatar) 
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';

  // Resolve cover image from active portrait spotlight hero image
  const activePortraitSpotlight = settings.portrait_spotlight || 'wisuda';
  const portraitCoverPath = settings[`hero_image_${activePortraitSpotlight}`] || settings.landing_cover_portrait;
  const coverPortrait = portraitCoverPath 
    ? getAssetUrl(portraitCoverPath)
    : 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200';

  // Resolve cover image from general sport hero image
  const sportCoverPath = settings.hero_image_sport || settings.landing_cover_sport;
  const coverSport = sportCoverPath 
    ? getAssetUrl(sportCoverPath)
    : 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=1200';

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col justify-between p-6 md:p-12 relative overflow-hidden">
      {/* Background ambient glows */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-rose-950/10 blur-[150px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-red-950/15 blur-[150px]"></div>
      </div>

      {/* Profile Header */}
      <header className="text-center max-w-4xl mx-auto pt-6 pb-10 flex flex-col items-center">
        <div className="relative mb-6 group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-600 rounded-full blur opacity-40 group-hover:opacity-70 transition duration-1000 group-hover:duration-200"></div>
          <img 
            src={avatarUrl} 
            alt={settings.landing_title} 
            className="relative w-24 h-24 md:w-28 md:h-28 object-cover rounded-full border border-white/10"
          />
        </div>
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-[0.25em] mb-4 text-white drop-shadow-md">
          {settings.landing_title}
        </h1>
        <p className="text-sm md:text-base text-gray-400 font-light leading-relaxed max-w-2xl text-center px-4">
          {settings.landing_bio}
        </p>
      </header>

      {/* Portals Showcase */}
      <main className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-6">
        
        {/* PORTRAIT PORTAL */}
        <Link 
          to="/falguni"
          className="group relative h-[380px] md:h-[450px] w-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900/40 shadow-2xl transition-all duration-500 hover:shadow-[0_0_50px_rgba(251,113,133,0.15)] hover:border-rose-500/25 flex flex-col justify-end p-8"
        >
          {/* Cover Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={coverPortrait} 
              alt="MRF Portrait" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.4] group-hover:brightness-[0.45]"
            />
            {/* Soft Warm gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          </div>

          {/* Card Content */}
          <div className="relative z-10 text-left">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-block mb-3">
              Elegant Fine-Art
            </span>
            <h2 className="text-3xl md:text-4xl font-serif italic text-white mb-2 drop-shadow-lg">
              MRF Portrait
            </h2>
            <p className="text-gray-300 text-sm md:text-base mb-6 font-light leading-relaxed max-w-md">
              Elegant wedding, warm graduation, and beautiful editorial engagement sessions tailored for timeless memories.
            </p>
            <div className="flex items-center gap-2 text-rose-300 font-semibold group-hover:translate-x-2 transition-transform duration-300 text-sm md:text-base">
              <span>View Portrait Works</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

        {/* SPORT PORTAL */}
        <Link 
          to="/velolens"
          className="group relative h-[380px] md:h-[450px] w-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900/40 shadow-2xl transition-all duration-500 hover:shadow-[0_0_50px_rgba(239,68,68,0.25)] hover:border-red-500/25 flex flex-col justify-end p-8"
        >
          {/* Cover Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={coverSport} 
              alt="VeloLens" 
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[0.35] group-hover:brightness-[0.4]"
            />
            {/* Cinematic Red gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
          </div>

          {/* Card Content */}
          <div className="relative z-10 text-left">
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-600/25 text-red-400 border border-red-500/30 inline-block mb-3">
              Cinematic Action
            </span>
            <h2 className="text-3xl md:text-4xl font-black uppercase tracking-wider text-white mb-2 drop-shadow-lg">
              VeloLens
            </h2>
            <p className="text-gray-300 text-sm md:text-base mb-6 font-light leading-relaxed max-w-md">
              Bold, fast-paced action captures and dramatic, high-energy sports and event coverage.
            </p>
            <div className="flex items-center gap-2 text-red-400 font-semibold group-hover:translate-x-2 transition-transform duration-300 text-sm md:text-base">
              <span>Explore Sport Works</span>
              <ArrowRight size={16} />
            </div>
          </div>
        </Link>

      </main>

      {/* Footer link to Linktree replacement */}
      <footer className="text-center pt-10 pb-4 relative z-10">
        <Link 
          to="/links"
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-300 hover:scale-105 text-sm text-gray-300 hover:text-white"
        >
          <Link2 size={16} />
          <span className="font-semibold tracking-wider">Connect &amp; Social Links</span>
        </Link>
      </footer>
    </div>
  );
}
