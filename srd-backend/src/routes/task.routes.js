const router = require('express').Router();
const { auth, authorize } = require('../middleware/auth');
const { Task, Project } = require('../models');

// Create task
router.post('/', auth, async (req, res) => {
  const task = await Task.create(req.body);
  res.status(201).json({ success: true, task });
});

// Get tasks
router.get('/', auth, async (req, res) => {
  const where = {};

  if (req.user.role === 'developer') {
    where.assigneeId = req.user.id;
  }

  const tasks = await Task.findAll({
    where,
    include: [{ model: Project }],
    order: [['dueDate', 'ASC']],
  });

  res.json({ success: true, tasks });
});

// Update task
router.put('/:id', auth, async (req, res) => {
  const task = await Task.findByPk(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  await task.update(req.body);

  // If completed, set completedAt
  if (req.body.status === 'done' && !task.completedAt) {
    await task.update({ completedAt: new Date() });
  }

  res.json({ success: true, task });
});

// Delete task
router.delete('/:id', auth, authorize('admin', 'project_manager'), async (req, res) => {
  const task = await Task.findByPk(req.params.id);

  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  await task.destroy();
  res.json({ success: true, message: 'Task deleted' });
});

module.exports = router;