import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import NotificationBell from './NotificationBell';
import { useTheme } from '../contexts/ThemeContext';
import axios from 'axios';
import FloatingAIAssistant from './FloatingAIAssistant';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Global search functionality
  useEffect(() => {
    if (globalSearch.trim().length > 2) {
      const timer = setTimeout(() => {
        performGlobalSearch();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [globalSearch]);

  const performGlobalSearch = async () => {
    setSearchLoading(true);
    try {
      const searchTerm = globalSearch.toLowerCase().trim();
      const results = [];

      // Search tickets
      try {
        const ticketsRes = await axios.get('http://localhost:5000/api/tickets/my-tickets');
        const tickets = ticketsRes.data.tickets || [];

        const matchedTickets = tickets.filter(ticket => {
          const ticketIdMatch = ticket.id && ticket.id.toLowerCase().includes(searchTerm);
          const ticketShortIdMatch = ticket.id && ticket.id.slice(0, 8).toLowerCase().includes(searchTerm);
          const ticketNumberMatch = ticket.ticketNumber && ticket.ticketNumber.toLowerCase().includes(searchTerm);
          const titleMatch = ticket.title && ticket.title.toLowerCase().includes(searchTerm);
          const descriptionMatch = ticket.description && ticket.description.toLowerCase().includes(searchTerm);

          return ticketIdMatch || ticketShortIdMatch || ticketNumberMatch || titleMatch || descriptionMatch;
        }).map(t => ({
          ...t,
          type: 'ticket',
          icon: '🎫',
          link: `/tickets/${t.id}`,
          displayId: t.ticketNumber || t.id.slice(0, 8)
        }));
        results.push(...matchedTickets);
      } catch (e) {
        console.error('Ticket search error:', e);
      }

      // Search projects
      try {
        const projectsRes = await axios.get('http://localhost:5000/api/projects');
        const projects = projectsRes.data.projects || [];
        const matchedProjects = projects.filter(project =>
          project.name?.toLowerCase().includes(searchTerm) ||
          project.description?.toLowerCase().includes(searchTerm)
        ).map(p => ({
          ...p,
          type: 'project',
          icon: '📁',
          link: `/projects`,
          displayId: null
        }));
        results.push(...matchedProjects);
      } catch (e) {
        console.error('Project search error:', e);
      }

      // Search knowledge base articles
      const knowledgeArticles = [
        { id: 1, title: 'How to create a support ticket?', category: 'Getting Started', content: 'Step by step guide to create tickets' },
        { id: 2, title: 'Understanding ticket statuses', category: 'Tickets', content: 'Open, In Progress, Resolved, Closed meanings' },
        { id: 3, title: 'How to attach files to tickets?', category: 'Tips', content: 'Upload screenshots and videos' },
        { id: 4, title: 'What is response time and SLA?', category: 'Policies', content: 'Our response time commitments' },
        { id: 5, title: 'How to escalate an urgent issue?', category: 'Support', content: 'Emergency support process' },
        { id: 6, title: 'How to check ticket status?', category: 'Tickets', content: 'Track your ticket progress' },
        { id: 7, title: 'What is SRD Portal?', category: 'Getting Started', content: 'Introduction to SRD platform' },
      ];
      const matchedArticles = knowledgeArticles.filter(article =>
        article.title?.toLowerCase().includes(searchTerm) ||
        article.category?.toLowerCase().includes(searchTerm) ||
        article.content?.toLowerCase().includes(searchTerm)
      ).map(a => ({
        id: a.id,
        title: a.title,
        type: 'article',
        icon: '📚',
        link: `/knowledge-base/${a.id}`,
        subtitle: a.category
      }));
      results.push(...matchedArticles);

      const uniqueResults = results.filter((v, i, a) => a.findIndex(t => (t.id === v.id && t.type === v.type)) === i);
      setSearchResults(uniqueResults.slice(0, 15));
      setShowSearchResults(true);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchResultClick = (result) => {
    setGlobalSearch('');
    setShowSearchResults(false);
    if (result.link) {
      navigate(result.link);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userDropdownOpen && !e.target.closest('.user-menu-container')) {
        setUserDropdownOpen(false);
      }
      if (showSearchResults && !e.target.closest('.search-container')) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [userDropdownOpen, showSearchResults]);

  // Keyboard shortcut for search only (Ctrl+K)
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('global-search-input')?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '🏠' },
    { path: '/tickets', label: 'Tickets', icon: '🎫' },
    { path: '/create-ticket', label: 'New Ticket', icon: '➕' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/knowledge-base', label: 'Knowledge Base', icon: '📚' },
    { path: '/chat', label: 'Live Chat', icon: '💬' },
    { path: '/reports', label: 'Reports', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  if (user?.role === 'admin') {
    menuItems.push({ path: '/admin', label: 'Admin Panel', icon: '🛡️' });
    menuItems.push({ path: '/email-templates', label: 'Email Templates', icon: '📧' });
  }

  const handleLogout = () => {
    setUserDropdownOpen(false);
    logout();
    navigate('/login');
  };

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    let currentPath = '';
    paths.forEach((path) => {
      currentPath += `/${path}`;
      breadcrumbs.push({
        name: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
        path: currentPath,
      });
    });
    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-30 shadow-sm">
        <div className="px-6">
          <div className="flex justify-between h-16">
            {/* Left section */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white text-xl">SRD Tech Solutions</span>
                  <p className="text-xs text-gray-400 dark:text-gray-500">Client Portal</p>
                </div>
              </div>

              {/* Breadcrumbs */}
              <div className="hidden md:flex items-center ml-8 text-sm">
                {breadcrumbs.map((crumb, idx) => (
                  <div key={crumb.path} className="flex items-center">
                    {idx > 0 && <span className="text-gray-400 mx-2">/</span>}
                    <Link
                      to={crumb.path}
                      className={`${idx === breadcrumbs.length - 1 ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                    >
                      {crumb.name}
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Right section */}
            <div className="flex items-center space-x-4">
              {/* Global Search */}
              <div className="relative search-container">
                <input
                  id="global-search-input"
                  type="text"
                  placeholder="Search by ticket ID, title, project, or knowledge base... (⌘K)"
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-80 pl-10 pr-4 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {/* Search Results Dropdown */}
                {showSearchResults && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 max-h-96 overflow-y-auto">
                    {searchLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        <div className="animate-spin w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full mx-auto mb-2"></div>
                        Searching...
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        🔍 No results found for "{globalSearch}"
                      </div>
                    ) : (
                      <>
                        <div className="p-2 text-xs text-gray-400 dark:text-gray-500 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                          Found {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
                        </div>
                        {searchResults.map((result, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSearchResultClick(result)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0 flex items-center gap-3"
                          >
                            <span className="text-xl">{result.icon}</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {result.title || result.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">{result.type}</span>
                                {result.displayId && (
                                  <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/50 px-1.5 py-0.5 rounded">
                                    ID: {result.displayId}
                                  </span>
                                )}
                                {result.status && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">• {result.status}</span>
                                )}
                                {result.category && (
                                  <span className="text-xs text-gray-400 dark:text-gray-500">• {result.category}</span>
                                )}
                              </div>
                            </div>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              >
                {theme === 'light' ? (
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                )}
              </button>

              <NotificationBell />

              {/* User Menu - WITH AVATAR */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-sm overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={`http://localhost:5000${user.avatar}`}
                        alt={user?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      user?.name?.charAt(0) || 'U'
                    )}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{user?.role}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 hidden md:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 overflow-hidden">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-semibold overflow-hidden">
                          {user?.avatar ? (
                            <img
                              src={`http://localhost:5000${user.avatar}`}
                              alt={user?.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            user?.name?.charAt(0) || 'U'
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{user?.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      to="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span>👤</span> Your Profile
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <span>⚙️</span> Settings
                    </Link>
                    <div className="border-t border-gray-100 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                    >
                      <span>🚪</span> Sign out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`fixed lg:relative lg:block z-40 w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 h-screen transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
          <div className="flex flex-col h-full">
            <nav className="flex-1 py-6 overflow-y-auto">
              <div className="px-3 space-y-1">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className={`text-sm font-medium ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1 h-6 bg-indigo-600 rounded-full"></div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </nav>

            {/* Help Section */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🎧</span>
                  <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">24/7 Support</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Our team is here to help</p>
                <a href="mailto:support@srdtech.com" className="text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:hover:text-indigo-300 block mb-2">
                  support@srdtech.com
                </a>
                <div className="mt-2 pt-2 border-t border-indigo-100 dark:border-indigo-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <span>⏱️</span> Avg response: 2-4 hours
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <div className="fixed inset-0 z-30 bg-black bg-opacity-50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        <main className="flex-1 min-h-screen">
          <div className="p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Floating AI Assistant */}
      <FloatingAIAssistant />
    </div>
  );
}