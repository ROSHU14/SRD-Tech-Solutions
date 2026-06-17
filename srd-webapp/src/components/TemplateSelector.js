import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export default function TemplateSelector({ onSelect }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/templates', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTemplates(response.data.templates || []);
    } catch (error) {
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (template) => {
    setSelectedTemplate(template);
    if (onSelect) {
      onSelect(template);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="premium-spinner"></div>
        <p className="text-sm text-gray-500 mt-2">Loading templates...</p>
      </div>
    );
  }

  if (templates.length === 0) {
    return null;
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        📋 Quick Templates
      </label>
      <div className="flex flex-wrap gap-2">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => handleSelect(template)}
            className={`px-3 py-1.5 text-sm rounded-full transition ${
              selectedTemplate?.id === template.id
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {template.name}
          </button>
        ))}
      </div>
      {selectedTemplate && (
        <div className="mt-3 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg border border-indigo-200 dark:border-indigo-800">
          <p className="text-xs text-gray-500 dark:text-gray-400">Selected template will auto-fill the form below</p>
        </div>
      )}
    </div>
  );
}