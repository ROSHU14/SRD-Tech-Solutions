import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planning',
    progress: 0,
    clientId: '',
    startDate: '',
    endDate: '',
    budget: '',
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    fetchProjects();
    fetchTickets();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data.projects || []);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/tickets/my-tickets');
      setTickets(response.data.tickets || []);
    } catch (error) {
      console.error('Failed to fetch tickets');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingProject) {
        await axios.put(`http://localhost:5000/api/projects/${editingProject.id}`, formData);
        toast.success('Project updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/projects', formData);
        toast.success('Project created successfully');
      }
      setShowForm(false);
      setEditingProject(null);
      setFormData({ name: '', description: '', status: 'planning', progress: 0, clientId: '', startDate: '', endDate: '', budget: '' });
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this project? This will also delete all associated tasks.')) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}`);
        toast.success('Project deleted');
        fetchProjects();
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const handleEdit = (project) => {
    setEditingProject(project);
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      progress: project.progress,
      clientId: project.clientId || '',
      startDate: project.startDate?.split('T')[0] || '',
      endDate: project.endDate?.split('T')[0] || '',
      budget: project.budget || '',
    });
    setShowForm(true);
  };

  const getProjectTickets = (projectId) => {
    // In real app, tickets should have projectId field
    // For now, return empty array or filter by related tickets
    return [];
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: 'bg-gray-100 text-gray-700',
      active: 'bg-green-100 text-green-700',
      on_hold: 'bg-yellow-100 text-yellow-700',
      completed: 'bg-blue-100 text-blue-700',
      cancelled: 'bg-red-100 text-red-700',
    };
    return colors[status] || colors.planning;
  };

  const getStatusIcon = (status) => {
    const icons = {
      planning: '📋',
      active: '🚀',
      on_hold: '⏸️',
      completed: '✅',
      cancelled: '❌',
    };
    return icons[status] || '📋';
  };

  if (loading && projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Projects</h1>
          <p className="text-gray-500 mt-1">Manage all your development projects</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              setEditingProject(null);
              setFormData({ name: '', description: '', status: 'planning', progress: 0, clientId: '', startDate: '', endDate: '', budget: '' });
              setShowForm(!showForm);
            }}
            className="btn-premium"
          >
            + New Project
          </button>
        )}
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingProject ? 'Edit Project' : 'Create New Project'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-premium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-premium"
                >
                  <option value="planning">📋 Planning</option>
                  <option value="active">🚀 Active</option>
                  <option value="on_hold">⏸️ On Hold</option>
                  <option value="completed">✅ Completed</option>
                  <option value="cancelled">❌ Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) })}
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="input-premium"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="input-premium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="input-premium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="input-premium"
                placeholder="Project description..."
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline">
                Cancel
              </button>
              <button type="submit" className="btn-premium">
                {editingProject ? 'Update Project' : 'Create Project'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-4">📁</div>
          <h3 className="text-lg font-semibold text-gray-900">No Projects Yet</h3>
          <p className="text-gray-500 mt-1">Create your first project to get started</p>
          {isAdmin && (
            <button onClick={() => setShowForm(true)} className="btn-premium mt-4">
              + Create Project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden premium-card">
              {/* Project Header */}
              <div className="p-5 border-b border-gray-100">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getStatusIcon(project.status)}</span>
                      <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                      {project.status?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  {isAdmin && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="text-gray-400 hover:text-indigo-600 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-gray-400 hover:text-red-600 transition"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-gray-600 text-sm mt-2 line-clamp-2">{project.description || 'No description provided'}</p>
              </div>

              {/* Project Stats */}
              <div className="p-5 bg-gray-50">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{project.progress}%</p>
                    <p className="text-xs text-gray-500">Complete</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {project.budget ? `$${parseInt(project.budget).toLocaleString()}` : '-'}
                    </p>
                    <p className="text-xs text-gray-500">Budget</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">
                      {getProjectTickets(project.id).length}
                    </p>
                    <p className="text-xs text-gray-500">Tickets</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>

                {/* Dates */}
                {(project.startDate || project.endDate) && (
                  <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between text-xs text-gray-500">
                    {project.startDate && <span>Started: {new Date(project.startDate).toLocaleDateString()}</span>}
                    {project.endDate && <span>Deadline: {new Date(project.endDate).toLocaleDateString()}</span>}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => window.location.href = `/tickets?project=${project.id}`}
                  className="flex-1 text-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-100 transition"
                >
                  View Tickets
                </button>
                <button
                  onClick={() => window.location.href = `/create-ticket?project=${project.id}`}
                  className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition"
                >
                  + New Ticket
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Projects Summary */}
      {projects.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Projects Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              <p className="text-xs text-gray-500">Total Projects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{projects.filter(p => p.status === 'active').length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{projects.filter(p => p.status === 'completed').length}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{projects.filter(p => p.status === 'planning').length}</p>
              <p className="text-xs text-gray-500">Planning</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {projects.reduce((sum, p) => sum + (parseInt(p.budget) || 0), 0).toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Total Budget ($)</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}