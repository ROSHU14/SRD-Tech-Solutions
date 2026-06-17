import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function SatisfactionSurvey({ ticketId, onRated }) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  console.log('📝 SatisfactionSurvey - Ticket ID:', ticketId);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!ticketId) {
      toast.error('Invalid ticket ID');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:5000/api/tickets/${ticketId}/rate`,
        {
          rating: rating,
          feedback: feedback || ''
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data.success) {
        setSubmitted(true);
        toast.success('Thank you for your feedback!');
        if (onRated) onRated();
      }
    } catch (error) {
      console.error('❌ Rating error:', error.response?.data || error.message);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center border border-green-200 dark:border-green-800">
        <p className="text-2xl mb-2">🙏</p>
        <p className="text-green-600 dark:text-green-400 font-medium">Thank you for your feedback!</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your response helps us improve.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How was your experience?</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Rate your support experience for this ticket</p>

      <div className="flex gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            className={`text-3xl transition ${
              rating >= star ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'
            } hover:scale-110 transform`}
            type="button"
          >
            ★
          </button>
        ))}
      </div>

      <div className="text-sm text-gray-500 dark:text-gray-400 mb-3">
        {rating === 1 && '😞 Very Poor'}
        {rating === 2 && '😟 Poor'}
        {rating === 3 && '😐 Average'}
        {rating === 4 && '😊 Good'}
        {rating === 5 && '🌟 Excellent'}
      </div>

      <textarea
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        placeholder="Any additional feedback? (optional)"
        rows={2}
        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || rating === 0}
        className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Feedback'}
      </button>
    </div>
  );
}