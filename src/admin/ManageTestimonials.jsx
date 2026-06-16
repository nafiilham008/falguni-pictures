import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Star, Search, ArrowUpDown, Image as ImageIcon } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config/constants';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ManageTestimonials() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'client_name', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [clientName, setClientName] = useState('');
  const [role, setRole] = useState('');
  const [review, setReview] = useState('');
  const [rating, setRating] = useState(5);
  const [isApproved, setIsApproved] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

  const fetchTestimonials = async () => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/admin/testimonials`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
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

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const payload = { client_name: clientName, role, review, rating, is_approved: isApproved };
      
      let url = `${API_BASE_URL}/api/testimonials`;
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
        fetchTestimonials();
        MySwal.fire('Success!', 'Testimonial has been saved.', 'success');
      }
    } catch (err) {
      console.error("Failed to save testimonial", err);
      MySwal.fire('Error', 'Failed to save testimonial.', 'error');
    }
  };

  const openEditModal = (t) => {
    setEditingId(t.id);
    setClientName(t.client_name);
    setRole(t.role || '');
    setReview(t.review);
    setRating(t.rating);
    setIsApproved(t.is_approved);
    setImageUrl(t.image_url);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingId(null);
    setClientName('');
    setRole('');
    setReview('');
    setRating(5);
    setIsApproved(true); // new ones added by admin are approved by default
    setImageUrl(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Delete Testimonial?',
      text: "This testimonial will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete!'
    });

    if (!result.isConfirmed) return;
    
    try {
      const token = localStorage.getItem('falguni_admin_token');
      await fetch(`${API_BASE_URL}/api/testimonials/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchTestimonials();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleToggleApprove = async (t) => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const payload = { 
        client_name: t.client_name, 
        role: t.role, 
        review: t.review, 
        rating: t.rating, 
        is_approved: !t.is_approved 
      };
      const res = await fetch(`${API_BASE_URL}/api/testimonials/${t.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        fetchTestimonials();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFiltered = [...testimonials]
    .filter(t => 
      t.client_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (t.role || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.review.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      
      if (sortConfig.key === 'rating') {
         aVal = parseInt(aVal);
         bVal = parseInt(bVal);
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
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Manage Testimonials</h2>
          <p className="text-slate-500 mt-1">Manage reviews from clients who have used MRF Photography services.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search name or review..." 
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
            <span>Add Testimonial</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-sm text-slate-500 font-semibold tracking-wider uppercase">
              <th className="p-4 pl-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('client_name')}>
                <div className="flex items-center space-x-1"><span>Client Info</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('review')}>
                <div className="flex items-center space-x-1"><span>Review</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('rating')}>
                <div className="flex items-center justify-center space-x-1"><span>Rating</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400">Loading...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400">No testimonials found or search did not match.</td></tr>
            ) : paginatedData.map(t => (
              <tr key={t.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6">
                  <div className="flex items-center gap-3">
                    {t.image_url ? (
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                        <img src={`${API_BASE_URL}/api/${t.image_url}`} alt={t.client_name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-gray-200 shrink-0 text-slate-400">
                        <ImageIcon size={16} />
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900">{t.client_name}</div>
                      <div className="text-xs text-slate-500">{t.role || 'Client'}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600 max-w-md truncate">
                  "{t.review}"
                </td>
                <td className="p-4 text-center text-yellow-500 flex justify-center mt-3">
                  {[...Array(t.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleToggleApprove(t)}
                    title={t.is_approved ? 'Click to unapprove' : 'Click to approve'}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                      t.is_approved
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {t.is_approved ? '✓ Approved' : '○ Pending'}
                  </button>
                </td>
                <td className="p-4 text-right pr-6 space-x-2 whitespace-nowrap">
                  <button onClick={() => openEditModal(t)} className="text-blue-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-colors">
                    <Edit2 size={18} />
                  </button>
                  <button onClick={() => handleDelete(t.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors">
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
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900">{editingId ? 'Edit Testimonial' : 'Add Testimonial'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <div className="p-6">
              <form id="testimonialForm" onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Client Name</label>
                  <input 
                    type="text" 
                    value={clientName}
                    onChange={e => setClientName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                    placeholder="e.g. Budi & Siti"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Role / Event Type</label>
                  <input 
                    type="text" 
                    value={role}
                    onChange={e => setRole(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                    placeholder="e.g. Wedding Client"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Rating (1-5)</label>
                  <input 
                    type="number" 
                    min="1" max="5"
                    value={rating}
                    onChange={e => setRating(parseInt(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Review</label>
                  <textarea 
                    value={review}
                    onChange={e => setReview(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none h-32 resize-none"
                    placeholder="Write the review here..."
                    required
                  />
                </div>
                <div className="flex items-center pt-2">
                  <label className="flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={isApproved}
                      onChange={e => setIsApproved(e.target.checked)}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <span className="ml-3 text-sm font-semibold text-slate-700">Approved & Visible to Public</span>
                  </label>
                </div>
                {imageUrl && (
                  <div className="mt-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Attached Photo</label>
                    <div className="w-full h-48 rounded-xl border border-gray-200 overflow-hidden bg-slate-100 flex items-center justify-center">
                      <img src={`${API_BASE_URL}/api/${imageUrl}`} alt="Testimonial Photo" className="w-full h-full object-contain" />
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
                form="testimonialForm"
                className="px-6 py-3 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-md"
              >
                Save Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
