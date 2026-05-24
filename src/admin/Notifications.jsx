import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { API_BASE_URL } from '../config/constants';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const MySwal = withReactContent(Swal);

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      }
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('falguni_admin_token');
      const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        MySwal.fire({
          icon: 'success',
          title: 'Marked all as read',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });
      }
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-1/4"></div>
        <div className="h-24 bg-slate-200 rounded"></div>
        <div className="h-24 bg-slate-200 rounded"></div>
        <div className="h-24 bg-slate-200 rounded"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
            <Bell className="text-slate-500" /> Notifications
          </h2>
          <p className="text-slate-500 mt-1">View your full notification history and reminders.</p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold transition-colors shadow-sm"
          >
            <Check size={18} /> Mark All as Read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {notifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-6 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${notif.is_read ? 'bg-white opacity-70' : 'bg-blue-50/30'}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    {!notif.is_read && <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0"></span>}
                    <h4 className={`text-lg ${notif.is_read ? 'font-semibold text-slate-700' : 'font-bold text-slate-900'}`}>{notif.title}</h4>
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-500">
                      {notif.type}
                    </span>
                  </div>
                  <p className="text-slate-600 leading-relaxed max-w-3xl">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-3 text-sm text-slate-400 font-semibold">
                    <Calendar size={14} />
                    <span>{new Date(notif.created_at).toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                    >
                      View Details
                    </Link>
                  )}
                  {!notif.is_read && (
                    <button
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
              <Bell size={40} className="text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">All Caught Up!</h3>
            <p className="text-slate-500 max-w-sm">You have no notifications yet. When you receive new bookings or reminders, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
