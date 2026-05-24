import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { API_BASE_URL } from '../config/constants';
import 'react-datepicker/dist/react-datepicker.css';

export default function Contact({ theme }) {
  const isSport = theme === 'sport';
  const [packages, setPackages] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    event: '',
    date: new Date(),
    themeRef: '',
    instagram: '',
    message: ''
  });
  const [waNumber, setWaNumber] = useState('6282136009894');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const resPkg = await fetch(`${API_BASE_URL}/api/packages`);
        if (resPkg.ok) {
          const data = await resPkg.json();
          const filtered = data.filter(pkg => pkg.theme === theme);
          setPackages(filtered);
          if (filtered.length > 0) {
            setFormData(prev => ({ ...prev, event: toTitleCase(filtered[0].name) }));
          }
        }
        
        const resSet = await fetch(`${API_BASE_URL}/api/settings`);
        if (resSet.ok) {
          const settingsData = await resSet.json();
          if (settingsData.whatsapp_number) {
            setWaNumber(settingsData.whatsapp_number);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      }
    };
    fetchData();
  }, [theme]);

  useEffect(() => {
    const handleSelectPackage = (e) => {
      setFormData(prev => ({ ...prev, event: e.detail }));
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('selectPackage', handleSelectPackage);
    return () => window.removeEventListener('selectPackage', handleSelectPackage);
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSendWA = async () => {
    let newErrors = {};
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'This field is required.';
    }
    if (!formData.event) {
      newErrors.event = 'Please select a package.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    
    setIsSubmitting(true);
    
    const dateFormatted = formData.date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    // Emoji via UTF-16 surrogate pairs — safest cross-bundler approach
    // 🏆 = \uD83C\uDFC6  ⚡ = \u26A1  🔥 = \uD83D\uDD25  🎬 = \uD83C\uDFAC
    // 📸 = \uD83D\uDCF8  ✨ = \u2728  💐 = \uD83D\uDC90  🎓 = \uD83C\uDF93
    let waText;
    if (isSport) {
      waText =
        '-----------------\nBOOKING FORM - Falguni Picture \uD83C\uDFC6\u26A1\n-----------------\n\n' +
        'Full Name: ' + formData.name + '\n' +
        'Location / Venue: ' + (formData.location || '-') + '\n' +
        'Session Date: ' + dateFormatted + '\n' +
        'Theme / Reference: ' + (formData.themeRef || '-') + '\n' +
        'Selected Package: ' + formData.event + '\n' +
        'Instagram: ' + (formData.instagram ? '@' + formData.instagram.replace('@','') : '-') + '\n\n' +
        'Thank you for choosing Falguni Picture to capture your sport moments! \uD83D\uDD25\uD83C\uDFAC';
    } else {
      waText =
        '-----------------\nBOOKING FORM - Falguni Portrait \uD83D\uDCF8\u2728\n-----------------\n\n' +
        'Full Name: ' + formData.name + '\n' +
        'Location / Venue: ' + (formData.location || '-') + '\n' +
        'Session Date: ' + dateFormatted + '\n' +
        'Theme / Reference: ' + (formData.themeRef || '-') + '\n' +
        'Selected Package: ' + formData.event + '\n' +
        'Instagram: ' + (formData.instagram ? '@' + formData.instagram.replace('@','') : '-') + '\n\n' +
        'Thank you for trusting Falguni Portrait to capture your special graduation moments! \uD83D\uDC90\uD83C\uDF93';
    }

    const encodedText = encodeURIComponent(waText);

    try {
      await fetch(`${API_BASE_URL}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          client_name: formData.name,
          event: formData.event,
          event_date: formData.date,
          message: formData.message + (formData.themeRef ? `\n\nStyle Reference: ${formData.themeRef}` : ''),
          location: formData.location,
          theme_ref: theme, // Save the global application theme (sport/portrait)
          instagram: formData.instagram
        })
      });
    } catch (err) {
      console.error("Failed to save booking log:", err);
      // Continue to WA redirect even if log fails
    }

    window.open(`https://api.whatsapp.com/send?phone=${waNumber}&text=${encodedText}`, '_blank');
    setFormData(prev => ({ ...prev, name: '', location: '', themeRef: '', instagram: '', message: '' }));
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-24 relative z-10 transition-theme backdrop-blur-3xl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className={`text-sm tracking-[0.2em] font-bold uppercase mb-4 ${isSport ? 'text-red-500' : 'text-slate-500'}`}>
            Ready to Shoot?
          </h2>
          <h3 className={`text-4xl md:text-5xl mb-6 ${isSport ? 'font-black uppercase tracking-tight' : 'font-serif italic text-slate-900'}`}>
            BOOK YOUR SESSION
          </h3>
        </div>

        <div className={`p-8 md:p-12 transition-theme card-dynamic ${isSport ? 'bg-gray-900/50 border-gray-800 rounded-none border-2 border-white shadow-[6px_6px_0px_#fff]' : 'bg-white border-gray-200 shadow-xl shadow-rose-100/40 border rounded-3xl'}`}>
          <div className="space-y-6">

            {/* Row 1: Name + Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isSport ? 'text-gray-400' : 'text-slate-500'}`}>Full Name <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  id="name" 
                  value={formData.name} onChange={handleChange}
                  className={`w-full bg-transparent border-b-2 py-3 px-0 focus:outline-none transition-colors border-dynamic-input ${
                    errors.name 
                      ? 'border-red-500 focus:border-red-500 text-red-500 placeholder-red-300' 
                      : (isSport ? 'border-gray-600 focus:border-white text-white' : 'border-gray-300 focus:border-slate-800 text-slate-900')
                  } font-semibold`} 
                  placeholder="e.g. John Doe" 
                />
                {errors.name && <p className="text-red-500 text-xs font-semibold mt-2">{errors.name}</p>}
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isSport ? 'text-gray-400' : 'text-slate-500'}`}>
                  Location / Venue
                </label>
                <input 
                  type="text" 
                  id="location" 
                  value={formData.location} onChange={handleChange}
                  className={`w-full bg-transparent border-b-2 py-3 px-0 focus:outline-none transition-colors border-dynamic-input ${isSport ? 'border-gray-600 focus:border-white text-white' : 'border-gray-300 focus:border-slate-800 text-slate-900'} font-semibold`} 
                  placeholder={isSport ? 'e.g. Mandala Krida Stadium' : 'e.g. Grand Ballroom / Studio'}
                />
              </div>
            </div>

            {/* Row 2: Date + Package */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isSport ? 'text-gray-400' : 'text-slate-500'}`}>Session Date</label>
                <div className={isSport ? 'theme-sport' : 'theme-wedding'}>
                  <DatePicker 
                    selected={formData.date} 
                    onChange={(date) => setFormData(prev => ({ ...prev, date }))}
                    dateFormat="dd MMMM yyyy"
                    className={`w-full bg-transparent border-b-2 py-3 px-0 focus:outline-none transition-colors border-dynamic-input cursor-pointer ${isSport ? 'border-gray-600 focus:border-white text-white' : 'border-gray-300 focus:border-slate-800 text-slate-900'} font-semibold`}
                  />
                </div>
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isSport ? 'text-gray-400' : 'text-slate-500'}`}>Package <span className="text-red-500">*</span></label>
                <select 
                  id="event" 
                  value={formData.event} onChange={handleChange}
                  className={`w-full bg-transparent border-b-2 py-3 px-0 focus:outline-none transition-colors border-dynamic-input ${
                    errors.event 
                      ? 'border-red-500 focus:border-red-500 text-red-500' 
                      : (isSport ? 'border-gray-600 focus:border-white text-white' : 'border-gray-300 focus:border-slate-800 text-slate-900')
                  } font-semibold`}
                >
                  <option value="" disabled className="text-black">Select Package...</option>
                  {packages.map(pkg => (
                    <option key={pkg.id} className="text-black" value={toTitleCase(pkg.name)}>{toTitleCase(pkg.name)}</option>
                  ))}
                  <option className="text-black" value="Others">Others...</option>
                </select>
                {errors.event && <p className="text-red-500 text-xs font-semibold mt-2">{errors.event}</p>}
              </div>
            </div>

            {/* Row 3: Theme/Reference + Instagram */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isSport ? 'text-gray-400' : 'text-slate-500'}`}>Style / Theme Reference</label>
                <input 
                  type="text" 
                  id="themeRef" 
                  value={formData.themeRef} onChange={handleChange}
                  className={`w-full bg-transparent border-b-2 py-3 px-0 focus:outline-none transition-colors border-dynamic-input ${isSport ? 'border-gray-600 focus:border-white text-white' : 'border-gray-300 focus:border-slate-800 text-slate-900'} font-semibold`} 
                  placeholder={isSport ? 'e.g. Action, Dynamic' : 'e.g. Elegant, Outdoor, Rustic'}
                />
              </div>
              <div>
                <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isSport ? 'text-gray-400' : 'text-slate-500'}`}>Instagram</label>
                <input 
                  type="text" 
                  id="instagram" 
                  value={formData.instagram} onChange={handleChange}
                  className={`w-full bg-transparent border-b-2 py-3 px-0 focus:outline-none transition-colors border-dynamic-input ${isSport ? 'border-gray-600 focus:border-white text-white' : 'border-gray-300 focus:border-slate-800 text-slate-900'} font-semibold`} 
                  placeholder="@yourusername"
                />
              </div>
            </div>

            {/* Row 4: Additional Message */}
            <div>
              <label className={`block text-xs font-bold mb-2 uppercase tracking-widest ${isSport ? 'text-gray-400' : 'text-slate-500'}`}>Additional Message</label>
              <textarea 
                id="message" 
                rows="3" 
                value={formData.message} onChange={handleChange}
                className={`w-full bg-transparent border-b-2 py-3 px-0 focus:outline-none transition-colors border-dynamic-input resize-none ${isSport ? 'border-gray-600 focus:border-white text-white' : 'border-gray-300 focus:border-slate-800 text-slate-900'} font-semibold`} 
                placeholder="Any additional notes or questions..."
              ></textarea>
            </div>

            <button 
              onClick={handleSendWA} 
              disabled={isSubmitting}
              className={`w-full py-5 font-bold tracking-widest transition-colors btn-dynamic ${
                isSport 
                  ? 'bg-white text-dark text-lg hover:bg-gray-300 shadow-xl hover:scale-[1.02] transform' 
                  : 'bg-slate-900 text-white font-sans text-sm hover:bg-slate-700 rounded-full shadow-lg hover:scale-[1.02] transform'
              } !mt-12 disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? 'Sending...' : (isSport ? '⚡ SEND VIA WHATSAPP' : '✉ Send via WhatsApp')}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
