import { useState, useEffect } from 'react';
import { Trash2, Calendar, Search, ArrowUpDown } from 'lucide-react';
import Swal from 'sweetalert2';
import { API_BASE_URL } from '../config/constants';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/bookings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setBookings(data);
      }
    } catch (err) {
      console.error("Failed to fetch bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleDelete = async (id) => {
    const result = await MySwal.fire({
      title: 'Delete Booking Log?',
      text: "This booking record will be permanently deleted.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete!'
    });

    if (!result.isConfirmed) return;
    
    try {
      const token = localStorage.getItem('falguni_admin_token');
      await fetch(`${API_BASE_URL}/api/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchBookings();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleToggleStatus = async (booking) => {
    const newStatus = booking.status === 'approved' ? 'pending' : 'approved';
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/bookings/${booking.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setBookings(prev =>
          prev.map(b => b.id === booking.id ? { ...b, status: newStatus } : b)
        );
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAndFiltered = [...bookings]
    .filter(b => 
      b.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.event.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      // Handle nulls
      const aVal = a[sortConfig.key] || '';
      const bVal = b[sortConfig.key] || '';
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
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Booking Logs</h2>
          <p className="text-slate-500 mt-1">Client prospects submitted from the front page before they are redirected to WhatsApp.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients or packages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-gray-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-shadow outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-gray-100 text-sm text-slate-500 font-semibold tracking-wider uppercase">
              <th className="p-4 pl-6 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('client_name')}>
                <div className="flex items-center space-x-1"><span>Client Name</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('event')}>
                <div className="flex items-center space-x-1"><span>Event / Package</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('event_date')}>
                <div className="flex items-center space-x-1"><span>Plan Date</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4">Message</th>
              <th className="p-4">Location</th>
              <th className="p-4">Instagram</th>
              <th className="p-4 text-center cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => handleSort('status')}>
                <div className="flex items-center justify-center space-x-1"><span>Status</span><ArrowUpDown size={14} /></div>
              </th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="8" className="p-8 text-center text-slate-400">Loading...</td></tr>
            ) : paginatedData.length === 0 ? (
              <tr><td colSpan="8" className="p-8 text-center text-slate-400">No bookings found or search yielded no results.</td></tr>
            ) : paginatedData.map(b => (
              <tr key={b.id} className="border-b border-gray-50 hover:bg-slate-50/50 transition-colors">
                <td className="p-4 pl-6">
                  <div className="font-bold text-slate-900">{b.client_name}</div>
                  <div className="text-xs text-slate-500">{new Date(b.created_at).toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                </td>
                <td className="p-4 font-semibold text-blue-600">
                  {b.event}
                </td>
                <td className="p-4 text-slate-700">
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span>{b.event_date ? new Date(b.event_date).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-slate-600 max-w-xs truncate" title={b.message}>
                  {b.message || '-'}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {b.location || <span className="text-slate-300">-</span>}
                </td>
                <td className="p-4 text-sm text-slate-600">
                  {b.instagram ? <span className="text-blue-500">@{b.instagram.replace('@','')}</span> : <span className="text-slate-300">-</span>}
                </td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleToggleStatus(b)}
                    title={b.status === 'approved' ? 'Click to mark as Pending' : 'Click to Approve'}
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                      b.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    {b.status === 'approved' ? '✓ Approved' : '○ Pending'}
                  </button>
                </td>
                <td className="p-4 text-right pr-6">
                  <button onClick={() => handleDelete(b.id)} className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors" title="Delete Log">
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
                // Show only a few pages to avoid overflow if pages are many
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
                
                // Show ellipsis
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
    </div>
  );
}
