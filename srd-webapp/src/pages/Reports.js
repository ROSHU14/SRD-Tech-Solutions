import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import toast from 'react-hot-toast';

export default function Reports() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('weekly');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/api/tickets/all' : '/api/tickets/my-tickets';
      const response = await axios.get(`http://localhost:5000${endpoint}`);
      setTickets(response.data.tickets || []);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = ['Ticket ID', 'Title', 'Status', 'Priority', 'Category', 'Created Date', 'Updated Date'];
    const csvData = tickets.map(ticket => [
      ticket.ticketNumber || ticket.id,
      ticket.title,
      ticket.status,
      ticket.priority,
      ticket.category,
      new Date(ticket.createdAt).toLocaleDateString(),
      new Date(ticket.updatedAt).toLocaleDateString()
    ]);

    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `srd-tickets-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  const getWeeklyData = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = days.map(day => ({ name: day, created: 0, resolved: 0 }));

    tickets.forEach(ticket => {
      const day = new Date(ticket.createdAt).getDay();
      data[day].created++;
      if (ticket.status === 'resolved') {
        data[day].resolved++;
      }
    });
    return data;
  };

  const getPriorityData = () => {
    const priorities = { low: 0, medium: 0, high: 0, urgent: 0 };
    tickets.forEach(ticket => {
      priorities[ticket.priority]++;
    });
    return [
      { name: 'Low', value: priorities.low, color: '#10b981' },
      { name: 'Medium', value: priorities.medium, color: '#3b82f6' },
      { name: 'High', value: priorities.high, color: '#f59e0b' },
      { name: 'Urgent', value: priorities.urgent, color: '#ef4444' }
    ];
  };

  const getStatusData = () => {
    const statuses = { open: 0, in_progress: 0, resolved: 0, closed: 0 };
    tickets.forEach(ticket => {
      statuses[ticket.status]++;
    });
    return statuses;
  };

  const calculateMetrics = () => {
    const total = tickets.length;
    const open = tickets.filter(t => t.status === 'open').length;
    const inProgress = tickets.filter(t => t.status === 'in_progress').length;
    const resolved = tickets.filter(t => t.status === 'resolved').length;
    const closed = tickets.filter(t => t.status === 'closed').length;

    const resolutionRate = total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;
    const openRate = total > 0 ? ((open / total) * 100).toFixed(1) : 0;

    return { total, open, inProgress, resolved, closed, resolutionRate, openRate };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const metrics = calculateMetrics();
  const weeklyData = getWeeklyData();
  const priorityData = getPriorityData();
  const statusData = getStatusData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Analytics & Reports</h1>
          <p className="text-gray-500 mt-2">Track your support performance and metrics</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg"
          >
            <option value="weekly">Last 7 days</option>
            <option value="monthly">Last 30 days</option>
            <option value="all">All Time</option>
          </select>
          <button onClick={exportToCSV} className="btn-outline">
            📥 Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white rounded-xl p-5 border border-gray-100 premium-card">
          <p className="text-gray-500 text-sm">Total Tickets</p>
          <p className="text-2xl font-bold text-gray-900">{metrics.total}</p>
          <div className="mt-2 text-xs text-gray-400">All time</div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 premium-card">
          <p className="text-gray-500 text-sm">Open Tickets</p>
          <p className="text-2xl font-bold text-yellow-600">{metrics.open}</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.openRate}% of total</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 premium-card">
          <p className="text-gray-500 text-sm">Resolution Rate</p>
          <p className="text-2xl font-bold text-green-600">{metrics.resolutionRate}%</p>
          <p className="text-xs text-gray-500 mt-1">{metrics.resolved} tickets resolved</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-100 premium-card">
          <p className="text-gray-500 text-sm">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">{metrics.inProgress}</p>
          <p className="text-xs text-gray-500 mt-1">Being worked on</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Ticket Activity (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="created" fill="#6366f1" name="Created" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={priorityData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label>
                {priorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {priorityData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-xs text-gray-600 capitalize">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Ticket Status Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-yellow-600">{statusData.open}</p>
              <p className="text-sm text-gray-600">Open</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-blue-600">{statusData.in_progress}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-green-600">{statusData.resolved}</p>
              <p className="text-sm text-gray-600">Resolved</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-xl">
              <p className="text-2xl font-bold text-gray-600">{statusData.closed}</p>
              <p className="text-sm text-gray-600">Closed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Tickets Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Recent Tickets</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Priority</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.slice(0, 10).map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => window.location.href = `/tickets/${ticket.id}`}>
                  <td className="px-6 py-3 font-medium">{ticket.title}</td>
                  <td className="px-6 py-3">
                    <span className={`badge ${
                      ticket.status === 'open' ? 'badge-open' :
                      ticket.status === 'in_progress' ? 'badge-in_progress' :
                      ticket.status === 'resolved' ? 'badge-resolved' : 'badge-closed'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 capitalize">{ticket.priority}</td>
                  <td className="px-6 py-3 text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center py-8 text-gray-400">
                    No tickets found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}