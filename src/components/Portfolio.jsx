import { useState, useEffect } from 'react';
import { getAssetUrl } from '../config/constants';
import Lightbox from './Lightbox';

const CATEGORY_LABELS = {
  wisuda:  'Wisuda / Graduation',
  wedding: 'Wedding',
  prewed:  'Pre-Wedding',
  engagement: 'Engagement / Lamaran',
  family:  'Family',
  others:  'Others',
};

export default function Portfolio({ theme }) {
  const isSport = theme === 'sport';
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState(null);
  const [spotlight, setSpotlight] = useState('wisuda');
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');

  // Fetch portfolio events
  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/events?theme=${theme}`);
        if (res.ok) {
          const apiData = await res.json();
          const transformed = apiData.map(ev => ({
            ...ev,
            images: ev.images.map(img => getAssetUrl(img.url))
          }));
          setData(transformed);
        }
      } catch (err) {
        console.error("Failed to fetch portfolio", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPortfolio();
  }, [theme]);

  // For portrait: fetch spotlight setting & available categories
  useEffect(() => {
    if (isSport) return;
    const fetchMeta = async () => {
      try {
        const [settingsRes, categoriesRes] = await Promise.all([
          fetch('http://localhost:5000/api/settings'),
          fetch('http://localhost:5000/api/portrait-categories'),
        ]);
        if (settingsRes.ok) {
          const s = await settingsRes.json();
          setSpotlight(s.portrait_spotlight || 'wisuda');
        }
        if (categoriesRes.ok) {
          const cats = await categoriesRes.json();
          setCategories(cats);
        }
      } catch (err) {
        console.error("Failed to fetch portrait meta", err);
      }
    };
    fetchMeta();
  }, [theme]);

  // Reset filter tab when theme changes
  useEffect(() => {
    setActiveTab('all');
  }, [theme]);

  // Lock body scroll when lightbox opens
  useEffect(() => {
    document.body.style.overflow = activeEvent ? 'hidden' : 'auto';
  }, [activeEvent]);

  const handleEventClick = async (event) => {
    setActiveEvent(event);
    try {
      await fetch('http://localhost:5000/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'view_event',
          theme,
          metadata: { id: event.id, title: event.title }
        })
      });
    } catch (err) { /* analytics fail is silent */ }
  };

  // --- Card renderer (shared) ---
  const EventCard = ({ event, size = 'normal' }) => {
    const coverUrl = event.images[0];
    const isVidCover = coverUrl?.toLowerCase().endsWith('.mp4');
    const thumbnailUrl = isVidCover
      ? event.images.find(url => !url.toLowerCase().endsWith('.mp4'))
      : null;
    const hasStaticThumbnail = !!thumbnailUrl;

    const cardBase = isSport
      ? 'bg-gray-900/50 border-2 border-white shadow-[6px_6px_0px_#fff] rounded-none card-dynamic'
      : 'bg-white border-gray-200 shadow-xl rounded-3xl shadow-rose-100/40 card-dynamic';

    const textBg = isSport ? 'bg-gradient-to-t from-dark/95' : 'bg-gradient-to-t from-slate-900/95';

    const aspectClass = size === 'featured' ? 'aspect-[16/9]' : 'aspect-[4/5]';

    return (
      <div
        className={`group relative overflow-hidden transition-all duration-500 hover:-translate-y-2 cursor-pointer border ${cardBase}`}
        onClick={() => handleEventClick(event)}
      >
        <div className={`${aspectClass} overflow-hidden relative`}>
          {isVidCover ? (
            hasStaticThumbnail ? (
              <img src={thumbnailUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${isSport ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800'}`}>
                <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(255,255,255,0.1) 20px, rgba(255,255,255,0.1) 21px)' }} />
              </div>
            )
          ) : (
            <img src={coverUrl} alt={event.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
          )}

          {/* Play button */}
          {isVidCover && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-sm border-2 transition-all duration-300 group-hover:scale-110 ${isSport ? 'bg-red-600/70 border-red-400/60 group-hover:bg-red-500' : 'bg-black/50 border-white/40 group-hover:bg-rose-600/70'}`}>
                <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </div>
            </div>
          )}

          {/* Video badge */}
          {isVidCover && (
            <div className="absolute top-3 right-3 pointer-events-none">
              <span className={`text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-full flex items-center gap-1 ${isSport ? 'bg-red-600 text-white' : 'bg-black/60 text-white backdrop-blur-sm'}`}>
                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                Video
              </span>
            </div>
          )}

          {/* Category badge (portrait only) */}
          {!isSport && event.category && (
            <div className="absolute top-3 left-3 pointer-events-none">
              <span className="text-[10px] font-black tracking-widest uppercase px-2 py-1 rounded-full bg-white/80 text-slate-700 backdrop-blur-sm">
                {CATEGORY_LABELS[event.category] || event.category}
              </span>
            </div>
          )}
        </div>

        {/* Caption */}
        <div className={`absolute bottom-0 w-full p-5 text-left ${textBg} to-transparent opacity-90 transition-opacity group-hover:opacity-100`}>
          <h4 className={`text-lg text-white mb-1 drop-shadow-md ${isSport ? 'font-black uppercase tracking-wider' : 'font-serif italic'}`}>
            {event.title}
          </h4>
          <p className="text-gray-300 text-xs font-semibold tracking-widest uppercase">
            {event.images.length} Media &bull; Click to open
          </p>
        </div>
      </div>
    );
  };

  // --- Portrait filtered data ---
  const spotlightEvents = data.filter(ev => ev.category === spotlight);
  
  // Exclude spotlighted events from Browse All Works to prevent duplication
  const browseData = data.filter(ev => ev.category !== spotlight);
  const filteredEvents = activeTab === 'all' ? browseData : browseData.filter(ev => ev.category === activeTab);
  
  // Exclude the spotlight category from the bottom filter tabs since they are already showcased at the top
  const displayCategories = categories.filter(cat => cat !== spotlight);

  if (loading && data.length === 0) {
    return (
      <section id="portfolio" className="py-24 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto"></div>
        <p className="mt-4 text-slate-500 font-semibold uppercase tracking-widest text-xs">Loading Gallery...</p>
      </section>
    );
  }

  // =============================================
  // SPORT LAYOUT — unchanged, single grid
  // =============================================
  if (isSport) {
    return (
      <section id="portfolio" className="py-24 relative z-10 transition-theme">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm tracking-[0.2em] uppercase mb-4 text-red-500 font-bold">Our Works</h2>
            <h3 className="text-4xl md:text-5xl mb-6 font-black uppercase tracking-tight">SELECTED PROJECTS</h3>
            <div className="w-24 h-1 mx-auto bg-red-600"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {data.map((event, idx) => <EventCard key={`sport-${event.id || idx}`} event={event} />)}
          </div>
        </div>
        <Lightbox isOpen={!!activeEvent} event={activeEvent} theme={theme} onClose={() => setActiveEvent(null)} />
      </section>
    );
  }

  // =============================================
  // PORTRAIT LAYOUT — Spotlight + filter tabs
  // =============================================
  return (
    <section id="portfolio" className="py-24 relative z-10 transition-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-sm tracking-[0.2em] uppercase mb-4 text-slate-500 font-sans">Our Works</h2>
          <h3 className="text-4xl md:text-5xl mb-6 font-serif italic text-slate-900">Selected Projects</h3>
          <div className="w-24 h-1 mx-auto bg-slate-300"></div>
        </div>

        {/* ── NOW SPOTLIGHTING ── */}
        {spotlightEvents.length > 0 && (
          <div className="mb-20">
            {/* Spotlight header */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-rose-200"></div>
              <div className="flex items-center gap-2 px-5 py-2 rounded-full border border-rose-200 bg-rose-50">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block"></span>
                <span className="text-xs font-black tracking-[0.25em] uppercase text-rose-600">
                  Now Spotlighting
                </span>
                <span className="text-xs font-bold text-rose-400">
                  — {CATEGORY_LABELS[spotlight] || spotlight}
                </span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-rose-200"></div>
            </div>

            {/* Featured grid — wider aspect ratio for drama */}
            {spotlightEvents.length === 1 ? (
              // Single event: full-width featured
              <div className="max-w-3xl mx-auto">
                <EventCard event={spotlightEvents[0]} size="featured" />
              </div>
            ) : spotlightEvents.length === 2 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {spotlightEvents.map((ev, i) => <EventCard key={i} event={ev} size="featured" />)}
              </div>
            ) : (
              // 3+ events: first one is large, rest in 2-col
              <div className="space-y-8">
                <div className="max-w-3xl mx-auto">
                  <EventCard event={spotlightEvents[0]} size="featured" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {spotlightEvents.slice(1).map((ev, i) => <EventCard key={i} event={ev} />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── BROWSE ALL WORKS ── */}
        <div>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-slate-200"></div>
            <span className="text-xs font-black tracking-[0.25em] uppercase text-slate-400 px-4">Browse All Works</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-slate-200"></div>
          </div>

          {/* Filter tabs — only show if there are multiple categories */}
          {displayCategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8 justify-center">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${activeTab === 'all' ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                All
              </button>
              {displayCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-2 rounded-full text-xs font-bold tracking-widest uppercase transition-all ${activeTab === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {CATEGORY_LABELS[cat] || cat}
                </button>
              ))}
            </div>
          )}

          {filteredEvents.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <p className="text-lg font-serif italic">No events in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 gap-y-12">
              {filteredEvents.map((event, idx) => (
                <EventCard key={`portrait-${event.id || idx}`} event={event} />
              ))}
            </div>
          )}
        </div>

      </div>

      <Lightbox isOpen={!!activeEvent} event={activeEvent} theme={theme} onClose={() => setActiveEvent(null)} />
    </section>
  );
}
