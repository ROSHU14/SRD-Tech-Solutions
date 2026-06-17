import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const articles = [
  {
    id: 1,
    title: 'How to create a support ticket?',
    category: 'Getting Started',
    content: 'To create a support ticket:\n\n1. Click on "New Ticket" in the sidebar\n2. Enter a clear title describing your issue\n3. Provide detailed description of the problem\n4. Select appropriate priority (Low, Medium, High, Urgent)\n5. Choose category (Bug, Feature, Support, Billing, General)\n6. Attach screenshots or videos if needed\n7. Click "Create Ticket"\n\nYou will receive email notifications when your ticket is updated.',
    views: 1234,
    helpful: 98
  },
  {
    id: 2,
    title: 'Understanding ticket statuses',
    category: 'Tickets',
    content: 'Ticket Status Meanings:\n\n• OPEN - Ticket has been created and waiting for response\n• IN PROGRESS - Support team is actively working on your issue\n• RESOLVED - Issue has been solved and waiting for your confirmation\n• CLOSED - Ticket is completed and closed\n\nYou can track your ticket status from the Tickets page.',
    views: 892,
    helpful: 95
  },
  {
    id: 3,
    title: 'How to attach files to tickets?',
    category: 'Tips',
    content: 'Attaching Files:\n\n1. When creating a ticket, scroll to "Attachments" section\n2. Click the upload area or drag files\n3. For Screenshots: Upload images (PNG, JPG, GIF)\n4. For Videos: Upload video files (MP4, MOV)\n5. You can upload multiple files\n6. Files are automatically attached to your ticket\n7. Support team can view/download your attachments',
    views: 756,
    helpful: 92
  },
  {
    id: 4,
    title: 'What is response time and SLA?',
    category: 'Policies',
    content: 'Response Time SLA:\n\n• URGENT: Response within 1 hour\n• HIGH: Response within 4 hours\n• MEDIUM: Response within 24 hours\n• LOW: Response within 48 hours\n\nOur support team works 24/7 to ensure timely responses to all tickets.',
    views: 567,
    helpful: 88
  },
  {
    id: 5,
    title: 'How to escalate an urgent issue?',
    category: 'Support',
    content: 'Escalating Urgent Issues:\n\n1. Set priority to "URGENT" when creating ticket\n2. Add "URGENT" in the title\n3. Call our emergency support: +1-800-SRD-HELP\n4. Email urgent@srdtech.com with your ticket number\n5. Use Live Chat for immediate assistance\n\nUrgent tickets are prioritized and get fastest response.',
    views: 445,
    helpful: 96
  },
  {
    id: 6,
    title: 'How to check ticket status?',
    category: 'Tickets',
    content: 'Checking Ticket Status:\n\n1. Go to "My Tickets" in sidebar\n2. All your tickets are listed with status\n3. Click on any ticket to see details\n4. Status shows: Open, In Progress, Resolved, Closed\n5. You can filter tickets by status\n6. Search tickets by title\n7. Receive email updates on status changes',
    views: 678,
    helpful: 94
  },
];

const categories = ['All', 'Getting Started', 'Tickets', 'Tips', 'Policies', 'Support'];

export default function KnowledgeBase() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [helpfulFeedback, setHelpfulFeedback] = useState({});

  // Handle direct article navigation from URL or search
  useEffect(() => {
    if (id) {
      const article = articles.find(a => a.id === parseInt(id));
      if (article) {
        setSelectedArticle(article);
      } else {
        navigate('/knowledge-base');
      }
    } else {
      setSelectedArticle(null);
    }
  }, [id, navigate]);

  const filteredArticles = articles.filter(article => {
    const matchesSearch = search === '' ||
      article.title.toLowerCase().includes(search.toLowerCase()) ||
      article.content.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleArticleClick = (article) => {
    navigate(`/knowledge-base/${article.id}`);
  };

  const handleBack = () => {
    navigate('/knowledge-base');
  };

  const handleHelpful = (articleId, isHelpful) => {
    setHelpfulFeedback({ ...helpfulFeedback, [articleId]: isHelpful });
    toast.success(`Thank you for your feedback!`);
  };

  const handleCreateTicket = () => {
    navigate('/create-ticket');
  };

  // Show single article view
  if (selectedArticle) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 mb-4"
        >
          ← Back to Knowledge Base
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
                {selectedArticle.category}
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mt-3">{selectedArticle.title}</h1>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">👁️ {selectedArticle.views} views</p>
              <p className="text-sm text-green-600 dark:text-green-400">👍 {selectedArticle.helpful}% helpful</p>
            </div>
          </div>

          <div className="prose max-w-none">
            {selectedArticle.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Was this article helpful?</p>
            <div className="flex gap-3">
              <button
                onClick={() => handleHelpful(selectedArticle.id, true)}
                className={`px-4 py-2 rounded-lg transition ${
                  helpfulFeedback[selectedArticle.id] === true
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                👍 Yes
              </button>
              <button
                onClick={() => handleHelpful(selectedArticle.id, false)}
                className={`px-4 py-2 rounded-lg transition ${
                  helpfulFeedback[selectedArticle.id] === false
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                👎 No
              </button>
            </div>
          </div>

          <div className="mt-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 text-center">
            <p className="text-gray-700 dark:text-gray-300">Still need help?</p>
            <button onClick={handleCreateTicket} className="mt-2 btn-premium text-sm">
              Create a Support Ticket
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show list view
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold gradient-text">Knowledge Base</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Find answers to common questions and learn how to use SRD Portal</p>
      </div>

      <div className="relative max-w-xl mx-auto">
        <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search articles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              selectedCategory === category
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredArticles.map((article) => (
          <div
            key={article.id}
            onClick={() => handleArticleClick(article)}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-5 premium-card cursor-pointer hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400">
                  {article.title}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full">
                    {article.category}
                  </span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">👁️ {article.views} views</span>
                  <span className="text-xs text-green-600 dark:text-green-400">👍 {article.helpful}%</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 line-clamp-2">{article.content.substring(0, 100)}...</p>
              </div>
              <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-2xl p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Still need help?</h3>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Can't find what you're looking for? Contact our support team</p>
        <button onClick={handleCreateTicket} className="mt-4 btn-premium">Create Support Ticket</button>
      </div>
    </div>
  );
}