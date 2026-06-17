const { Ticket, Comment, User } = require('../models');
const { sendTicketCreatedEmail, sendTicketStatusEmail, sendTicketAssignedEmail } = require('../services/emailService');
const { Op } = require('sequelize');

// Calculate SLA deadline based on priority
const calculateSLADeadline = (priority) => {
  const now = new Date();
  const hours = { low: 48, medium: 24, high: 4, urgent: 1 };
  return new Date(now.getTime() + (hours[priority] || 24) * 60 * 60 * 1000);
};

// Create ticket
exports.createTicket = async (req, res) => {
  try {
    const slaDeadline = calculateSLADeadline(req.body.priority || 'medium');

    const ticket = await Ticket.create({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority || 'medium',
      category: req.body.category || 'general',
      status: 'open',
      userId: req.userId,
      attachments: req.body.attachments || { screenshots: [], videos: [] },
      slaDeadline: slaDeadline,
    });

    const user = await User.findByPk(req.userId);
    if (user) {
      Promise.resolve().then(() => sendTicketCreatedEmail(user, ticket)).catch(console.error);
    }

    const io = req.app.get('io');
    if (io) {
      io.to(`user_${req.userId}`).emit('new_notification', {
        id: ticket.id,
        title: '🎫 New Ticket Created',
        message: `Ticket #${ticket.ticketNumber || ticket.id.slice(0,8)} created successfully`,
        type: 'success',
        link: `/tickets/${ticket.id}`,
        time: new Date().toISOString()
      });
    }

    res.status(201).json({ success: true, ticket });
  } catch (error) {
    console.error('Create ticket error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's tickets
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all tickets (admin)
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.findAll({
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json({ success: true, tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single ticket
exports.getTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'name', 'email', 'avatar'] },
        { model: User, as: 'assignee', attributes: ['id', 'name', 'email', 'avatar'] },
        {
          model: Comment,
          as: 'comments',
          include: [{ model: User, as: 'user', attributes: ['id', 'name', 'avatar'] }],
          order: [['createdAt', 'ASC']]
        },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Get ticket error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// OPTIMIZED UPDATE TICKET - FAST STATUS CHANGE
exports.updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    const oldStatus = ticket.status;
    const oldAssignee = ticket.assignedTo;

    await ticket.update(req.body);

    if (ticket.status === 'resolved' && !ticket.resolvedAt) {
      await ticket.update({ resolvedAt: new Date() });
    }

    const io = req.app.get('io');

    if (oldStatus !== ticket.status) {
      const userId = ticket.userId;
      const ticketData = {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber || ticket.id.slice(0,8),
        status: ticket.status
      };

      Promise.resolve().then(async () => {
        try {
          const user = await User.findByPk(userId);
          if (user) {
            await sendTicketStatusEmail(user, ticket, oldStatus);
          }
        } catch (error) {
          console.error('Email error:', error);
        }
      }).catch(console.error);

      if (io) {
        io.to(`user_${userId}`).emit('ticket_updated', {
          id: ticket.id,
          title: '📋 Ticket Status Updated',
          message: `Ticket #${ticketData.ticketNumber} status changed from ${oldStatus} to ${ticketData.status}`,
          type: 'info',
          link: `/tickets/${ticket.id}`,
          time: new Date().toISOString()
        });
      }
    }

    if (req.body.assignedTo && oldAssignee !== req.body.assignedTo) {
      const assignedTo = req.body.assignedTo;
      Promise.resolve().then(async () => {
        try {
          const assignee = await User.findByPk(assignedTo);
          if (assignee) {
            await sendTicketAssignedEmail(ticket.user, ticket, assignee);
            if (io) {
              io.to(`user_${assignedTo}`).emit('ticket_assigned', {
                id: ticket.id,
                title: '📌 Ticket Assigned to You',
                message: `Ticket #${ticket.ticketNumber || ticket.id.slice(0,8)} has been assigned to you`,
                type: 'warning',
                link: `/tickets/${ticket.id}`,
                time: new Date().toISOString()
              });
            }
          }
        } catch (error) {
          console.error('Assignment notification error:', error);
        }
      }).catch(console.error);
    }

    res.json({ success: true, ticket });
  } catch (error) {
    console.error('Update ticket error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete ticket
exports.deleteTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findByPk(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    await ticket.destroy();
    res.json({ success: true, message: 'Ticket deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      content: req.body.content,
      ticketId: req.params.id,
      userId: req.userId,
    });

    const commentWithUser = await Comment.findByPk(comment.id, {
      include: [{ model: User, as: 'user', attributes: ['name', 'avatar'] }],
    });

    res.status(201).json({ success: true, comment: commentWithUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard stats
exports.getStats = async (req, res) => {
  try {
    const totalTickets = await Ticket.count();
    const openTickets = await Ticket.count({ where: { status: 'open' } });
    const inProgressTickets = await Ticket.count({ where: { status: 'in_progress' } });
    const resolvedTickets = await Ticket.count({ where: { status: 'resolved' } });
    const totalUsers = await User.count();

    const breachedTickets = await Ticket.count({
      where: {
        status: { [Op.in]: ['open', 'in_progress'] },
        slaDeadline: { [Op.lt]: new Date() }
      }
    });

    res.json({
      success: true,
      stats: { totalTickets, openTickets, inProgressTickets, resolvedTickets, totalUsers, breachedTickets }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Assign ticket to developer
exports.assignTicket = async (req, res) => {
  try {
    const { assignedTo } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    await ticket.update({ assignedTo });

    const assignee = await User.findByPk(assignedTo);
    if (assignee) {
      Promise.resolve().then(() => sendTicketAssignedEmail(ticket.user, ticket, assignee)).catch(console.error);
    }

    res.json({ success: true, ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Rate Ticket Satisfaction
exports.rateTicket = async (req, res) => {
  try {
    console.log('⭐ Rating ticket:', req.params.id);
    const { rating, feedback } = req.body;
    const ticket = await Ticket.findByPk(req.params.id);

    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }

    if (ticket.userId !== req.userId) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    if (ticket.status !== 'resolved') {
      return res.status(400).json({ success: false, message: 'Ticket must be resolved to rate' });
    }

    if (ticket.ratedAt) {
      return res.status(400).json({ success: false, message: 'Ticket already rated' });
    }

    await ticket.update({
      satisfaction: rating,
      feedback: feedback || null,
      ratedAt: new Date()
    });

    res.json({ success: true, message: 'Thank you for your feedback!' });
  } catch (error) {
    console.error('Rate ticket error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ============================================
// BULK ACTIONS FOR TICKETS
// ============================================
exports.bulkUpdate = async (req, res) => {
  try {
    const { ticketIds, action, value } = req.body;

    if (!ticketIds || ticketIds.length === 0) {
      return res.status(400).json({ success: false, message: 'No tickets selected' });
    }

    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }

    let updateData = {};

    switch (action) {
      case 'status':
        if (!value) {
          return res.status(400).json({ success: false, message: 'Status value required' });
        }
        updateData.status = value;
        break;
      case 'priority':
        if (!value) {
          return res.status(400).json({ success: false, message: 'Priority value required' });
        }
        updateData.priority = value;
        break;
      case 'delete':
        await Ticket.destroy({
          where: { id: { [Op.in]: ticketIds } }
        });
        return res.json({
          success: true,
          message: `${ticketIds.length} tickets deleted successfully`
        });
      default:
        return res.status(400).json({ success: false, message: 'Invalid action' });
    }

    const [updatedCount] = await Ticket.update(updateData, {
      where: { id: { [Op.in]: ticketIds } }
    });

    res.json({
      success: true,
      message: `${updatedCount} tickets updated successfully`
    });
  } catch (error) {
    console.error('Bulk update error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};