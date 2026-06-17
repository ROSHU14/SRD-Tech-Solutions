const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// ============================================
// USER MODEL
// ============================================
const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'client', 'developer'), defaultValue: 'client' },
  company: { type: DataTypes.STRING, allowNull: true },
  phone: { type: DataTypes.STRING, allowNull: true },
  avatar: { type: DataTypes.STRING, allowNull: true },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  lastLogin: { type: DataTypes.DATE, allowNull: true },
  preferences: { type: DataTypes.JSON, defaultValue: { emailAlerts: true, ticketUpdates: true, marketingEmails: false } },
  resetPasswordToken: { type: DataTypes.STRING, allowNull: true },
  resetPasswordExpires: { type: DataTypes.DATE, allowNull: true },
});

// ============================================
// TICKET MODEL
// ============================================
const Ticket = sequelize.define('Ticket', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  ticketNumber: { type: DataTypes.STRING, unique: true },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM('open', 'in_progress', 'review', 'resolved', 'closed'), defaultValue: 'open' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
  category: { type: DataTypes.STRING, defaultValue: 'general' },
  attachments: { type: DataTypes.JSON, defaultValue: { screenshots: [], videos: [] } },
  userId: { type: DataTypes.UUID, allowNull: false },
  assignedTo: { type: DataTypes.UUID, allowNull: true },
  slaDeadline: { type: DataTypes.DATE, allowNull: true },
  responseTime: { type: DataTypes.INTEGER, defaultValue: 0 },
  resolvedAt: { type: DataTypes.DATE, allowNull: true },
  satisfaction: { type: DataTypes.INTEGER, allowNull: true, validate: { min: 1, max: 5 } },
  feedback: { type: DataTypes.TEXT, allowNull: true },
  ratedAt: { type: DataTypes.DATE, allowNull: true },
});

// ============================================
// COMMENT MODEL
// ============================================
const Comment = sequelize.define('Comment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  content: { type: DataTypes.TEXT, allowNull: false },
  ticketId: { type: DataTypes.UUID, allowNull: false },
  userId: { type: DataTypes.UUID, allowNull: false },
});

// ============================================
// PROJECT MODEL
// ============================================
const Project = sequelize.define('Project', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: true },
  status: { type: DataTypes.ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled'), defaultValue: 'planning' },
  progress: { type: DataTypes.INTEGER, defaultValue: 0 },
  startDate: { type: DataTypes.DATE, allowNull: true },
  endDate: { type: DataTypes.DATE, allowNull: true },
  budget: { type: DataTypes.DECIMAL(12, 2), defaultValue: 0 },
  clientId: { type: DataTypes.UUID, allowNull: true },
  userId: { type: DataTypes.UUID, allowNull: false },
});

// ============================================
// NOTIFICATION MODEL
// ============================================
const Notification = sequelize.define('Notification', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  title: { type: DataTypes.STRING, allowNull: false },
  message: { type: DataTypes.TEXT, allowNull: false },
  type: { type: DataTypes.ENUM('info', 'success', 'warning', 'error'), defaultValue: 'info' },
  isRead: { type: DataTypes.BOOLEAN, defaultValue: false },
  link: { type: DataTypes.STRING, allowNull: true },
  userId: { type: DataTypes.UUID, allowNull: false },
  createdBy: { type: DataTypes.UUID, allowNull: true },
});

// ============================================
// TEMPLATE MODEL (Ticket Templates)
// ============================================
const Template = sequelize.define('Template', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  category: { type: DataTypes.ENUM('bug', 'feature', 'support', 'billing', 'general'), defaultValue: 'general' },
  priority: { type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'), defaultValue: 'medium' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  createdBy: { type: DataTypes.UUID, allowNull: false },
});

// ============================================
// EMAIL TEMPLATE MODEL - FIXED
// ============================================
const EmailTemplate = sequelize.define('EmailTemplate', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  body: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('welcome', 'ticket_created', 'ticket_updated', 'ticket_assigned', 'password_reset'),
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  createdBy: {
    type: DataTypes.UUID,
    allowNull: false,
  },
});

// ============================================
// ASSOCIATIONS
// ============================================
User.hasMany(Ticket, { as: 'tickets', foreignKey: 'userId' });
User.hasMany(Ticket, { as: 'assignedTickets', foreignKey: 'assignedTo' });
Ticket.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Ticket.belongsTo(User, { as: 'assignee', foreignKey: 'assignedTo' });

User.hasMany(Comment, { as: 'comments', foreignKey: 'userId' });
Comment.belongsTo(User, { as: 'user', foreignKey: 'userId' });

Ticket.hasMany(Comment, { as: 'comments', foreignKey: 'ticketId' });
Comment.belongsTo(Ticket, { as: 'ticket', foreignKey: 'ticketId' });

User.hasMany(Project, { as: 'projects', foreignKey: 'userId' });
Project.belongsTo(User, { as: 'creator', foreignKey: 'userId' });
Project.belongsTo(User, { as: 'assignedClient', foreignKey: 'clientId' });

User.hasMany(Notification, { as: 'notifications', foreignKey: 'userId' });
Notification.belongsTo(User, { as: 'user', foreignKey: 'userId' });

User.hasMany(Template, { as: 'templates', foreignKey: 'createdBy' });
Template.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

User.hasMany(EmailTemplate, { as: 'emailTemplates', foreignKey: 'createdBy' });
EmailTemplate.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });

// ============================================
// EXPORTS
// ============================================
module.exports = {
  User,
  Ticket,
  Comment,
  Project,
  Notification,
  Template,
  EmailTemplate,
  sequelize
};