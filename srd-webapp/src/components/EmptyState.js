import React from 'react';

export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4 opacity-50">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn-premium text-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}