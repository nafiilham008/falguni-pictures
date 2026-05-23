import { useState, useEffect } from 'react';

export default function Testimonials({ theme }) {
  const isSport = theme === 'sport';
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/testimonials');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data);
        }
      } catch (err) {
        console.error("Failed to fetch testimonials", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading || testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-24 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-sm tracking-[0.2em] font-bold uppercase mb-4 ${isSport ? 'text-red-500' : 'text-slate-500'}`}>
            Client Reviews
          </h2>
          <h3 className={`text-4xl md:text-5xl mb-6 ${isSport ? 'font-black uppercase tracking-tight' : 'font-serif italic text-slate-900'}`}>
            WHAT THEY SAY
          </h3>
          <div className={`w-24 h-1 mx-auto ${isSport ? 'bg-red-600' : 'bg-slate-300'}`}></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t, idx) => (
            <div key={t.id || idx} className={`p-8 rounded-2xl transition-all hover:-translate-y-1 ${isSport ? 'bg-gray-900/50 border border-gray-800' : 'bg-white shadow-xl shadow-rose-100/40 border border-gray-100'}`}>
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating || 5)].map((_, i) => (
                  <svg key={i} className={`w-5 h-5 ${isSport ? 'text-red-500' : 'text-amber-400'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className={`text-lg italic mb-6 ${isSport ? 'text-gray-300' : 'text-slate-600'}`}>"{t.review}"</p>
              <p className={`font-bold ${isSport ? 'text-white' : 'text-slate-900'}`}>- {t.client_name} <span className="text-sm font-normal text-slate-500 block sm:inline sm:ml-2">{t.role}</span></p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
