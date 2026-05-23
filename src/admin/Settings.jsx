import { useState, useEffect, useRef } from 'react';
import { Save, Lock, Smartphone, Image as ImageIcon, UploadCloud, Loader2 } from 'lucide-react';
import { getAssetUrl, API_BASE_URL } from '../config/constants';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

const PORTRAIT_CATEGORIES = [
  { value: 'wisuda',  label: 'Wisuda / Graduation' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'prewed',  label: 'Pre-Wedding' },
  { value: 'engagement', label: 'Engagement / Lamaran' },
  { value: 'family',  label: 'Family' },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(true);
  
  // General Settings
  const [waNumber, setWaNumber] = useState('');
  const [instagramUsername, setInstagramUsername] = useState('');
  
  // Security Settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Spotlight & Visuals Settings
  const [defaultTheme, setDefaultTheme] = useState('sport');
  const [portraitSpotlight, setPortraitSpotlight] = useState('wisuda');
  const [visuals, setVisuals] = useState({
    hero_image_sport: '',
    about_image_sport: '',
    hero_image_wisuda: '',
    about_image_wisuda: '',
    hero_image_wedding: '',
    about_image_wedding: '',
    hero_image_prewed: '',
    about_image_prewed: '',
    hero_image_engagement: '',
    about_image_engagement: '',
    hero_image_family: '',
    about_image_family: '',
  });
  const [uploadingKey, setUploadingKey] = useState(null);
  const fileInputRef = useRef(null);
  const activeUploadKey = useRef(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/settings`);
      if (res.ok) {
        const data = await res.json();
        if (data.whatsapp_number) setWaNumber(data.whatsapp_number);
        if (data.instagram_username) setInstagramUsername(data.instagram_username);
        if (data.default_theme) setDefaultTheme(data.default_theme);
        if (data.portrait_spotlight) setPortraitSpotlight(data.portrait_spotlight);
        setVisuals(prev => ({
          ...prev,
          ...Object.fromEntries(
            Object.keys(prev).map(k => [k, data[k] || ''])
          )
        }));
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSaveGeneral = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          whatsapp_number: waNumber,
          instagram_username: instagramUsername
        })
      });
      if (res.ok) {
        MySwal.fire('Success!', 'General Settings saved successfully.', 'success');
      } else {
        MySwal.fire('Error', 'Failed to save settings.', 'error');
      }
    } catch (err) {
      MySwal.fire('Error', 'A system error occurred.', 'error');
    }
  };

  const handleSaveVisuals = async () => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          default_theme: defaultTheme,
          portrait_spotlight: portraitSpotlight,
          ...visuals
        })
      });
      if (res.ok) {
        MySwal.fire('Saved!', 'Spotlight & visual settings updated.', 'success');
      } else {
        MySwal.fire('Error', 'Failed to save visual settings.', 'error');
      }
    } catch (err) {
      MySwal.fire('Error', 'A system error occurred.', 'error');
    }
  };

  const handleVisualUpload = (settingKey) => {
    activeUploadKey.current = settingKey;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeUploadKey.current) return;
    const key = activeUploadKey.current;
    setUploadingKey(key);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setVisuals(prev => ({ ...prev, [key]: data.path }));
        MySwal.fire({ icon: 'success', title: 'Uploaded!', text: 'Image saved. Click "Save All" to apply.', timer: 2000, showConfirmButton: false });
      } else {
        MySwal.fire('Error', 'Upload failed.', 'error');
      }
    } catch (err) {
      MySwal.fire('Error', 'Upload error.', 'error');
    } finally {
      setUploadingKey(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return MySwal.fire('Error', 'New Password and Confirm Password do not match!', 'error');
    }
    if (newPassword.length < 6) {
      return MySwal.fire('Error', 'New Password must be at least 6 characters!', 'error');
    }
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/password`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        MySwal.fire('Success!', 'Password changed successfully.', 'success');
        setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
      } else {
        MySwal.fire('Failed', data.error || 'Failed to change password.', 'error');
      }
    } catch (err) {
      MySwal.fire('Error', 'A system error occurred.', 'error');
    }
  };

  // Reusable visual image row
  const VisualImageRow = ({ label, settingKey }) => {
    const currentVal = visuals[settingKey];
    const isUploading = uploadingKey === settingKey;
    return (
      <div className="flex items-center justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-3 min-w-0">
          {currentVal ? (
            <img
              src={getAssetUrl(currentVal)}
              alt={label}
              className="w-14 h-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
            />
          ) : (
            <div className="w-14 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center flex-shrink-0 bg-slate-50">
              <ImageIcon size={16} className="text-gray-400" />
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate">{label}</p>
            {currentVal ? (
              <p className="text-xs text-green-600 truncate">✓ Image set</p>
            ) : (
              <p className="text-xs text-slate-400 italic">No image set</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleVisualUpload(settingKey)}
          disabled={isUploading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex-shrink-0 disabled:opacity-50"
        >
          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
          {isUploading ? 'Uploading...' : currentVal ? 'Replace' : 'Upload'}
        </button>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-slate-500">Loading settings...</div>;

  return (
    <div>
      <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-1">Configure site settings and admin account security.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-gray-100 flex flex-col p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center space-x-3 transition-colors ${activeTab === 'general' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <Smartphone size={18} />
            <span>General Settings</span>
          </button>
          <button 
            onClick={() => setActiveTab('visuals')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center space-x-3 transition-colors ${activeTab === 'visuals' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <ImageIcon size={18} />
            <span>Spotlight & Visuals</span>
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center space-x-3 transition-colors ${activeTab === 'security' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <Lock size={18} />
            <span>Security</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-8 overflow-y-auto max-h-[80vh]">
          
          {/* --- GENERAL --- */}
          {activeTab === 'general' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">General Settings</h3>
              <form onSubmit={handleSaveGeneral} className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">WhatsApp Number (For Redirect)</label>
                  <p className="text-xs text-slate-500 mb-3">Use country code format without plus (+) sign, e.g., 628123456789</p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Smartphone size={18} className="text-gray-400" />
                    </div>
                    <input 
                      type="text" value={waNumber}
                      onChange={e => setWaNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                      placeholder="628..." required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Instagram Username</label>
                  <p className="text-xs text-slate-500 mb-3">Without @ symbol, e.g., falgunipicture</p>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                      </svg>
                    </div>
                    <input 
                      type="text" value={instagramUsername}
                      onChange={e => setInstagramUsername(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                      placeholder="falgunipicture" required
                    />
                  </div>
                </div>

                <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-slate-800 transition-colors shadow-md">
                  <Save size={18} />
                  <span>Save General Settings</span>
                </button>
              </form>
            </div>
          )}

          {/* --- SPOTLIGHT & VISUALS --- */}
          {activeTab === 'visuals' && (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-slate-900 border-b pb-4">Spotlight & Visuals</h3>

              {/* Default Theme Section */}
              <div className="bg-slate-50 rounded-2xl p-6 border border-gray-100">
                <div className="mb-2">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Default Landing Theme</label>
                  <p className="text-xs text-slate-500 mb-3">Which theme should visitors see first when they open your website?</p>
                  <select
                    value={defaultTheme}
                    onChange={e => setDefaultTheme(e.target.value)}
                    className="w-full md:w-auto px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none font-semibold text-slate-800 bg-white"
                  >
                    <option value="sport">Sport</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>
              </div>

              {/* Sport Section */}
              <div className="bg-slate-50 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Sport Theme</h4>
                </div>
                <VisualImageRow label="Hero / Jumbotron Background" settingKey="hero_image_sport" />
                <VisualImageRow label='"The Story Behind" Background' settingKey="about_image_sport" />
              </div>

              {/* Portrait Spotlight Section */}
              <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block"></span>
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Portrait Theme</h4>
                </div>

                <div className="mb-5 mt-3">
                  <label className="block text-sm font-bold text-slate-700 mb-2">Active Spotlight Category</label>
                  <p className="text-xs text-slate-500 mb-3">The selected category will be prominently featured at the top of the portrait portfolio page, and its hero &amp; about images will be shown to visitors.</p>
                  <select
                    value={portraitSpotlight}
                    onChange={e => setPortraitSpotlight(e.target.value)}
                    className="px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-shadow outline-none font-semibold text-slate-800 bg-white"
                  >
                    {PORTRAIT_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {PORTRAIT_CATEGORIES.map(cat => (
                  <div key={cat.value} className={`mb-4 rounded-xl border p-4 ${portraitSpotlight === cat.value ? 'border-rose-300 bg-white shadow-sm' : 'border-gray-100 bg-white/50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      {portraitSpotlight === cat.value && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white uppercase tracking-wider">Active Spotlight</span>
                      )}
                      <h5 className="font-bold text-slate-800 text-sm">{cat.label}</h5>
                    </div>
                    <VisualImageRow label="Hero / Jumbotron Background" settingKey={`hero_image_${cat.value}`} />
                    <VisualImageRow label='"The Story Behind" Background' settingKey={`about_image_${cat.value}`} />
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleSaveVisuals}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-slate-800 transition-colors shadow-md"
              >
                <Save size={18} />
                <span>Save All Visual Settings</span>
              </button>
            </div>
          )}

          {/* --- SECURITY --- */}
          {activeTab === 'security' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">Update Password</h3>
              <form onSubmit={handleUpdatePassword} className="max-w-md space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Current Password</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">New Password</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none" required />
                </div>
                <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-slate-800 transition-colors shadow-md">
                  <Lock size={18} />
                  <span>Update Password</span>
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
