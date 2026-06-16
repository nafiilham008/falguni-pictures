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
  const [recentImages, setRecentImages] = useState([]);

  const prefetchTheme = async (theme) => {
    try {
      fetch(`${API_BASE_URL}/api/events?theme=${theme === 'sport' ? 'sport' : 'portrait'}`);
      fetch(`${API_BASE_URL}/api/packages?theme=${theme === 'sport' ? 'sport' : 'portrait'}`);
    } catch (e) {
      // Ignore prefetch failures
    }
  };

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
          
          // Inject JSON-LD Schema Markup dynamically for SEO
          const schemaData = {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            "name": data.landing_title || "MRF Photography",
            "image": data.landing_avatar ? getAssetUrl(data.landing_avatar) : '',
            "description": data.landing_bio || '',
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Yogyakarta",
              "addressCountry": "ID"
            },
            "url": window.location.origin,
            "sameAs": [
              `https://instagram.com/${(data.instagram_username || 'mrfphotography').replace('@','')}`
            ]
          };
          
          const script = document.createElement('script');
          script.type = 'application/ld+json';
          script.id = 'jsonld-schema';
          script.text = JSON.stringify(schemaData);
          document.head.appendChild(script);
        }
      } catch (err) {
        console.error("Failed to fetch settings for landing", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/events`);
        if (res.ok) {
          const events = await res.json();
          const images = [];
          events.forEach(evt => {
            const cover = evt.images.find(img => img.is_cover) || evt.images[0];
            if (cover) {
              images.push({
                url: cover.url,
                title: evt.title,
                theme: evt.theme,
                id: evt.id
              });
            }
          });
          const sportImgs = images.filter(img => img.theme === 'sport').slice(0, 3);
          const portraitImgs = images.filter(img => img.theme !== 'sport').slice(0, 3);
          setRecentImages([...portraitImgs, ...sportImgs]);
        }
      } catch (err) {
        console.error("Failed to fetch recent events", err);
      }
    };

    fetchSettings();
    fetchEvents();

    return () => {
      const existingScript = document.getElementById('jsonld-schema');
      if (existingScript) existingScript.remove();
    };
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
        
        {/* Stats Row */}
        <div className="flex justify-center items-center gap-6 md:gap-10 mt-8 py-3 px-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-xl max-w-sm mx-auto">
          <div className="text-center">
            <h4 className="text-xl font-black text-rose-500">5+</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Years Exp</p>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="text-center">
            <h4 className="text-xl font-black text-red-500">200+</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Projects</p>
          </div>
          <div className="w-px h-6 bg-white/10"></div>
          <div className="text-center">
            <h4 className="text-xl font-black text-amber-500">100%</h4>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">Satisfaction</p>
          </div>
        </div>
      </header>

      {/* Portals Showcase */}
      <main className="flex-1 max-w-6xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-center py-6">
        
        {/* PORTRAIT PORTAL */}
        <Link 
          to="/falguni"
          onMouseEnter={() => prefetchTheme('portrait')}
          className="group relative h-[380px] md:h-[450px] w-full rounded-[2.5rem] overflow-hidden border border-white/5 bg-slate-900/40 shadow-2xl transition-all duration-500 hover:shadow-[0_0_50px_rgba(251,113,133,0.15)] hover:border-rose-500/25 flex flex-col justify-end p-8"
        >
          {/* Cover Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={coverPortrait} 
              alt="Falguni Portrait" 
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
              Falguni Portrait
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
          onMouseEnter={() => prefetchTheme('sport')}
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

      {/* Recent Captures Gallery */}
      {recentImages.length > 0 && (
        <section className="max-w-6xl w-full mx-auto py-12 px-4 border-t border-white/5 mt-12">
          <div className="text-center mb-10">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
              Portfolio Teaser
            </span>
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-wider mt-3 text-white">
              Recent Captures
            </h3>
            <p className="text-xs md:text-sm text-gray-400 mt-2">A sneak peek at our latest visual stories.</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentImages.map((img, idx) => (
              <Link 
                key={img.id + '-' + idx}
                to={img.theme === 'sport' ? '/velolens' : '/falguni'}
                className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-slate-900/40 block shadow-md hover:shadow-lg transition-all duration-300"
              >
                <img 
                  src={getAssetUrl(img.url)} 
                  alt={img.title} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 brightness-[0.7] group-hover:brightness-[0.9]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full w-fit mb-1 ${img.theme === 'sport' ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'}`}>
                    {img.theme === 'sport' ? 'Sport' : 'Portrait'}
                  </span>
                  <p className="text-[10px] text-white font-bold truncate">{img.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Booking Process Section */}
      <section className="max-w-5xl w-full mx-auto py-12 px-4 border-t border-white/5 mt-6">
        <div className="text-center mb-12">
          <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-white">
            Booking Process
          </h3>
          <p className="text-xs md:text-sm text-gray-400 mt-2">Three simple steps to freeze your moments forever.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-4 right-4 text-4xl font-black text-white/5 select-none">01</div>
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4 font-bold">
              ✓
            </div>
            <h4 className="text-base font-bold text-white mb-2">Choose Your Vibe</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Select **Falguni Portrait** for warm fine-art sessions, or **VeloLens** for cinematic sports action coverage.
            </p>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-4 right-4 text-4xl font-black text-white/5 select-none">02</div>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-4 font-bold">
              $
            </div>
            <h4 className="text-base font-bold text-white mb-2">Check Packages</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Browse transparent pricelists and packages tailored for graduates, couples, teams, or event matches.
            </p>
          </div>
          
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group hover:border-white/10 transition-colors">
            <div className="absolute top-4 right-4 text-4xl font-black text-white/5 select-none">03</div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 font-bold">
              ✉
            </div>
            <h4 className="text-base font-bold text-white mb-2">Secure & Book</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Fill the fast booking form. We'll automatically direct you to WhatsApp to finalize date details.
            </p>
          </div>
        </div>
      </section>

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
