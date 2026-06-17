const { Project, User } = require('../models');

// Create project
exports.createProject = async (req, res) => {
  try {
    console.log('Creating project:', req.body);

    let clientId = req.body.clientId;
    if (clientId === '' || clientId === 'null' || !clientId) {
      clientId = null;
    }

    const project = await Project.create({
      name: req.body.name,
      description: req.body.description || '',
      status: req.body.status || 'planning',
      progress: parseInt(req.body.progress) || 0,
      startDate: req.body.startDate || null,
      endDate: req.body.endDate || null,
      budget: req.body.budget || 0,
      clientId: clientId,
      userId: req.userId,
    });

    const projectWithClient = await Project.findByPk(project.id, {
      include: [{ model: User, as: 'assignedClient', attributes: ['id', 'name', 'email'] }]
    });

    res.status(201).json({ success: true, project: projectWithClient });
  } catch (error) {
    console.error('Create error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get projects
exports.getProjects = async (req, res) => {
  try {
    let where = {};

    // Clients see only their assigned projects
    if (req.userRole === 'client') {
      where.clientId = req.userId;
    }

    const projects = await Project.findAll({
      where,
      include: [
        { model: User, as: 'assignedClient', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'creator', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json({ success: true, projects });
  } catch (error) {
    console.error('Get error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id, {
      include: [{ model: User, as: 'assignedClient', attributes: ['id', 'name', 'email'] }]
    });

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    let clientId = req.body.clientId;
    if (clientId === '' || clientId === 'null' || !clientId) {
      clientId = null;
    }

    await project.update({
      name: req.body.name,
      description: req.body.description,
      status: req.body.status,
      progress: req.body.progress,
      startDate: req.body.startDate,
      endDate: req.body.endDate,
      budget: req.body.budget,
      clientId: clientId,
    });

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByPk(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    await project.destroy();
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};