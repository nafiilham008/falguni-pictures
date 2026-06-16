import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAssetUrl, API_BASE_URL } from '../config/constants';
import { Link2, Globe, MessageSquare, Loader2 } from 'lucide-react';

export default function BioLinks() {
  const [links, setLinks] = useState([]);
  const [settings, setSettings] = useState({
    landing_title: 'MRF Photography',
    landing_bio: 'Capturing stories, emotions, and action.',
    landing_avatar: '',
    instagram_username: '',
    whatsapp_number: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set background to a clean slate gradient for links page
    document.body.className = "bg-gradient-to-b from-[#0e0e10] to-[#050506] text-gray-100 font-sans min-h-screen no-scrollbar";
    
    const fetchData = async () => {
      try {
        const [settingsRes, linksRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/settings`),
          fetch(`${API_BASE_URL}/api/bio-links`)
        ]);

        if (settingsRes.ok) {
          const sData = await settingsRes.json();
          setSettings(prev => ({
            ...prev,
            landing_title: sData.landing_title || prev.landing_title,
            landing_bio: sData.landing_bio || prev.landing_bio,
            landing_avatar: sData.landing_avatar || '',
            instagram_username: sData.instagram_username || '',
            whatsapp_number: sData.whatsapp_number || '',
          }));
        }

        if (linksRes.ok) {
          const lData = await linksRes.json();
          setLinks(lData);
        }
      } catch (err) {
        console.error("Failed to fetch bio links data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0e0e10]">
        <Loader2 size={36} className="text-white animate-spin" />
      </div>
    );
  }

  const avatarUrl = settings.landing_avatar 
    ? getAssetUrl(settings.landing_avatar) 
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400';

  return (
    <div className="w-full max-w-md mx-auto px-6 py-12 flex flex-col items-center justify-between min-h-screen relative z-10">
      
      {/* Upper Content */}
      <div className="w-full flex flex-col items-center">
        {/* Profile Avatar */}
        <div className="relative mb-5">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full blur opacity-30"></div>
          <img 
            src={avatarUrl} 
            alt={settings.landing_title} 
            className="relative w-24 h-24 object-cover rounded-full border border-white/20 shadow-xl"
          />
        </div>

        {/* Profile Name & Bio */}
        <h1 className="text-xl md:text-2xl font-bold tracking-wider text-center text-white mb-2">
          {settings.landing_title}
        </h1>
        <p className="text-xs md:text-sm text-gray-400 font-light text-center leading-relaxed mb-8 max-w-xs">
          {settings.landing_bio}
        </p>

        {/* Links Stack */}
        <div className="w-full space-y-4">
          {links.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm border border-dashed border-white/10 rounded-2xl">
              No links available yet.
            </div>
          ) : (
            links.map((link) => {
              const isExternal = link.url.startsWith('http://') || link.url.startsWith('https://');
              const buttonStyle = "block w-full text-center py-4 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-sm font-semibold tracking-wide text-white transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-black/40 cursor-pointer";

              return isExternal ? (
                <a 
                  key={link.id} 
                  href={link.url}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={buttonStyle}
                >
                  {link.label}
                </a>
              ) : (
                <Link 
                  key={link.id} 
                  to={link.url} 
                  className={buttonStyle}
                >
                  {link.label}
                </Link>
              );
            })
          )}
        </div>
      </div>

      {/* Social Icons & Branding Footer */}
      <div className="w-full flex flex-col items-center pt-12">
        <div className="flex gap-6 mb-6">
          {settings.whatsapp_number && (
            <a 
              href={`https://api.whatsapp.com/send?phone=${settings.whatsapp_number}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="WhatsApp"
            >
              <MessageSquare size={20} />
            </a>
          )}
          {settings.instagram_username && (
            <a 
              href={`https://instagram.com/${settings.instagram_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          )}
          <Link 
            to="/" 
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Website"
          >
            <Globe size={20} />
          </Link>
        </div>
        
        <p className="text-[10px] tracking-widest text-gray-600 font-semibold uppercase">
          &copy; {new Date().getFullYear()} {settings.landing_title}
        </p>
      </div>

    </div>
  );
}
