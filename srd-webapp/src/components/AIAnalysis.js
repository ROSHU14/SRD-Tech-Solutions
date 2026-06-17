import React from 'react';

export default function AIAnalysis({ analysis, onClose }) {
  if (!analysis) return null;

  const getCategoryIcon = (category) => {
    const icons = { bug: '🐛', feature: '✨', support: '🛟', billing: '💰', general: '📝' };
    return icons[category] || '📝';
  };

  const getPriorityColor = (priority) => {
    const colors = { urgent: 'bg-red-100 text-red-800', high: 'bg-orange-100 text-orange-800', medium: 'bg-blue-100 text-blue-800', low: 'bg-green-100 text-green-800' };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getSentimentIcon = (sentiment) => {
    if (sentiment.isAngry) return '😠';
    if (sentiment.isFrustrated) return '😤';
    if (sentiment.isPositive) return '😊';
    return '😐';
  };

  return (
    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4 border border-indigo-100">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖 AI Analysis</span>
          <span className="text-xs bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full">Powered by AI</span>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500">Category</p>
          <p className="text-sm font-semibold capitalize">{getCategoryIcon(analysis.category)} {analysis.category}</p>
        </div>
        <div className="bg-white rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500">Priority</p>
          <p className={`text-sm font-semibold capitalize px-2 py-0.5 rounded-full inline-block mt-1 ${getPriorityColor(analysis.priority)}`}>
            {analysis.priority}
          </p>
        </div>
        <div className="bg-white rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500">Sentiment</p>
          <p className="text-sm font-semibold">{getSentimentIcon(analysis.sentiment)} {analysis.sentiment.level}</p>
        </div>
        <div className="bg-white rounded-lg p-2 text-center">
          <p className="text-xs text-gray-500">Est. Resolution</p>
          <p className="text-sm font-semibold text-indigo-600">{analysis.estimatedResolution} hours</p>
        </div>
      </div>
    </div>
  );
}