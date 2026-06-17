import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

const getPriorityColor = (priority) => {
  const colors = { low: '#10b981', medium: '#3b82f6', high: '#f59e0b', urgent: '#ef4444' };
  return colors[priority] || '#6b7280';
};

const getStatusColor = (status) => {
  const colors = { open: '#f59e0b', in_progress: '#3b82f6', resolved: '#10b981', closed: '#6b7280' };
  return colors[status] || '#6b7280';
};

export default function Dashboard() {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDays, setSelectedDays] = useState(30);

  useEffect(() => {
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [selectedDays]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:5000/api/analytics', {
        params: { days: selectedDays },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        setAnalytics(response.data.analytics);
      }
    } catch (error) {
      console.error('Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="premium-spinner"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No analytics data available</p>
        <button onClick={fetchAnalytics} className="mt-4 btn-premium">
          Refresh
        </button>
      </div>
    );
  }

  const weeklyData = analytics.weeklyData || [];
  const priorityData = Object.entries(analytics.priorityData || {}).map(([name, value]) => ({ name, value }));
  const statusData = Object.entries(analytics.statusData || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.name}! 👋</h1>
            <p className="text-indigo-100 mt-1">Here's your analytics overview</p>
          </div>
          <select
            value={selectedDays}
            onChange={(e) => setSelectedDays(parseInt(e.target.value))}
            className="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-1.5 text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Tickets</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics.totalTickets}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Resolution Rate</p>
          <p className="text-2xl font-bold text-green-600">{analytics.resolutionRate}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">CSAT Score</p>
          <p className="text-2xl font-bold text-indigo-600">{analytics.csatScore}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg Response Time</p>
          <p className="text-2xl font-bold text-orange-600">{analytics.avgResponseTime} min</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Ticket Trend */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Weekly Ticket Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#a5b4fc" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Distribution - FIXED NO OVERLAP */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Priority Distribution</h3>
          {priorityData.some(p => p.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    label={false}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} tickets`, name.charAt(0).toUpperCase() + name.slice(1)]} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend - Clean and clear */}
              <div className="flex justify-center gap-4 mt-2 flex-wrap">
                {priorityData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 capitalize">{item.name}</span>
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">No priority data available</div>
          )}
        </div>
      </div>

      {/* Status Distribution Bar Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Ticket Status Distribution</h3>
        {statusData.some(s => s.value > 0) ? (
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {statusData.map((entry) => (
                  <Cell key={`cell-${entry.name}`} fill={getStatusColor(entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-400">No status data available</div>
        )}
      </div>

      {/* Recent Tickets */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 dark:text-white">Recent Tickets</h3>
          <Link to="/tickets" className="text-sm text-indigo-600 hover:text-indigo-700">View All</Link>
        </div>
        {analytics.recentTickets?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No recent tickets</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {analytics.recentTickets?.map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`} className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{ticket.title}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className={`badge ${
                        ticket.status === 'open' ? 'badge-open' :
                        ticket.status === 'in_progress' ? 'badge-in_progress' :
                        ticket.status === 'resolved' ? 'badge-resolved' : 'badge-closed'
                      }`}>
                        {ticket.status?.replace('_', ' ')}
                      </span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs text-indigo-600">View →</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}