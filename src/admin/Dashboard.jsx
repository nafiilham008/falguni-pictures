import { useState, useEffect } from 'react';
import { Users, Eye, Image as ImageIcon, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalViews: 0,
    sportViews: 0,
    weddingViews: 0,
    totalEvents: 0,
    topContent: []
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('falguni_admin_token');
        const resStats = await fetch('http://localhost:5000/api/analytics/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (resStats.ok) {
          const dataStats = await resStats.json();
          setStats(dataStats);
        }

      } catch (err) {
        console.error("Failed to fetch analytics", err);
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

      <div className="grid grid-cols-1 gap-8">
        {/* Top Popular Content */}
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center"><TrendingUp className="mr-2 text-rose-500" /> Top Popular Content</h3>
          {stats.topContent && stats.topContent.length > 0 ? (
            <ul className="space-y-4">
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
            <p className="text-slate-500 text-center py-8">No content analytics data available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
