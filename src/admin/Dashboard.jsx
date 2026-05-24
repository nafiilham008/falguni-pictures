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

  const getBookingsForDate = (date) => {
    return approvedBookings.filter(b => {
      const bDate = new Date(b.event_date);
      return bDate.getFullYear() === date.getFullYear() &&
             bDate.getMonth() === date.getMonth() &&
             bDate.getDate() === date.getDate();
    });
  };

  const todayDate = new Date();
  const tomorrowDate = new Date();
  tomorrowDate.setDate(todayDate.getDate() + 1);

  const todayBookings = getBookingsForDate(todayDate);
  const tomorrowBookings = getBookingsForDate(tomorrowDate);

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
                .react-datepicker { font-family: inherit; border: none; width: 100%; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1); border-radius: 1rem; overflow: visible; }
                .react-datepicker__month-container { width: 100%; padding: 1rem; }
                .react-datepicker__header { background-color: #f8fafc; border-bottom: 1px solid #f1f5f9; padding-top: 1rem; position: relative; border-top-left-radius: 1rem !important; border-top-right-radius: 1rem !important; }
                .react-datepicker__current-month { color: #0f172a !important; font-weight: 700 !important; font-size: 1.1rem !important; margin-bottom: 0.5rem !important; }
                .react-datepicker__day-name { color: #64748b; font-weight: 600; width: 2.5rem; }
                .react-datepicker__day { width: 2.5rem; height: 2.5rem; line-height: 2.5rem; font-weight: 500; color: #334155; border-radius: 9999px; margin: 0.2rem; transition: all 0.2s; position: relative; }
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

                /* Dashboard Matching Custom Tooltip styles */
                .datepicker-tooltip {
                  visibility: hidden;
                  opacity: 0;
                  position: absolute;
                  bottom: 100%;
                  left: 50%;
                  transform: translate(-50%, -8px);
                  background-color: #0f172a; /* slate-900 */
                  color: #ffffff;
                  padding: 8px 12px;
                  border-radius: 0.75rem;
                  width: 190px;
                  box-shadow: 0 10px 25px -5px rgb(0 0 0 / 0.3), 0 8px 10px -6px rgb(0 0 0 / 0.3);
                  z-index: 100;
                  transition: all 0.15s ease-in-out;
                  pointer-events: none;
                  border: 1px solid #1e293b;
                  line-height: 1.4;
                  text-align: left;
                }
                .datepicker-tooltip-arrow {
                  position: absolute;
                  top: 100%;
                  left: 50%;
                  transform: translateX(-50%);
                  border-width: 6px;
                  border-style: solid;
                  border-color: #0f172a transparent transparent transparent;
                }
                .group:hover .datepicker-tooltip {
                  visibility: visible;
                  opacity: 1;
                  transform: translate(-50%, -4px);
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
                      <div className="relative group w-full h-full flex items-center justify-center">
                        <span className="relative z-10">{day}</span>
                        <div className="datepicker-tooltip">
                          <div className="font-bold text-blue-400 text-xs mb-1.5 border-b border-slate-800 pb-1 flex justify-between items-center">
                            <span>Bookings</span>
                            <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                              {bookingsOnDate.length} Approved
                            </span>
                          </div>
                          <div className="space-y-1.5 max-h-32 overflow-y-auto no-scrollbar">
                            {bookingsOnDate.map((b, idx) => (
                              <div key={idx} className="text-[11px] leading-tight">
                                <div className="font-semibold text-slate-100 truncate">• {b.client_name}</div>
                                <div className="text-[10px] text-slate-400 pl-2.5 truncate">{b.event}</div>
                                {b.location && (
                                  <div className="text-[9px] text-slate-500 pl-2.5 truncate">📍 {b.location}</div>
                                )}
                              </div>
                            ))}
                          </div>
                          <div className="datepicker-tooltip-arrow"></div>
                        </div>
                      </div>
                    );
                  }
                  return day;
                }}
              />
              
              <div className="w-full mt-6 pt-6 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">📅 Agenda / Bookings Schedule</h4>
                  <span className="text-[11px] text-slate-400">Blue dates indicate approved slots</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Today's Agenda */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-700">Today</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        todayBookings.length > 0 
                          ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                          : 'bg-slate-200/50 text-slate-500'
                      }`}>
                        {todayBookings.length} {todayBookings.length === 1 ? 'Booking' : 'Bookings'}
                      </span>
                    </div>
                    {todayBookings.length > 0 ? (
                      <ul className="space-y-2">
                        {todayBookings.map((b, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start space-x-2">
                            <span className="text-blue-500 mt-0.5 font-bold">•</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-800 truncate" title={b.client_name}>{b.client_name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{b.event} {b.location ? `| 📍 ${b.location}` : ''}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No bookings scheduled for today</p>
                    )}
                  </div>

                  {/* Tomorrow's Agenda */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-bold text-slate-700">Tomorrow</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        tomorrowBookings.length > 0 
                          ? 'bg-indigo-50 text-indigo-600 border border-indigo-100' 
                          : 'bg-slate-200/50 text-slate-500'
                      }`}>
                        {tomorrowBookings.length} {tomorrowBookings.length === 1 ? 'Booking' : 'Bookings'}
                      </span>
                    </div>
                    {tomorrowBookings.length > 0 ? (
                      <ul className="space-y-2">
                        {tomorrowBookings.map((b, idx) => (
                          <li key={idx} className="text-xs text-slate-600 flex items-start space-x-2">
                            <span className="text-indigo-500 mt-0.5 font-bold">•</span>
                            <div className="flex-1 min-w-0">
                              <div className="font-bold text-slate-800 truncate" title={b.client_name}>{b.client_name}</div>
                              <div className="text-[10px] text-slate-500 truncate">{b.event} {b.location ? `| 📍 ${b.location}` : ''}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No bookings scheduled for tomorrow</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
}
