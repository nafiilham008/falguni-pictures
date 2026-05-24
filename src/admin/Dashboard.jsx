import { useState, useEffect } from 'react';
import { Users, Eye, Image as ImageIcon, TrendingUp, Calendar as CalendarIcon } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { API_BASE_URL } from '../config/constants';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalViews: 0,
    sportViews: 0,
    weddingViews: 0,
    totalEvents: 0,
    topContent: []
  });
  
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('falguni_admin_token');
        const resStats = await fetch(`${API_BASE_URL}/api/analytics/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (resStats.ok) {
          const dataStats = await resStats.json();
          setStats(dataStats);
        }

        const resBookings = await fetch(`${API_BASE_URL}/api/bookings/approved`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (resBookings.ok) {
          const dataBookings = await resBookings.json();
          setApprovedBookings(dataBookings);
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Total Visitors', value: stats.totalViews || 0, icon: Users, color: 'bg-blue-500' },
    { title: 'Sport Theme Views', value: stats.sportViews || 0, icon: Eye, color: 'bg-red-500' },
    { title: 'Portrait Theme Views', value: stats.weddingViews || 0, icon: Eye, color: 'bg-rose-400' },
    { title: 'Total Bookings', value: stats.totalBookings || 0, icon: TrendingUp, color: 'bg-emerald-500' },
    { title: 'Total Portfolio Items', value: stats.totalEvents || 0, icon: ImageIcon, color: 'bg-purple-500' },
  ];

  if (loading) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-6 py-1"><div className="h-4 bg-slate-200 rounded"></div><div className="space-y-3"><div className="grid grid-cols-4 gap-4"><div className="h-24 bg-slate-200 rounded"></div><div className="h-24 bg-slate-200 rounded"></div><div className="h-24 bg-slate-200 rounded"></div><div className="h-24 bg-slate-200 rounded"></div></div></div></div></div>;

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">Analytics Overview</h2>
          <p className="text-slate-500 mt-1">Track your portfolio performance and visitor engagement.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center space-x-4">
              <div className={`${card.color} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner`}>
                <Icon size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500">{card.title}</p>
                <h3 className="text-2xl font-black text-slate-900">{card.value}</h3>
              </div>
            </div>
          );
        })}
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Popular Content */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center"><TrendingUp className="mr-2 text-rose-500" /> Top Popular Content</h3>
            {stats.topContent && stats.topContent.length > 0 ? (
              <ul className="space-y-4 flex-1">
                {stats.topContent.map((item, idx) => (
                  <li key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm">{idx + 1}</div>
                      <span className="font-semibold text-slate-800">{item.title}</span>
                    </div>
                    <div className="text-sm font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-gray-200">{item.views} Views</div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-slate-500 text-center py-8 flex-1 flex items-center justify-center">No content analytics data available yet.</p>
            )}
          </div>

          {/* Calendar of Bookings */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center"><CalendarIcon className="mr-2 text-blue-500" /> Booking Calendar</h3>
            <div className="flex-1 flex flex-col items-center justify-center">
              <style>{`
                .react-datepicker { font-family: inherit; border: none; width: 100%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 1rem; overflow: hidden; }
                .react-datepicker__month-container { width: 100%; padding: 1rem; }
                .react-datepicker__header { background-color: #f8fafc; border-bottom: 1px solid #f1f5f9; padding-top: 1rem; position: relative; }
                .react-datepicker__current-month { color: #0f172a !important; font-weight: 700 !important; font-size: 1.1rem !important; margin-bottom: 0.5rem !important; }
                .react-datepicker__day-name { color: #64748b; font-weight: 600; width: 2.5rem; }
                .react-datepicker__day { width: 2.5rem; height: 2.5rem; line-height: 2.5rem; font-weight: 500; color: #334155; border-radius: 9999px; margin: 0.2rem; transition: all 0.2s; }
                .react-datepicker__day:hover { background-color: #f1f5f9; }
                .react-datepicker__day--keyboard-selected { background-color: transparent; }
                .highlighted-date { background-color: #3b82f6 !important; color: white !important; font-weight: bold; box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39); }
                .highlighted-date:hover { background-color: #2563eb !important; }
                
                /* Custom Premium Month Navigation Buttons */
                .react-datepicker__navigation {
                  top: 12px !important;
                  height: 32px !important;
                  width: 32px !important;
                  border-radius: 9999px !important;
                  border: 1px solid #e2e8f0 !important;
                  background-color: #ffffff !important;
                  transition: all 0.2s ease-in-out !important;
                  display: flex !important;
                  align-items: center !important;
                  justify-content: center !important;
                }
                .react-datepicker__navigation:hover {
                  background-color: #f1f5f9 !important;
                  border-color: #cbd5e1 !important;
                  transform: scale(1.05);
                }
                .react-datepicker__navigation--previous {
                  left: 16px !important;
                }
                .react-datepicker__navigation--next {
                  right: 16px !important;
                }
                .react-datepicker__navigation-icon {
                  top: 0px !important;
                }
                .react-datepicker__navigation-icon::before {
                  border-color: #64748b !important;
                  border-width: 2px 2px 0 0 !important;
                  width: 7px !important;
                  height: 7px !important;
                  top: 11px !important;
                }
                .react-datepicker__navigation:hover .react-datepicker__navigation-icon::before {
                  border-color: #0f172a !important;
                }
                .react-datepicker__navigation-icon--previous::before {
                  left: 13px !important;
                  transform: rotate(225deg) !important;
                }
                .react-datepicker__navigation-icon--next::before {
                  left: 9px !important;
                  transform: rotate(45deg) !important;
                }
              `}</style>
              <DatePicker
                inline
                readOnly
                highlightDates={[
                  {
                    "react-datepicker__day--highlighted-custom-class highlighted-date": approvedBookings.map(b => new Date(b.event_date))
                  }
                ]}
                renderDayContents={(day, date) => {
                  const bookingsOnDate = approvedBookings.filter(b => new Date(b.event_date).toDateString() === date.toDateString());
                  if (bookingsOnDate.length > 0) {
                    return (
                      <div title={`${bookingsOnDate.length} booking(s): \n${bookingsOnDate.map(b => '- ' + b.client_name).join('\n')}`}>
                        {day}
                      </div>
                    );
                  }
                  return day;
                }}
              />
              <p className="text-xs text-slate-500 mt-6 text-center max-w-sm">
                Dates highlighted in blue indicate an approved booking. Hover over a highlighted date to see details.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
}
