import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/constants';

export default function Pricing({ theme }) {
  const isSport = theme === 'sport';
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Price formatting is no longer needed since we hide prices for Open Budget

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/packages`);
        if (res.ok) {
          const data = await res.json();
          // Filter by theme
          setPackages(data.filter(pkg => pkg.theme === theme));
        }
      } catch (err) {
        console.error("Failed to fetch packages", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPackages();
  }, [theme]);

  if (loading || packages.length === 0) return null;

  return (
    <section id="pricing" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-sm tracking-[0.2em] font-bold uppercase mb-4 ${isSport ? 'text-red-500' : 'text-slate-500'}`}>
            Our Packages
          </h2>
          <h3 className={`text-4xl md:text-5xl mb-6 ${isSport ? 'font-black uppercase tracking-tight' : 'font-serif italic text-slate-900'}`}>
            PRICING PLANS
          </h3>
          <div className={`w-24 h-1 mx-auto ${isSport ? 'bg-red-600' : 'bg-slate-300'}`}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {packages.map((pkg, idx) => (
            <div 
              key={pkg.id} 
              className={`relative p-8 rounded-3xl transition-all duration-300 hover:-translate-y-2 ${
                pkg.is_popular 
                  ? (isSport ? 'bg-red-600 border-2 border-red-500 shadow-2xl shadow-red-500/20 text-white' : 'bg-gradient-to-br from-rose-50 to-amber-50/50 border-2 border-rose-300 shadow-2xl shadow-rose-200/50 text-slate-900')
                  : (isSport ? 'bg-gray-900/80 border border-gray-800 text-white' : 'bg-white shadow-xl shadow-rose-100/50 border border-gray-100 text-slate-900')
              }`}
            >
              {pkg.is_popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${isSport ? 'bg-white text-red-600' : 'bg-amber-100 text-amber-800'}`}>
                    Most Popular
                  </span>
                </div>
              )}
              {pkg.tag && !pkg.is_popular && (
                <div className="absolute -top-3 right-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md animate-pulse">
                    {pkg.tag}
                  </span>
                </div>
              )}
              
              <h4 className={`text-2xl font-bold mb-6 ${pkg.is_popular ? (isSport ? 'text-white' : 'text-slate-900') : (isSport ? 'text-white' : 'text-slate-900')}`}>
                {toTitleCase(pkg.name)}
              </h4>
              
              <ul className="space-y-4 mb-8">
                {pkg.features.map((feat, i) => (
                  <li key={i} className={`flex items-start gap-3 ${pkg.is_popular ? (isSport ? 'text-gray-200' : 'text-slate-700') : (isSport ? 'text-gray-400' : 'text-slate-600')}`}>
                    <svg className={`w-5 h-5 shrink-0 ${pkg.is_popular ? (isSport ? 'text-white' : 'text-rose-600') : (isSport ? 'text-red-500' : 'text-[#a27b5c]')}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              <a 
                href="#contact"
                onClick={(e) => {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('selectPackage', { detail: toTitleCase(pkg.name) }));
                }}
                className={`block w-full text-center py-4 rounded-xl font-bold transition-all ${
                  pkg.is_popular 
                    ? (isSport ? 'bg-white text-red-600 hover:bg-gray-100 shadow-md' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-md')
                    : (isSport ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-900 text-white hover:bg-slate-800')
                }`}
              >
                Consult & Book
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
