import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SmartReply({ ticketId, onUseReply }) {
  const [smartReply, setSmartReply] = useState('');
  const [loading, setLoading] = useState(false);
  const [showReply, setShowReply] = useState(false);

  const fetchSmartReply = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/ai/reply/${ticketId}`);
      setSmartReply(response.data.smartReply);
    } catch (error) {
      toast.error('Failed to generate smart reply');
    } finally {
      setLoading(false);
    }
  };

  const handleShowReply = () => {
    if (!smartReply) {
      fetchSmartReply();
    }
    setShowReply(!showReply);
  };

  const handleUseReply = () => {
    if (onUseReply) {
      onUseReply(smartReply);
    }
    setShowReply(false);
    toast.success('Smart reply added to comment box');
  };

  return (
    <div className="relative">
      <button
        onClick={handleShowReply}
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700"
      >
        <span>🤖</span>
        <span>Generate Smart Reply</span>
      </button>

      {showReply && (
        <div className="mt-3 p-3 bg-indigo-50 rounded-lg border border-indigo-200">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-indigo-600">🤖 AI Suggested Reply</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleUseReply} className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700">
                Use this reply
              </button>
              <button onClick={() => setShowReply(false)} className="text-xs text-gray-500">✕</button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Generating...</span>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{smartReply}</p>
          )}
        </div>
      )}
    </div>
  );
}