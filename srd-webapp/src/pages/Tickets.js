import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import EmptyState from '../components/EmptyState';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function Tickets() {
  const { user } = useAuth();
  const [allTickets, setAllTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [search, filterStatus, filterPriority, allTickets]);

  const fetchTickets = async () => {
    try {
      const endpoint = isAdmin ? '/api/tickets/all' : '/api/tickets/my-tickets';
      const response = await axios.get(`http://localhost:5000${endpoint}`);
      const tickets = response.data.tickets || [];
      setAllTickets(tickets);
      setFilteredTickets(tickets);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...allTickets];

    if (search.trim() !== '') {
      const searchLower = search.toLowerCase().trim();
      filtered = filtered.filter(ticket => {
        return (
          (ticket.title && ticket.title.toLowerCase().includes(searchLower)) ||
          (ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchLower)) ||
          (ticket.id && ticket.id.toLowerCase().includes(searchLower)) ||
          (ticket.description && ticket.description.toLowerCase().includes(searchLower)) ||
          (ticket.category && ticket.category.toLowerCase().includes(searchLower)) ||
          (ticket.status && ticket.status.toLowerCase().includes(searchLower)) ||
          (ticket.priority && ticket.priority.toLowerCase().includes(searchLower))
        );
      });
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(ticket => ticket.status === filterStatus);
    }

    if (filterPriority !== 'all') {
      filtered = filtered.filter(ticket => ticket.priority === filterPriority);
    }

    setFilteredTickets(filtered);
  };

  const handleStatusChange = async (ticketId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/${ticketId}`, { status: newStatus });
      toast.success(`Ticket status updated to ${newStatus}`);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tickets/${ticketId}`);
        toast.success('Ticket deleted');
        fetchTickets();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  // ============================================
  // BULK ACTIONS FUNCTIONS
  // ============================================
  const handleSelectAll = () => {
    if (selectedTickets.length === filteredTickets.length) {
      setSelectedTickets([]);
    } else {
      setSelectedTickets(filteredTickets.map(t => t.id));
    }
  };

  const handleSelectTicket = (ticketId) => {
    if (selectedTickets.includes(ticketId)) {
      setSelectedTickets(selectedTickets.filter(id => id !== ticketId));
    } else {
      setSelectedTickets([...selectedTickets, ticketId]);
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (selectedTickets.length === 0) return;

    setBulkLoading(true);
    try {
      await axios.post('http://localhost:5000/api/tickets/bulk', {
        ticketIds: selectedTickets,
        action: 'status',
        value: newStatus
      });
      toast.success(`${selectedTickets.length} tickets updated to ${newStatus}`);
      setSelectedTickets([]);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to update tickets');
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTickets.length === 0) return;

    if (!window.confirm(`Delete ${selectedTickets.length} tickets?`)) return;

    setBulkLoading(true);
    try {
      await axios.post('http://localhost:5000/api/tickets/bulk', {
        ticketIds: selectedTickets,
        action: 'delete'
      });
      toast.success(`${selectedTickets.length} tickets deleted`);
      setSelectedTickets([]);
      fetchTickets();
    } catch (error) {
      toast.error('Failed to delete tickets');
    } finally {
      setBulkLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      open: { class: 'badge-open', icon: '🟡', label: 'Open' },
      in_progress: { class: 'badge-in_progress', icon: '🔵', label: 'In Progress' },
      resolved: { class: 'badge-resolved', icon: '🟢', label: 'Resolved' },
      closed: { class: 'badge-closed', icon: '⚫', label: 'Closed' },
    };
    return badges[status] || badges.open;
  };

  const getPriorityBadge = (priority) => {
    const badges = {
      low: { class: 'priority-low', icon: '🟢', label: 'Low' },
      medium: { class: 'priority-medium', icon: '🔵', label: 'Medium' },
      high: { class: 'priority-high', icon: '🟠', label: 'High' },
      urgent: { class: 'priority-urgent', icon: '🔴', label: 'Urgent' },
    };
    return badges[priority] || badges.medium;
  };

  if (loading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isAdmin ? 'All Tickets' : 'My Tickets'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isAdmin
              ? `Manage ${allTickets.length} support ticket${allTickets.length !== 1 ? 's' : ''} across all clients`
              : `You have ${allTickets.length} ticket${allTickets.length !== 1 ? 's' : ''}`
            }
          </p>
        </div>
        {!isAdmin && (
          <Link to="/create-ticket" className="btn-premium flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Ticket
          </Link>
        )}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by title, ticket ID, description, status, or priority..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="open">🟡 Open</option>
            <option value="in_progress">🔵 In Progress</option>
            <option value="resolved">🟢 Resolved</option>
            <option value="closed">⚫ Closed</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Priority</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🔵 Medium</option>
            <option value="high">🟠 High</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
        </div>

        {search && (
          <div className="mt-2 text-xs text-indigo-600 dark:text-indigo-400">
            🔍 Found {filteredTickets.length} result{filteredTickets.length !== 1 ? 's' : ''} for "{search}"
          </div>
        )}

        {(search !== '' || filterStatus !== 'all' || filterPriority !== 'all') && (
          <div className="mt-3 text-right">
            <button
              onClick={() => {
                setSearch('');
                setFilterStatus('all');
                setFilterPriority('all');
              }}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Tickets Table */}
      {filteredTickets.length === 0 ? (
        <EmptyState
          icon={search !== '' || filterStatus !== 'all' || filterPriority !== 'all' ? "🔍" : "🎫"}
          title={
            search !== '' || filterStatus !== 'all' || filterPriority !== 'all'
              ? "No tickets match your search"
              : "No tickets yet"
          }
          description={
            search !== '' || filterStatus !== 'all' || filterPriority !== 'all'
              ? `We couldn't find any tickets matching "${search}". Try adjusting your search terms.`
              : "Create your first support ticket to get started"
          }
          action={!isAdmin && search === '' && filterStatus === 'all' && filterPriority === 'all'
            ? { label: '+ Create New Ticket', onClick: () => window.location.href = '/create-ticket' }
            : null}
        />
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                <tr>
                  {isAdmin && (
                    <th className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selectedTickets.length === filteredTickets.length && filteredTickets.length > 0}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                  )}
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Ticket</th>
                  {isAdmin && <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>}
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Priority</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attachments</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredTickets.map((ticket) => {
                  const statusBadge = getStatusBadge(ticket.status);
                  const priorityBadge = getPriorityBadge(ticket.priority);

                  return (
                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                      {isAdmin && (
                        <td className="px-3 py-3">
                          <input
                            type="checkbox"
                            checked={selectedTickets.includes(ticket.id)}
                            onChange={() => handleSelectTicket(ticket.id)}
                            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                      )}
                      <td className="px-5 py-3">
                        <Link to={`/tickets/${ticket.id}`} className="block hover:text-indigo-600 dark:hover:text-indigo-400">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">{ticket.title}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 font-mono">{ticket.ticketNumber || ticket.id?.slice(0, 8)}</p>
                        </Link>
                      </td>

                      {isAdmin && (
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 flex items-center justify-center">
                              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                                {ticket.user?.name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700 dark:text-gray-300">{ticket.user?.name || 'Unknown'}</span>
                          </div>
                        </td>
                      )}

                      <td className="px-5 py-3">
                        {isAdmin ? (
                          <select
                            value={ticket.status}
                            onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                            className={`px-2 py-1 text-xs rounded-full border-0 cursor-pointer ${statusBadge.class}`}
                          >
                            <option value="open">🟡 Open</option>
                            <option value="in_progress">🔵 In Progress</option>
                            <option value="resolved">🟢 Resolved</option>
                            <option value="closed">⚫ Closed</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${statusBadge.class}`}>
                            <span>{statusBadge.icon}</span>
                            <span>{statusBadge.label}</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${priorityBadge.class}`}>
                          <span>{priorityBadge.icon}</span>
                          <span>{priorityBadge.label}</span>
                        </span>
                      </td>

                      <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>

                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5">
                          {ticket.attachments?.screenshots?.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded">
                              📸 {ticket.attachments.screenshots.length}
                            </span>
                          )}
                          {ticket.attachments?.videos?.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-1.5 py-0.5 rounded">
                              🎥 {ticket.attachments.videos.length}
                            </span>
                          )}
                          {(!ticket.attachments?.screenshots?.length && !ticket.attachments?.videos?.length) && (
                            <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3">
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(ticket.id)}
                            className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="Delete ticket"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
            Showing {filteredTickets.length} of {allTickets.length} ticket{allTickets.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* ============================================
          BULK ACTIONS BAR
          ============================================ */}
      {isAdmin && selectedTickets.length > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 z-50 flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedTickets.length} ticket(s) selected
          </span>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleBulkStatusChange(e.target.value);
                e.target.value = '';
              }
            }}
            className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={bulkLoading}
          >
            <option value="">Change Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
          <button
            onClick={handleBulkDelete}
            disabled={bulkLoading}
            className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50 text-sm"
          >
            Delete
          </button>
          <button
            onClick={() => setSelectedTickets([])}
            className="px-3 py-1.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition text-sm"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}