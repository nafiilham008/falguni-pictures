import { useState, useEffect, useRef } from 'react';
import { Save, Lock, Smartphone, Image as ImageIcon, UploadCloud, Loader2, Link2, Plus, Edit2, Trash2, Check, X, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { getAssetUrl, API_BASE_URL } from '../config/constants';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import imageCompression from 'browser-image-compression';

const MySwal = withReactContent(Swal);

const PORTRAIT_CATEGORIES = [
  { value: 'wisuda',  label: 'Wisuda / Graduation' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'prewed',  label: 'Pre-Wedding' },
  { value: 'engagement', label: 'Engagement / Lamaran' },
  { value: 'custom',  label: 'Custom & Special Events' },
];

const SPORT_CATEGORIES = [
  { value: 'football',  label: 'Football / Soccer' },
  { value: 'motorsport', label: 'Motorsport / Automotive' },
  { value: 'cycling',    label: 'Cycling' },
  { value: 'others',     label: 'Others / Action' },
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

  // General Landing Settings
  const [landingTitle, setLandingTitle] = useState('MRF Photography');
  const [landingBio, setLandingBio] = useState('');

  // Bio Links Settings
  const [bioLinks, setBioLinks] = useState([]);
  const [linkLabel, setLinkLabel] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkOrder, setLinkOrder] = useState(0);
  const [linkActive, setLinkActive] = useState(true);
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  
  // Crop settings
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);

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
    hero_image_custom: '',
    about_image_custom: '',
    // New fields
    landing_avatar: '',
    landing_cover_portrait: '',
    landing_cover_sport: '',
    logo_portrait: '',
    logo_sport: '',
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
        if (data.landing_title) setLandingTitle(data.landing_title);
        if (data.landing_bio) setLandingBio(data.landing_bio);
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

  const fetchBioLinks = async () => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/bio-links`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBioLinks(data);
      }
    } catch (err) {
      console.error("Failed to fetch bio links", err);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'biolinks') {
      fetchBioLinks();
    }
  }, [activeTab]);

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

  const handleSaveLanding = async (e) => {
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
          landing_title: landingTitle,
          landing_bio: landingBio,
          landing_avatar: visuals.landing_avatar,
          landing_cover_portrait: visuals.landing_cover_portrait,
          landing_cover_sport: visuals.landing_cover_sport,
          logo_portrait: visuals.logo_portrait,
          logo_sport: visuals.logo_sport
        })
      });
      if (res.ok) {
        MySwal.fire('Success!', 'Landing Page Settings saved successfully.', 'success');
      } else {
        MySwal.fire('Error', 'Failed to save landing settings.', 'error');
      }
    } catch (err) {
      MySwal.fire('Error', 'A system error occurred.', 'error');
    }
  };

  const handleSaveLink = async (e) => {
    e.preventDefault();
    if (!linkLabel || !linkUrl) {
      return MySwal.fire('Error', 'Label and URL are required!', 'error');
    }
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const method = editingLinkId ? 'PUT' : 'POST';
      const url = editingLinkId 
        ? `${API_BASE_URL}/api/bio-links/${editingLinkId}` 
        : `${API_BASE_URL}/api/bio-links`;

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          label: linkLabel, 
          url: linkUrl, 
          is_active: linkActive, 
          sort_order: editingLinkId ? parseInt(linkOrder) || 0 : bioLinks.length
        })
      });

      if (res.ok) {
        MySwal.fire({
          icon: 'success',
          title: editingLinkId ? 'Link Updated!' : 'Link Created!',
          timer: 1500,
          showConfirmButton: false
        });
        setLinkLabel('');
        setLinkUrl('');
        setLinkOrder(0);
        setLinkActive(true);
        setEditingLinkId(null);
        fetchBioLinks();
      } else {
        MySwal.fire('Error', 'Failed to save link.', 'error');
      }
    } catch (err) {
      MySwal.fire('Error', 'A system error occurred.', 'error');
    }
  };

  const handleEditLink = (link) => {
    setLinkLabel(link.label);
    setLinkUrl(link.url);
    setLinkOrder(link.sort_order);
    setLinkActive(link.is_active);
    setEditingLinkId(link.id);
  };

  const handleCancelEdit = () => {
    setLinkLabel('');
    setLinkUrl('');
    setLinkOrder(0);
    setLinkActive(true);
    setEditingLinkId(null);
  };

  const handleDeleteLink = async (id) => {
    const confirm = await MySwal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!confirm.isConfirmed) return;

    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/bio-links/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        MySwal.fire('Deleted!', 'Link has been deleted.', 'success');
        fetchBioLinks();
        if (editingLinkId === id) {
          handleCancelEdit();
        }
      } else {
        MySwal.fire('Error', 'Failed to delete link.', 'error');
      }
    } catch (err) {
      MySwal.fire('Error', 'A system error occurred.', 'error');
    }
  };

  const handleToggleActive = async (link) => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/bio-links/${link.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          label: link.label, 
          url: link.url, 
          is_active: !link.is_active, 
          sort_order: link.sort_order 
        })
      });
      if (res.ok) {
        fetchBioLinks();
      }
    } catch (err) {
      console.error("Failed to toggle link active status", err);
    }
  };

  // Drag and drop handlers for bio links
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const list = [...bioLinks];
    const draggedItem = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setBioLinks(list);
  };

  const handleDragEnd = async () => {
    setDraggedIndex(null);
    await saveReorder(bioLinks);
  };

  const moveLink = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= bioLinks.length) return;

    const list = [...bioLinks];
    const temp = list[index];
    list[index] = list[nextIndex];
    list[nextIndex] = temp;

    setBioLinks(list);
    await saveReorder(list);
  };

  const saveReorder = async (updatedLinks) => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const ids = updatedLinks.map(l => l.id);
      const res = await fetch(`${API_BASE_URL}/api/admin/bio-links/reorder`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ids })
      });
      if (!res.ok) {
        MySwal.fire('Error', 'Failed to save reorder.', 'error');
      }
    } catch (err) {
      console.error("Reorder save error:", err);
    }
  };

  // Cropper upload logic
  const uploadCroppedFile = async (blob) => {
    setShowCropModal(false);
    setCropImageSrc(null);
    
    const file = new File([blob], 'cropped_avatar.webp', { type: 'image/webp' });
    const key = 'landing_avatar';
    setUploadingKey(key);

    const formData = new FormData();
    formData.append('file', file, file.name);

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
        MySwal.fire({ icon: 'success', title: 'Uploaded!', text: 'Avatar cropped and uploaded successfully.', timer: 2000, showConfirmButton: false });
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

    // Crop flow for profile picture
    if (key === 'landing_avatar') {
      const reader = new FileReader();
      reader.onload = () => {
        setCropImageSrc(reader.result);
        setShowCropModal(true);
      };
      reader.readAsDataURL(file);
      return;
    }

    setUploadingKey(key);

    let processedFile = file;
    if (file.type.startsWith('image/')) {
      try {
        console.log("Original size:", file.size / 1024 / 1024, "MB");
        const options = { maxSizeMB: 2, maxWidthOrHeight: 1920, useWebWorker: false };
        processedFile = await imageCompression(file, options);
        console.log("Compressed size:", processedFile.size / 1024 / 1024, "MB");
      } catch (err) {
        console.error("Compression error:", err);
      }
    }

    const formData = new FormData();
    formData.append('file', processedFile, processedFile.name || file.name);

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
            <p className="text-sm font-semibold text-slate-800 leading-tight whitespace-normal">{label}</p>
            {currentVal ? (
              <p className="text-xs text-green-600">✓ Image set</p>
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

      {showCropModal && (
        <ImageCropperModal
          src={cropImageSrc}
          onCrop={uploadCroppedFile}
          onCancel={() => {
            setShowCropModal(false);
            setCropImageSrc(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
          }}
        />
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-black tracking-tight text-slate-900">Settings</h2>
        <p className="text-slate-500 mt-1">Configure site settings, landing portals, bio links, and admin security.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-gray-100 flex flex-col p-4 space-y-2">
          <button 
            type="button"
            onClick={() => setActiveTab('general')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center space-x-3 transition-colors ${activeTab === 'general' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <Smartphone size={18} />
            <span>General Settings</span>
          </button>
          
          <button 
            type="button"
            onClick={() => setActiveTab('landing')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center space-x-3 transition-colors ${activeTab === 'landing' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <ImageIcon size={18} />
            <span>Landing Page</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('biolinks')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center space-x-3 transition-colors ${activeTab === 'biolinks' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <Link2 size={18} />
            <span>Bio Links</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('visuals')}
            className={`w-full text-left px-4 py-3 rounded-xl font-semibold flex items-center space-x-3 transition-colors ${activeTab === 'visuals' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-600 hover:bg-slate-200'}`}
          >
            <ImageIcon size={18} />
            <span>Spotlight & Visuals</span>
          </button>
          
          <button 
            type="button"
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
                  <p className="text-xs text-slate-500 mb-3">Without @ symbol, e.g., mrfphotography</p>
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
                      placeholder="mrfphotography" required
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

          {/* --- LANDING PAGE --- */}
          {activeTab === 'landing' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">General Landing Page Settings</h3>
              <form onSubmit={handleSaveLanding} className="space-y-6 max-w-2xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Landing Title / Name</label>
                      <input 
                        type="text" value={landingTitle}
                        onChange={e => setLandingTitle(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                        placeholder="MRF Photography" required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Short Bio / Description</label>
                      <textarea 
                        value={landingBio}
                        onChange={e => setLandingBio(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none resize-none"
                        placeholder="Professional photographer specializing in portrait and sports photography..."
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 rounded-2xl border border-gray-100 space-y-4">
                    <h4 className="font-bold text-slate-800 text-sm">Visuals & Branding</h4>
                    <VisualImageRow label="Profile Photo / Avatar" settingKey="landing_avatar" />
                    <VisualImageRow label="MRF Portrait Card Cover" settingKey="landing_cover_portrait" />
                    <VisualImageRow label="VeloLens (Sport) Card Cover" settingKey="landing_cover_sport" />
                    <VisualImageRow label="MRF Portrait Custom Logo" settingKey="logo_portrait" />
                    <VisualImageRow label="VeloLens Sport Custom Logo" settingKey="logo_sport" />
                  </div>
                </div>

                <button type="submit" className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 hover:bg-slate-800 transition-colors shadow-md mt-6">
                  <Save size={18} />
                  <span>Save Landing Settings</span>
                </button>
              </form>
            </div>
          )}

          {/* --- BIO LINKS --- */}
          {activeTab === 'biolinks' && (
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-6 border-b pb-4">Bio Links Management</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form to Add/Edit */}
                <div className="lg:col-span-5 bg-slate-50 p-6 rounded-2xl border border-gray-100 h-fit">
                  <h4 className="font-bold text-slate-800 mb-4">{editingLinkId ? 'Edit Link' : 'Add New Link'}</h4>
                  <form onSubmit={handleSaveLink} className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Link Label</label>
                      <input 
                        type="text" value={linkLabel}
                        onChange={e => setLinkLabel(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none bg-white text-sm"
                        placeholder="e.g., Pricelist 2026" required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1">Redirect URL</label>
                      <input 
                        type="url" value={linkUrl}
                        onChange={e => setLinkUrl(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none bg-white text-sm"
                        placeholder="https://..." required
                      />
                      <p className="text-[11px] text-slate-400 mt-1">Include http:// or https://</p>
                    </div>

                    <div className="pb-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input 
                          type="checkbox" checked={linkActive}
                          onChange={e => setLinkActive(e.target.checked)}
                          className="w-4.5 h-4.5 rounded text-slate-900 focus:ring-slate-900 border-gray-300"
                        />
                        <span className="text-sm font-semibold text-slate-700">Active Status</span>
                      </label>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button type="submit" className="flex-1 bg-slate-900 text-white py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 hover:bg-slate-800 transition-colors text-sm">
                        {editingLinkId ? <Check size={16} /> : <Plus size={16} />}
                        <span>{editingLinkId ? 'Update Link' : 'Add Link'}</span>
                      </button>
                      {editingLinkId && (
                        <button type="button" onClick={handleCancelEdit} className="bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold hover:bg-slate-300 transition-colors text-sm">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                {/* List of links */}
                <div className="lg:col-span-7 space-y-4">
                  <h4 className="font-bold text-slate-800">Existing Links</h4>
                  {bioLinks.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center text-slate-400">
                      <Link2 size={24} className="mx-auto mb-2 text-slate-300" />
                      <p className="text-sm">No links added yet. Create one on the left.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bioLinks.map((link, idx) => (
                        <div 
                          key={link.id} 
                          draggable
                          onDragStart={(e) => handleDragStart(e, idx)}
                          onDragOver={(e) => handleDragOver(e, idx)}
                          onDragEnd={handleDragEnd}
                          className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                            draggedIndex === idx 
                              ? 'bg-slate-100 border-slate-300 opacity-40 scale-[0.98]' 
                              : link.is_active 
                                ? 'bg-white border-gray-200 hover:border-gray-300 shadow-sm' 
                                : 'bg-slate-50 border-gray-100 opacity-60'
                          }`}
                        >
                          {/* Drag Handle & Ordering controls */}
                          <div className="flex flex-col items-center gap-1 text-slate-400 flex-shrink-0">
                            <div className="cursor-grab p-1 hover:text-slate-700 transition-colors" title="Drag to reorder">
                              <GripVertical size={16} />
                            </div>
                            <div className="flex gap-0.5">
                              <button 
                                type="button"
                                disabled={idx === 0}
                                onClick={() => moveLink(idx, -1)}
                                className="p-0.5 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                title="Move Up"
                              >
                                <ChevronUp size={14} />
                              </button>
                              <button 
                                type="button"
                                disabled={idx === bioLinks.length - 1}
                                onClick={() => moveLink(idx, 1)}
                                className="p-0.5 hover:text-slate-700 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                title="Move Down"
                              >
                                <ChevronDown size={14} />
                              </button>
                            </div>
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {link.is_active ? (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-green-100 text-green-700 tracking-wide">ACTIVE</span>
                              ) : (
                                <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 tracking-wide">INACTIVE</span>
                              )}
                            </div>
                            <p className="font-bold text-slate-800 truncate text-sm">{link.label}</p>
                            <p className="text-xs text-slate-400 truncate">{link.url}</p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button 
                              type="button"
                              onClick={() => handleToggleActive(link)}
                              className={`p-1.5 rounded-lg transition-colors ${link.is_active ? 'hover:bg-amber-50 text-amber-600' : 'hover:bg-green-50 text-green-600'}`}
                              title={link.is_active ? 'Deactivate Link' : 'Activate Link'}
                            >
                              <Check size={16} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleEditLink(link)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors"
                              title="Edit Link"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDeleteLink(link.id)}
                              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-600 transition-colors"
                              title="Delete Link"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
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

              {/* Sport Visuals Section */}
              <div className="bg-red-50/50 rounded-2xl p-6 border border-red-100">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
                  <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm">Sport Theme Visuals</h4>
                </div>
                <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-4">
                  <VisualImageRow label="Hero / Jumbotron Background" settingKey="hero_image_sport" />
                  <VisualImageRow label='"The Story Behind" Background' settingKey="about_image_sport" />
                </div>
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

function ImageCropperModal({ src, onCrop, onCancel }) {
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imgSize, setImgSize] = useState({ width: 0, height: 0 });

  const handleImageLoaded = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    let w = 300;
    let h = 300;
    if (naturalWidth > naturalHeight) {
      w = (naturalWidth / naturalHeight) * 300;
    } else {
      h = (naturalHeight / naturalWidth) * 300;
    }
    setImgSize({ width: w, height: h });
    setOffsetX((300 - w) / 2);
    setOffsetY((300 - h) / 2);
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - offsetX, y: e.clientY - offsetY });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.x);
    setOffsetY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    setDragStart({ x: e.touches[0].clientX - offsetX, y: e.touches[0].clientY - offsetY });
  };

  const handleTouchMove = (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    setOffsetX(e.touches[0].clientX - dragStart.x);
    setOffsetY(e.touches[0].clientY - dragStart.y);
  };

  const handleCropSave = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 300, 300);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      const drawWidth = imgSize.width * zoom;
      const drawHeight = imgSize.height * zoom;
      const drawX = (offsetX + imgSize.width / 2) - drawWidth / 2;
      const drawY = (offsetY + imgSize.height / 2) - drawHeight / 2;

      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);

      canvas.toBlob((blob) => {
        if (blob) {
          onCrop(blob);
        }
      }, 'image/webp', 0.85);
    };
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col items-center">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Crop Profile Picture</h3>
        
        <div 
          className="relative w-[300px] h-[300px] bg-slate-100 border border-slate-200 overflow-hidden rounded-2xl select-none"
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          {src && (
            <img
              src={src}
              alt="Crop Source"
              draggable={false}
              onLoad={handleImageLoaded}
              className="absolute max-w-none max-h-none pointer-events-none"
              style={{
                width: imgSize.width || 'auto',
                height: imgSize.height || 'auto',
                transform: `translate(${offsetX}px, ${offsetY}px) scale(${zoom})`,
                transformOrigin: 'center'
              }}
            />
          )}
          
          {/* Circular mask overlay */}
          <div className="absolute w-[200px] h-[200px] rounded-full border border-white/40 shadow-[0_0_0_9999px_rgba(15,23,42,0.65)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
          
          {/* Circular dotted border guide */}
          <div className="absolute w-[200px] h-[200px] rounded-full border-2 border-dashed border-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <div className="w-full mt-5 mb-4">
          <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
            <span>ZOOM</span>
            <span>{Math.round(zoom * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="3" 
            step="0.02" 
            value={zoom} 
            onChange={(e) => setZoom(parseFloat(e.target.value))} 
            className="w-full accent-slate-900 cursor-pointer h-2 bg-slate-200 rounded-lg appearance-none" 
          />
        </div>

        <div className="flex gap-3 w-full">
          <button 
            type="button" 
            onClick={onCancel} 
            className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleCropSave} 
            className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-colors"
          >
            Crop &amp; Upload
          </button>
        </div>
      </div>
    </div>
  );
}
