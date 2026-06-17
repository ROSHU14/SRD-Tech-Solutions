import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import FileUploadPremium from '../components/FileUploadPremium';
import TemplateSelector from '../components/TemplateSelector';

export default function CreateTicket() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [screenshots, setScreenshots] = useState([]);
  const [videos, setVideos] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
  });

  // AI Analysis - Analyze ticket when title/description changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.length > 5 && formData.description.length > 10) {
        analyzeTicket();
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, [formData.title, formData.description]);

  const analyzeTicket = async () => {
    setAnalyzing(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/analyze', {
        title: formData.title,
        description: formData.description
      });
      setAiAnalysis(response.data.insights);
      if (response.data.insights.priority && formData.priority === 'medium') {
        setFormData(prev => ({ ...prev, priority: response.data.insights.priority }));
      }
    } catch (error) {
      console.error('AI Analysis failed:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleScreenshots = (files) => {
    const validFiles = files.filter(file => file.type.startsWith('image/'));
    if (validFiles.length !== files.length) {
      toast.error('Only image files are allowed for screenshots');
    }
    setScreenshots([...screenshots, ...validFiles]);
  };

  const handleVideos = (files) => {
    const validFiles = files.filter(file => file.type.startsWith('video/'));
    if (validFiles.length !== files.length) {
      toast.error('Only video files are allowed for video uploads');
    }
    setVideos([...videos, ...validFiles]);
  };

  const removeScreenshot = (index) => {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let uploadedFiles = { screenshots: [], videos: [] };
      if (screenshots.length > 0 || videos.length > 0) {
        const formDataFiles = new FormData();
        screenshots.forEach(file => formDataFiles.append('screenshots', file));
        videos.forEach(file => formDataFiles.append('videos', file));
        const uploadResponse = await axios.post('http://localhost:5000/api/upload', formDataFiles, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000
        });
        if (uploadResponse.data.success) {
          uploadedFiles = uploadResponse.data.files;
        }
      }
      await axios.post('http://localhost:5000/api/tickets', {
        ...formData,
        attachments: uploadedFiles
      });
      toast.success('Ticket created successfully!');
      navigate('/tickets');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-200',
      medium: 'bg-blue-100 text-blue-800 border-blue-200',
      high: 'bg-orange-100 text-orange-800 border-orange-200',
      urgent: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[priority] || colors.medium;
  };

  const getCategoryIcon = (category) => {
    const icons = { general: '📝', bug: '🐛', feature: '✨', billing: '💰', support: '🛟' };
    return icons[category] || '📝';
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white text-xl">➕</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create New Ticket</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400 ml-14">Fill out the form below to submit a support request</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Template Selector - NEW */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
          <TemplateSelector onSelect={(template) => {
            setFormData({
              ...formData,
              title: template.title,
              description: template.description,
              priority: template.priority,
              category: template.category,
            });
          }} />
        </div>

        {/* Main Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Information</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Provide details about your issue</p>
          </div>

          <div className="p-6 space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Ticket Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="e.g., Unable to access dashboard, Payment not processed, etc."
              />
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Please describe your issue in detail. Include steps to reproduce if applicable..."
              />
            </div>
          </div>
        </div>

        {/* AI Analysis Card */}
        {analyzing && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/50 rounded-xl flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <p className="font-medium text-indigo-600 dark:text-indigo-400">AI Assistant</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Analyzing your ticket...</p>
              </div>
            </div>
          </div>
        )}

        {aiAnalysis && !analyzing && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-indigo-200 dark:border-indigo-800">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Analysis Results</h3>
              <span className="text-xs bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full">Powered by AI</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Detected Category</p>
                <p className="text-sm font-semibold capitalize flex items-center justify-center gap-1">
                  <span>{getCategoryIcon(aiAnalysis.category)}</span>
                  <span>{aiAnalysis.category}</span>
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Suggested Priority</p>
                <p className={`text-sm font-semibold capitalize inline-flex px-3 py-1 rounded-full ${getPriorityColor(aiAnalysis.priority)}`}>
                  {aiAnalysis.priority}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Customer Sentiment</p>
                <p className="text-sm font-semibold capitalize">
                  {aiAnalysis.sentiment?.level === 'critical' && '😠 Critical'}
                  {aiAnalysis.sentiment?.level === 'negative' && '😤 Frustrated'}
                  {aiAnalysis.sentiment?.level === 'positive' && '😊 Positive'}
                  {aiAnalysis.sentiment?.level === 'neutral' && '😐 Neutral'}
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Est. Resolution</p>
                <p className="text-sm font-semibold text-indigo-600">{aiAnalysis.estimatedResolution} hours</p>
              </div>
            </div>
          </div>
        )}

        {/* Priority & Category */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Classification</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Set priority and category for your ticket</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority Level</label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="low">🟢 Low - Minor issue, no urgency</option>
                  <option value="medium">🔵 Medium - Normal priority</option>
                  <option value="high">🟠 High - Urgent, affecting work</option>
                  <option value="urgent">🔴 Urgent - Critical, system down</option>
                </select>
                {aiAnalysis && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1">
                    <span>🤖</span> AI suggests: {aiAnalysis.priority}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Ticket Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="general">📝 General Inquiry</option>
                  <option value="bug">🐛 Bug Report</option>
                  <option value="feature">✨ Feature Request</option>
                  <option value="billing">💰 Billing Issue</option>
                  <option value="support">🛟 Technical Support</option>
                </select>
                {aiAnalysis && (
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1">
                    <span>🤖</span> AI detected: {aiAnalysis.category}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Attachments */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Attachments</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Add screenshots or videos to help us understand your issue better</p>
          </div>
          <div className="p-6 space-y-6">
            <FileUploadPremium
              label="Screenshots"
              icon="📸"
              accept={{ 'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'] }}
              onFilesSelected={handleScreenshots}
              previews={screenshots}
              onRemove={removeScreenshot}
              maxFiles={5}
              acceptType="image"
            />

            <FileUploadPremium
              label="Videos"
              icon="🎥"
              accept={{ 'video/*': ['.mp4', '.mov', '.avi', '.webm', '.mkv'] }}
              onFilesSelected={handleVideos}
              previews={videos}
              onRemove={removeVideo}
              maxFiles={3}
              acceptType="video"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-4">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Creating Ticket...
              </>
            ) : (
              <>
                <span>✨</span>
                Create Ticket
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}