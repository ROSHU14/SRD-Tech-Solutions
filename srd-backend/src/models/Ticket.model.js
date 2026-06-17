module.exports = (sequelize, DataTypes) => {
  const Ticket = sequelize.define('Ticket', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    ticketNumber: {
      type: DataTypes.STRING,
      unique: true,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'open', 'in_progress', 'review', 'resolved', 'closed'),
      defaultValue: 'new',
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'critical', 'emergency'),
      defaultValue: 'medium',
    },
    type: {
      type: DataTypes.ENUM('bug', 'feature', 'support', 'billing', 'general'),
      defaultValue: 'general',
    },
    attachments: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    resolvedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    timeSpent: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 0,
    },
    satisfaction: {
      type: DataTypes.INTEGER,
      validate: { min: 1, max: 5 },
      allowNull: true,
    },
  }, {
    timestamps: true,
    hooks: {
      beforeCreate: async (ticket) => {
        const date = new Date();
        const year = date.getFullYear();
        const count = await sequelize.models.Ticket.count({ where: { createdAt: { [Op.gte]: new Date(year, 0, 1) } } });
        ticket.ticketNumber = `SRD-${year}-${(count + 1).toString().padStart(5, '0')}`;
      },
    },
  });

  return Ticket;
};