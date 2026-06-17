import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import SmartReply from '../components/SmartReply';
import SatisfactionSurvey from '../components/SatisfactionSurvey';

export default function TicketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [ticketRated, setTicketRated] = useState(false);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchTicket();
  }, [id]);

  const fetchTicket = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tickets/${id}`);
      setTicket(response.data.ticket);
      if (response.data.ticket.ratedAt) {
        setTicketRated(true);
      }
    } catch (error) {
      toast.error('Failed to load ticket');
      navigate('/tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`http://localhost:5000/api/tickets/${id}`, { status: newStatus });
      setTicket({ ...ticket, status: newStatus });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setUpdating(true);
    try {
      const response = await axios.post(`http://localhost:5000/api/tickets/${id}/comments`, { content: comment });
      setTicket({
        ...ticket,
        comments: [...(ticket.comments || []), response.data.comment],
      });
      setComment('');
      toast.success('Comment added');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: '🟡',
      in_progress: '🔵',
      resolved: '🟢',
      closed: '⚫',
    };
    return icons[status] || '🟡';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="premium-spinner"></div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto animate-slide-in">
      {/* Back Button */}
      <button
        onClick={() => navigate('/tickets')}
        className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors mb-6 group"
      >
        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Tickets
      </button>

      {/* Main Card */}
      <div className="glass-card overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
          <div className="flex flex-wrap justify-between items-start gap-4">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{getStatusIcon(ticket.status)}</span>
                <h1 className="text-2xl font-bold">{ticket.title}</h1>
              </div>
              <p className="text-indigo-100 text-sm">Ticket ID: {ticket.id?.slice(0, 8)}...</p>
            </div>
            {isAdmin && (
              <select
                value={ticket.status}
                onChange={(e) => handleStatusChange(e.target.value)}
                disabled={updating}
                className="px-4 py-2 bg-white rounded-xl text-sm font-medium shadow-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="open">🟡 Open</option>
                <option value="in_progress">🔵 In Progress</option>
                <option value="resolved">🟢 Resolved</option>
                <option value="closed">⚫ Closed</option>
              </select>
            )}
          </div>
        </div>

        {/* Details Grid */}
        <div className="p-8 border-b border-gray-100 dark:border-gray-700">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
              <p className="font-semibold mt-1 capitalize flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  ticket.status === 'open' ? 'bg-yellow-500' :
                  ticket.status === 'in_progress' ? 'bg-blue-500' :
                  ticket.status === 'resolved' ? 'bg-green-500' : 'bg-gray-500'
                }`}></span>
                {ticket.status?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Priority</p>
              <p className={`font-semibold mt-1 ${
                ticket.priority === 'urgent' ? 'text-red-600' :
                ticket.priority === 'high' ? 'text-orange-600' :
                ticket.priority === 'medium' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {ticket.priority?.toUpperCase()}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Category</p>
              <p className="font-semibold mt-1 capitalize">{ticket.category}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
              <p className="font-semibold mt-1">{new Date(ticket.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Description */}
          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Description
            </h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-8">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Comments ({ticket.comments?.length || 0})
          </h3>

          <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
            {ticket.comments?.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <p className="text-gray-400 dark:text-gray-500">💬 No comments yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Be the first to add a comment</p>
              </div>
            ) : (
              ticket.comments?.map((msg, idx) => (
                <div key={msg.id} className="flex gap-3 animate-slide-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-white font-bold text-sm">{msg.user?.name?.charAt(0) || 'U'}</span>
                  </div>
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-900 dark:text-white">{msg.user?.name}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Smart Reply Component - For Admin only */}
          {isAdmin && (
            <div className="mb-3">
              <SmartReply ticketId={id} onUseReply={(reply) => setComment(reply)} />
            </div>
          )}

          {/* ============================================
              SATISFACTION SURVEY - FOR CLIENT ONLY
              ============================================ */}
          {ticket?.status === 'resolved' && !ticketRated && !ticket?.ratedAt && user?.role !== 'admin' && (
            <div className="mt-6">
              <SatisfactionSurvey
                ticketId={ticket.id}
                onRated={() => {
                  setTicketRated(true);
                  fetchTicket();
                }}
              />
            </div>
          )}

          {/* Show rating if already rated */}
          {ticket?.ratedAt && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">✅ You rated this ticket:</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="text-2xl text-yellow-400">
                  {'★'.repeat(ticket.satisfaction || 0)}
                  {'☆'.repeat(5 - (ticket.satisfaction || 0))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  ({ticket.satisfaction}/5)
                </span>
              </div>
              {ticket.feedback && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 italic">"{ticket.feedback}"</p>
              )}
              <p className="text-xs text-gray-400 mt-2">
                Rated on {new Date(ticket.ratedAt).toLocaleDateString()}
              </p>
            </div>
          )}

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mt-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write your comment here..."
              rows={3}
              className="input-premium dark:bg-gray-800 dark:border-gray-700 dark:text-white mb-3"
            />
            <button
              type="submit"
              disabled={updating || !comment.trim()}
              className="btn-premium w-full md:w-auto"
            >
              {updating ? 'Sending...' : '💬 Post Comment'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}