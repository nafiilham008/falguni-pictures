import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Search, ArrowUpDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config/constants';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ManagePackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [theme, setTheme] = useState('sport');
  const [category, setCategory] = useState('wedding');
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [features, setFeatures] = useState(['']);
  const [isPopular, setIsPopular] = useState(false);

  const fetchPackages = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/packages`);
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (err) {
      console.error("Failed to fetch packages", err);
    } finally {
      setLoading(false);
    }
  };

  const toTitleCase = (str) => {
    if (!str) return '';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const formatPriceToIDR = (value) => {
    if (!value) return '';
    // If it's already got currency prefix, just return
    if (value.includes('Rp') || value.includes('IDR')) return value;
    
    const numbersOnly = value.replace(/[^0-9]/g, '');
    if (!numbersOnly) return value;
    
    const parsed = parseInt(numbersOnly, 10);
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(parsed);
    
    // Clean up extra text (like "/ Match")
    const extraText = value.replace(/[0-9\.,]/g, '').replace('Rp', '').replace('IDR', '').trim();
    if (extraText) {
      return `${formatted} ${extraText}`;
    }
    
    return formatted;
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('falguni_admin_token');
      // Filter out empty features
      const cleanFeatures = features.filter(f => f.trim() !== '');
      
      const formattedName = toTitleCase(name);
      
      const payload = { 
        theme, 
        name: formattedName, 
        tag: tag, 
        features: cleanFeatures, 
        is_popular: isPopular,
        category: category 
      };
      
      let url = `${API_BASE_URL}/api/packages`;
      let method = 'POST';
      
      if (editingId) {
        url += `/${editingId}`;
        method = 'PUT';
      }

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchPackages();
        MySwal.fire('Success!', 'Package has been saved.', 'success');
      }
    } catch (err) {
      console.error("Failed to save package", err);
      MySwal.fire('Error', 'Failed to save package.', 'error');
    }
  };

  const openEditModal = (pkg) => {
    setEditingId(pkg.id);
    setTheme(pkg.theme);
    setCategory(pkg.category || 'wedding');
    setName(pkg.name);
    setTag(pkg.tag || '');
    setFeatures(pkg.features && pkg.features.length ? pkg.features : ['']);
    setIsPopular(pkg.is_popular);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setTheme('sport');
    setCategory('wedding');
    setName('');
    setTag('');
    setFeatures(['']);
    setIsPopular(false);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Delete Package?',
      text: "This package will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete!'
    });

    if (!result.isConfirmed) return;
    
    try {
      const token = localStorage.getItem('falguni_admin_token');
      await fetch(`${API_BASE_URL}/api/packages/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchPackages();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const addFeatureRow = () => {
    setFeatures([...features, '']);
  };

  const updateFeature = (index, value) => {
    const newF = [...features];
    newF[index] = value;
    setFeatures(newF);
  };

  const removeFeature = (index) => {
    const newF = features.filter((_, i) => i !== index);
    setFeatures(newF);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFiltered = [...packages]
    .filter(pkg => 
      pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      pkg.theme.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'is_popular') {
         aVal = aVal ? 1 : 0;
         bVal = bVal ? 1 : 0;
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
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Manage Packages</h2>
          <p className="text-slate-500 mt-1">Manage pricing packages displayed on the main page.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search packages or themes..." 
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
            <span>Add New Package</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-sm text-slate-500 font-semibold tracking-wider uppercase">
              <th className="p-4 pl-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('name')}>
                <div className="flex items-center space-x-1"><span>Package Name</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('theme')}>
                <div className="flex items-center space-x-1"><span>Theme</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('category')}>
                <div className="flex items-center space-x-1"><span>Category</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('tag')}>
                <div className="flex items-center space-x-1"><span>Promo Tag</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('is_popular')}>
                <div className="flex items-center justify-center space-x-1"><span>Popular?</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400">Loading...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-400">No packages found or search did not match.</td></tr>
            ) : paginatedData.map(pkg => (
              <tr key={pkg.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6 font-bold text-slate-900">{pkg.name}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${pkg.theme === 'sport' ? 'bg-red-100 text-red-600' : 'bg-violet-100 text-violet-600'}`}>
                    {pkg.theme}
                  </span>
                </td>
                <td className="p-4">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    {toTitleCase(pkg.category || 'N/A')}
                  </span>
                </td>
                <td className="p-4 font-semibold text-slate-600">
                  {pkg.tag ? <span className="px-2 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700">{pkg.tag}</span> : <span className="text-gray-300">—</span>}
                </td>
                <td className="p-4 text-center">
                  {pkg.is_popular ? <span className="text-yellow-500 font-bold">⭐ Yes</span> : <span className="text-gray-300">-</span>}
                </td>
                <td className="p-4 text-right pr-6 space-x-2">
                  <button onClick={() => openEditModal(pkg)} className="text-blue-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
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
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Package' : 'Add New Package'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="packageForm" onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Package Name</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                      placeholder="e.g. Pre-Wedding Standard"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Theme</label>
                    <select 
                      value={theme}
                      onChange={e => setTheme(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                    >
                      <option value="sport">Sport</option>
                      <option value="portrait">Portrait</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Category (Tab)</label>
                    <select 
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                    >
                      <option value="wedding">Wedding</option>
                      <option value="wisuda">Wisuda / Graduation</option>
                      <option value="prewed">Pre-Wedding</option>
                      <option value="engagement">Engagement / Lamaran</option>
                      <option value="sport">Sport / Event</option>
                      <option value="custom">Custom & Special Events</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Promo Tag <span className="text-slate-400 font-normal">(optional)</span></label>
                    <input 
                      type="text" 
                      value={tag}
                      onChange={e => setTag(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                      placeholder="e.g. 🔥 Best Seller, ⭐ New, 💎 Premium"
                    />
                  </div>
                  <div className="flex items-center pt-8">
                    <label className="flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={isPopular}
                        onChange={e => setIsPopular(e.target.checked)}
                        className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                      />
                      <span className="ml-3 text-sm font-semibold text-slate-700">Mark as 'Most Popular'</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Features / Include</label>
                  {features.map((feat, idx) => (
                    <div key={idx} className="flex mb-2 space-x-2">
                      <input 
                        type="text" 
                        value={feat}
                        onChange={e => updateFeature(idx, e.target.value)}
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 outline-none"
                        placeholder={`Feature ${idx + 1}`}
                      />
                      <button 
                        type="button" 
                        onClick={() => removeFeature(idx)}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                  <button 
                    type="button"
                    onClick={addFeatureRow}
                    className="mt-2 text-sm font-bold text-blue-600 hover:text-blue-800"
                  >
                    + Add More Feature
                  </button>
                </div>
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
                form="packageForm"
                className="px-6 py-3 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-md"
              >
                Save Package
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
