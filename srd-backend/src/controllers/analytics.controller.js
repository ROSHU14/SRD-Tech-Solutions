const { Ticket, User } = require('../models');
const { Op } = require('sequelize');

exports.getAnalytics = async (req, res) => {
  try {
    console.log('📊 Analytics request from user:', req.userId);
    console.log('📊 User role:', req.userRole);

    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // 🔥 FIX: If admin, get ALL tickets. If client, only their tickets.
    let whereCondition = {};
    if (req.userRole !== 'admin') {
      whereCondition.userId = req.userId;
    }

    // Get all tickets (admin gets all, client gets own)
    const allTickets = await Ticket.findAll({
      where: whereCondition
    });

    const totalTickets = allTickets.length;
    const resolvedTickets = allTickets.filter(t => t.status === 'resolved').length;
    const openTickets = allTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    const closedTickets = allTickets.filter(t => t.status === 'closed').length;

    // Priority distribution
    const priorityData = {
      low: allTickets.filter(t => t.priority === 'low').length,
      medium: allTickets.filter(t => t.priority === 'medium').length,
      high: allTickets.filter(t => t.priority === 'high').length,
      urgent: allTickets.filter(t => t.priority === 'urgent').length,
    };

    // Status distribution
    const statusData = {
      open: allTickets.filter(t => t.status === 'open').length,
      in_progress: allTickets.filter(t => t.status === 'in_progress').length,
      resolved: allTickets.filter(t => t.status === 'resolved').length,
      closed: allTickets.filter(t => t.status === 'closed').length,
    };

    // Weekly data (last 7 days)
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));

      const count = allTickets.filter(t => {
        const createdAt = new Date(t.createdAt);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      weeklyData.push({
        date: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        count
      });
    }

    // Recent tickets
    const recentTickets = allTickets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        createdAt: t.createdAt,
        user: { name: 'User' }
      }));

    const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0;

    // CSAT Score (average satisfaction rating from all tickets)
    const ratedTickets = allTickets.filter(t => t.satisfaction !== null && t.satisfaction !== undefined);
    const totalRated = ratedTickets.length;
    const totalSatisfaction = ratedTickets.reduce((sum, t) => sum + (t.satisfaction || 0), 0);
    const avgSatisfaction = totalRated > 0 ? Math.round((totalSatisfaction / totalRated) * 20) : 0;
    const csatScore = avgSatisfaction || 0;

    // Avg response time (in minutes)
    let avgResponseTime = 0;
    const ticketsWithResponse = allTickets.filter(t => t.resolvedAt && t.createdAt);
    if (ticketsWithResponse.length > 0) {
      const totalTime = ticketsWithResponse.reduce((sum, t) => {
        const diff = (new Date(t.resolvedAt) - new Date(t.createdAt)) / (1000 * 60);
        return sum + diff;
      }, 0);
      avgResponseTime = Math.round(totalTime / ticketsWithResponse.length);
    }

    const analytics = {
      totalTickets,
      resolvedTickets,
      openTickets,
      closedTickets,
      csatScore,
      avgResponseTime,
      resolutionRate,
      weeklyData,
      priorityData,
      statusData,
      recentTickets
    };

    console.log('📊 Analytics data sent:', analytics);

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};