import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function SimilarTicketsSuggest({ title, description, category }) {
  const [similar, setSimilar] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (title && description && title.length > 10 && description.length > 20) {
      fetchSimilarTickets();
    }
  }, [title, description]);

  const fetchSimilarTickets = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/similar', {
        title,
        description,
        category
      });
      setSimilar(response.data.similar || []);
    } catch (error) {
      console.error('Failed to fetch similar tickets');
    } finally {
      setLoading(false);
    }
  };

  if (similar.length === 0 && !loading) return null;

  return (
    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold text-blue-600">💡 Similar Resolved Tickets</span>
        <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">AI Suggestion</span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span>Finding similar tickets...</span>
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">Similar issues found that were resolved:</p>
          {similar.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/tickets/${ticket.id}`}
              className="block p-2 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition"
            >
              <p className="text-sm font-medium text-gray-900 dark:text-white">{ticket.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-green-600">✓ Resolved</span>
                <span className="text-xs text-gray-400">
                  Solution: {ticket.resolution_summary || 'View ticket for details'}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}