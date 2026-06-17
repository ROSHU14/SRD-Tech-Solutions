const { Notification, User } = require('../models');

exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.userId },
      order: [['createdAt', 'DESC']],
      limit: 50,
    });
    const unreadCount = await Notification.count({ where: { userId: req.userId, isRead: false } });
    res.json({ success: true, notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { id: req.params.id, userId: req.userId } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.update({ isRead: true }, { where: { userId: req.userId, isRead: false } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendNotification = async (req, res) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Admin only' });
    }

    const { title, message, type, link } = req.body;
    const clients = await User.findAll({ where: { role: 'client' } });

    await Promise.all(clients.map(client =>
      Notification.create({
        title, message, type: type || 'info', link: link || null,
        userId: client.id, createdBy: req.userId,
      })
    ));

    res.json({ success: true, message: `Notification sent to ${clients.length} clients` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};