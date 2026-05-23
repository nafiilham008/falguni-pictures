import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Edit2, UploadCloud, Loader2, Image as ImageIcon, X, Star, Search, ArrowUpDown } from 'lucide-react';
import { getAssetUrl } from '../config/constants';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ManagePortfolio() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'title', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form State
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('sport');
  const [category, setCategory] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]); // New uploads
  const [existingImages, setExistingImages] = useState([]); // Existing DB images
  const [isUploading, setIsUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const fileInputRef = useRef(null);

  const PORTRAIT_CATEGORIES = [
    { value: 'wisuda',  label: 'Wisuda / Graduation' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'prewed',  label: 'Pre-Wedding' },
    { value: 'engagement', label: 'Engagement / Lamaran' },
    { value: 'family',  label: 'Family' },
    { value: 'others',  label: 'Others' },
  ];

  const getCategoryLabel = (val) => PORTRAIT_CATEGORIES.find(c => c.value === val)?.label || val;

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events');
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (err) {
      console.error("Failed to fetch events, using fallback UI", err);
      // Fallback for UI demonstration before DB is connected
      setEvents([
        { id: 1, title: 'Sample Event', theme: 'sport', images: [] }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setIsUploading(true);
    
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const token = localStorage.getItem('falguni_admin_token');
        const res = await fetch('http://localhost:5000/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });
        
        if (res.ok) {
          const data = await res.json();
          // The backend returns the R2 key (e.g. assets/media/upload_123.jpg)
          // We assume getAssetUrl handles this on the frontend, so we just save the key.
          setUploadedFiles(prev => [...prev, { url: data.path, is_cover: prev.length === 0 }]);
        }
      } catch (err) {
        console.error("Upload failed", err);
        alert(`Failed to upload ${file.name}`);
      }
    }
    
    setIsUploading(false);
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    if (!title) {
      alert("Please provide a title.");
      return;
    }

    try {
      const token = localStorage.getItem('falguni_admin_token');
      let res;
      if (editingId) {
        // Edit mode (Update)
        res = await fetch(`http://localhost:5000/api/events/${editingId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ title, theme, category: theme === 'portrait' ? category : null })
        });
        
        // Append new uploaded files
        if (uploadedFiles.length > 0) {
          await fetch(`http://localhost:5000/api/events/${editingId}/images`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ images: uploadedFiles })
          });
        }
      } else {
        // Create mode
        if (uploadedFiles.length === 0) {
          alert("Please provide at least one image.");
          return;
        }
        res = await fetch('http://localhost:5000/api/events', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            title,
            theme,
            category: theme === 'portrait' ? category : null,
            images: uploadedFiles
          })
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setTheme('sport');
        setCategory('');
        setUploadedFiles([]);
        setExistingImages([]);
        setEditingId(null);
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to save event", err);
      alert("Failed to save event to database");
    }
  };

  const openEditModal = (ev) => {
    setEditingId(ev.id);
    setTitle(ev.title);
    setTheme(ev.theme);
    setCategory(ev.category || '');
    setExistingImages(ev.images || []);
    setUploadedFiles([]); 
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setTheme('sport');
    setCategory('');
    setExistingImages([]);
    setUploadedFiles([]);
    setIsModalOpen(true);
  };

  const handleDeleteExistingImage = async (imageId) => {
    const result = await MySwal.fire({
      title: 'Delete Image?',
      text: "This image will be permanently deleted from Cloudflare R2 and the Database.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete!'
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`http://localhost:5000/api/events/${editingId}/images/${imageId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setExistingImages(prev => prev.filter(img => img.id !== imageId));
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to delete image", err);
      MySwal.fire('Error', 'Failed to delete image.', 'error');
    }
  };

  const handleSetExistingCover = async (imageId) => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`http://localhost:5000/api/events/${editingId}/images/${imageId}/cover`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setExistingImages(prev => prev.map(img => ({
          ...img,
          is_cover: img.id === imageId
        })));
        fetchEvents();
      }
    } catch (err) {
      console.error("Failed to set cover", err);
    }
  };

  const handleDeleteNewUpload = async (fileKey, idx) => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      await fetch(`http://localhost:5000/api/upload`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ key: fileKey })
      });
      
      setUploadedFiles(prev => {
        const newArr = prev.filter((_, i) => i !== idx);
        // If we deleted the cover, make the first one cover
        if (prev[idx].is_cover && newArr.length > 0) {
          newArr[0].is_cover = true;
        }
        return newArr;
      });
    } catch (err) {
      console.error("Failed to delete upload", err);
    }
  };

  const handleSetNewUploadCover = (idx) => {
    setUploadedFiles(prev => prev.map((f, i) => ({
      ...f,
      is_cover: i === idx
    })));
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Delete Event?',
      text: "The event and all its photos will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete!'
    });

    if (!result.isConfirmed) return;
    
    try {
      const token = localStorage.getItem('falguni_admin_token');
      await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchEvents();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFiltered = [...events]
    .filter(ev => 
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      ev.theme.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'total_media') {
         aVal = a.images ? a.images.length : 0;
         bVal = b.images ? b.images.length : 0;
      } else {
         aVal = aVal || '';
         bVal = bVal || '';
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  // Reset page to 1 when search or sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortConfig]);

  const totalPages = Math.ceil(sortedAndFiltered.length / itemsPerPage);
  const paginatedData = sortedAndFiltered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Manage Portfolio</h2>
          <p className="text-slate-500 mt-1">Add, edit, or remove your portfolio events.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search event or theme..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
            />
          </div>
          <button 
            onClick={openAddModal}
            className="w-full sm:w-auto bg-slate-900 text-white px-6 py-2 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-slate-800 transition-colors shadow-md"
          >
            <Plus size={20} />
            <span>Add New Event</span>
          </button>
        </div>
      </div>

      {/* List Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-sm text-slate-500 font-semibold tracking-wider uppercase">
              <th className="p-4 pl-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('title')}>
                <div className="flex items-center space-x-1"><span>Event Title</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('theme')}>
                <div className="flex items-center space-x-1"><span>Theme</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('total_media')}>
                <div className="flex items-center space-x-1"><span>Total Media</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400">Loading...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400">No events found or search did not match.</td></tr>
            ) : paginatedData.map(ev => (
              <tr key={ev.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6 font-bold text-slate-900">{ev.title}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${ev.theme === 'sport' ? 'bg-red-100 text-red-600' : 'bg-rose-100 text-rose-600'}`}>
                    {ev.theme === 'portrait' ? 'Portrait' : ev.theme}
                  </span>
                  {ev.category && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 uppercase">
                      {getCategoryLabel(ev.category)}
                    </span>
                  )}
                </td>
                <td className="p-4 font-semibold text-slate-600">{ev.images ? ev.images.length : 0} Files</td>
                <td className="p-4 text-right pr-6 space-x-2">
                  <button onClick={() => openEditModal(ev)} className="text-blue-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(ev.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-t border-gray-100 bg-slate-50 gap-4">
            <span className="text-sm text-slate-500">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, sortedAndFiltered.length)} of {sortedAndFiltered.length} entries
            </span>
            <div className="flex space-x-1">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-200 transition-colors bg-white text-slate-600"
              >
                Prev
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                if (
                  totalPages <= 7 ||
                  i === 0 || 
                  i === totalPages - 1 || 
                  (i >= currentPage - 2 && i <= currentPage)
                ) {
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-1 border rounded-lg text-sm transition-colors ${currentPage === i + 1 ? 'bg-slate-900 text-white border-slate-900' : 'border-gray-200 hover:bg-slate-200 text-slate-600 bg-white'}`}
                    >
                      {i + 1}
                    </button>
                  );
                }
                
                if (i === 1 && currentPage > 3) return <span key={i} className="px-2 py-1 text-slate-400">...</span>;
                if (i === totalPages - 2 && currentPage < totalPages - 2) return <span key={i} className="px-2 py-1 text-slate-400">...</span>;
                
                return null;
              })}

              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-slate-200 transition-colors bg-white text-slate-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Portfolio Event' : 'Add New Portfolio Event'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="eventForm" onSubmit={handleSaveEvent} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Event Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                      placeholder="e.g. Wedding Aeni & Arif"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Theme</label>
                    <select 
                      value={theme}
                      onChange={e => { setTheme(e.target.value); setCategory(''); }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                    >
                      <option value="sport">Sport</option>
                      <option value="portrait">Portrait</option>
                    </select>
                  </div>
                </div>

                {/* Category dropdown — only shown for Portrait theme */}
                {theme === 'portrait' && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Portrait Category</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                      required
                    >
                      <option value="">-- Select Category --</option>
                      {PORTRAIT_CATEGORIES.map(c => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* ⚠️ Photo required warning */}
                <div className={`flex items-start gap-3 p-4 rounded-xl border ${theme === 'portrait' ? 'bg-amber-50 border-amber-200' : 'bg-blue-50 border-blue-200'}`}>
                  <svg className={`w-5 h-5 mt-0.5 flex-shrink-0 ${theme === 'portrait' ? 'text-amber-500' : 'text-blue-500'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-bold text-slate-800">At least 1 photo is required</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      If this event contains a video, <strong>always include at least 1 photo</strong> in the same album.
                      The photo will be used as a thumbnail in the portfolio grid. Events with only videos will show a dark placeholder.
                    </p>
                  </div>
                </div>

                {/* Upload Area (Shown for both Create & Edit) */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Upload New Media (Images & MP4)</label>
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      multiple 
                      accept="image/*,video/mp4" 
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                    />
                    
                    {isUploading ? (
                      <div className="flex flex-col items-center text-slate-500">
                        <Loader2 size={32} className="animate-spin mb-3 text-blue-500" />
                        <p className="font-semibold text-sm">Uploading & converting to WebP...</p>
                        <p className="text-xs mt-1">Please wait, do not close.</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-slate-500">
                        <UploadCloud size={40} className="mb-3 text-slate-400" />
                        <p className="font-semibold">Click or drag files here to upload</p>
                        <p className="text-xs mt-1 text-slate-400">Images are auto-converted to WebP for fast loading.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Existing Media Preview */}
                {editingId && existingImages.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Existing Media in Album</h4>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                      {existingImages.map((file) => {
                        const isVid = file.url.toLowerCase().endsWith('.mp4');
                        const fullUrl = getAssetUrl(file.url);
                        return (
                          <div key={file.id} className="aspect-square rounded-xl bg-gray-100 border border-gray-200 shadow-sm relative group overflow-hidden">
                            {isVid ? (
                              <video src={`${fullUrl}#t=1`} className="w-full h-full object-cover" />
                            ) : (
                              <img src={fullUrl} className="w-full h-full object-cover" />
                            )}
                            {file.is_cover && <div className="absolute bottom-0 w-full bg-blue-500 text-[8px] text-white text-center font-bold py-1">COVER</div>}
                            
                            <button 
                              type="button"
                              onClick={() => handleSetExistingCover(file.id)}
                              className="absolute top-1 left-1 bg-white text-yellow-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-50 shadow-md"
                              title="Set as Cover"
                            >
                              <Star size={12} fill={file.is_cover ? "currentColor" : "none"} />
                            </button>

                            <button 
                              type="button"
                              onClick={() => handleDeleteExistingImage(file.id)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* New Uploads Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-semibold text-slate-700 mb-3">Newly Uploaded ({uploadedFiles.length})</h4>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-4">
                      {uploadedFiles.map((file, idx) => {
                        const isVid = file.url.toLowerCase().endsWith('.mp4');
                        const fullUrl = getAssetUrl(file.url);
                        return (
                          <div key={idx} className="aspect-square rounded-xl bg-gray-100 border border-gray-200 shadow-sm relative group overflow-hidden">
                             {isVid ? (
                              <video src={`${fullUrl}#t=1`} className="w-full h-full object-cover opacity-80" />
                            ) : (
                              <img src={fullUrl} className="w-full h-full object-cover opacity-80" />
                            )}
                            <div className="absolute inset-0 border-2 border-green-400 rounded-xl pointer-events-none"></div>
                             {file.is_cover && <div className="absolute bottom-0 w-full bg-blue-500 text-[8px] text-white text-center font-bold py-1">COVER</div>}
                             
                            <button 
                              type="button"
                              onClick={() => handleSetNewUploadCover(idx)}
                              className="absolute top-1 left-1 bg-white text-yellow-500 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-yellow-50 shadow-md"
                              title="Set as Cover"
                            >
                              <Star size={12} fill={file.is_cover ? "currentColor" : "none"} />
                            </button>

                            <button 
                              type="button"
                              onClick={() => handleDeleteNewUpload(file.url, idx)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-md"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </form>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-slate-50 flex justify-end space-x-3">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-6 py-3 font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="eventForm"
                disabled={isUploading}
                className="px-6 py-3 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-50 shadow-md"
              >
                Save Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
