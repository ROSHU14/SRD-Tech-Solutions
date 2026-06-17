import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import EmailTemplates from './EmailTemplates';

export default function AdminPanel() {
  const [tickets, setTickets] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tickets');
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [sendingNotification, setSendingNotification] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ticketsRes, usersRes, statsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/tickets/all'),
        axios.get('http://localhost:5000/api/users'),
        axios.get('http://localhost:5000/api/tickets/stats'),
      ]);
      setTickets(ticketsRes.data.tickets || []);
      setUsers(usersRes.data.users || []);
      setStats(statsRes.data.stats || {});
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    setUpdatingStatus(ticketId);
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { status: newStatus });
      toast.success('Ticket status updated');
      fetchData();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Delete this ticket?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tickets/${ticketId}`);
        toast.success('Ticket deleted');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const notificationData = {
      title: formData.get('title'),
      message: formData.get('message'),
      type: formData.get('type'),
    };

    setSendingNotification(true);
    try {
      await axios.post('http://localhost:5000/api/notifications/send', notificationData);
      toast.success('Notification sent to all clients!');
      e.target.reset();
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSendingNotification(false);
    }
  };

  const getStatusClass = (status) => {
    const classes = {
      open: 'badge-open',
      in_progress: 'badge-in_progress',
      resolved: 'badge-resolved',
      closed: 'badge-closed',
    };
    return classes[status] || 'badge-open';
  };

  const getPriorityClass = (priority) => {
    const classes = {
      low: 'priority-low',
      medium: 'priority-medium',
      high: 'priority-high',
      urgent: 'priority-urgent',
    };
    return classes[priority] || 'priority-medium';
  };

  const statCards = [
    { title: 'Total Tickets', value: stats.totalTickets || tickets.length, icon: '🎫', color: 'from-blue-500 to-blue-600' },
    { title: 'Open Tickets', value: stats.openTickets || 0, icon: '🟡', color: 'from-yellow-500 to-yellow-600' },
    { title: 'Resolved', value: stats.resolvedTickets || 0, icon: '✅', color: 'from-green-500 to-green-600' },
    { title: 'Total Users', value: stats.totalUsers || users.length, icon: '👥', color: 'from-purple-500 to-purple-600' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="premium-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-slide-in">
      <div>
        <h1 className="text-3xl font-bold gradient-text dark:text-white">Admin Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Manage tickets, users, and system settings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div key={card.title} className="glass-card p-6 premium-card dark:bg-gray-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-3xl">{card.icon}</span>
              <div className={`w-10 h-10 bg-gradient-to-r ${card.color} rounded-lg opacity-20`}></div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{card.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{card.title}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 flex-wrap">
        <button
          onClick={() => setActiveTab('tickets')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'tickets' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          🎫 All Tickets
          {activeTab === 'tickets' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'users' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          👥 Users
          {activeTab === 'users' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'notifications' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📢 Send Notification
          {activeTab === 'notifications' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          )}
        </button>
        <button
          onClick={() => setActiveTab('email-templates')}
          className={`px-6 py-3 font-semibold transition-all relative ${
            activeTab === 'email-templates' ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          📧 Email Templates
          {activeTab === 'email-templates' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-600 to-purple-600"></div>
          )}
        </button>
      </div>

      {/* Tickets Table */}
      {activeTab === 'tickets' && (
        <div className="glass-card overflow-hidden dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Ticket</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Priority</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{ticket.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{ticket.id?.slice(0, 8)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white text-xs font-bold">{ticket.user?.name?.charAt(0)}</span>
                        </div>
                        <span className="text-sm text-gray-700 dark:text-gray-300">{ticket.user?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={ticket.status}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        disabled={updatingStatus === ticket.id}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 ${getStatusClass(ticket.status)}`}
                      >
                        <option value="open">🟡 Open</option>
                        <option value="in_progress">🔵 In Progress</option>
                        <option value="resolved">🟢 Resolved</option>
                        <option value="closed">⚫ Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => window.location.href = `/tickets/${ticket.id}`}
                          className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteTicket(ticket.id)}
                          className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="glass-card overflow-hidden dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Role</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Joined</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-600 dark:text-gray-400">Tickets</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                          <span className="text-white font-bold">{user.name?.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className="badge-premium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">{user.role}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                        {tickets.filter(t => t.userId === user.id).length}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Send Notification Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Send Notification to All Clients</h3>
          <form onSubmit={handleSendNotification} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
              <input
                type="text"
                name="title"
                required
                className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., System Update"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message</label>
              <textarea
                name="message"
                required
                rows={3}
                className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Write your notification message here..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select name="type" className="input-premium dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                <option value="info">📘 Info</option>
                <option value="success">✅ Success</option>
                <option value="warning">⚠️ Warning</option>
                <option value="error">❌ Error</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={sendingNotification}
              className="btn-premium w-full"
            >
              {sendingNotification ? 'Sending...' : '📢 Send Notification to All Clients'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 <strong>Note:</strong> This notification will be sent to ALL registered clients. They will see it in their notification bell instantly.
            </p>
          </div>
        </div>
      )}

      {/* Email Templates Tab */}
      {activeTab === 'email-templates' && (
        <div className="p-4">
          <EmailTemplates />
        </div>
      )}
    </div>
  );
}