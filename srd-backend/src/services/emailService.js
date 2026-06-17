const nodemailer = require('nodemailer');
const { EmailTemplate } = require('../models');

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ============================================
// GET TEMPLATE FROM DATABASE
// ============================================
const getTemplate = async (type, variables) => {
  try {
    const template = await EmailTemplate.findOne({ where: { type, isActive: true } });

    if (template) {
      let subject = template.subject;
      let body = template.body;

      Object.entries(variables).forEach(([key, value]) => {
        subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
        body = body.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
      });

      return { subject, body };
    }
    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
};

// ============================================
// DEFAULT TEMPLATES (Fallback)
// ============================================
const getDefaultTemplate = (type, variables) => {
  const defaults = {
    welcome: {
      subject: `Welcome to SRD Tech, ${variables.name}!`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SRD Tech Solutions</h1>
          </div>
          <div style="padding: 20px;">
            <h2>Welcome ${variables.name}! 👋</h2>
            <p>We're excited to have you on board at SRD Tech Solutions.</p>
            <p><strong>Your Account Details:</strong></p>
            <ul>
              <li><strong>Name:</strong> ${variables.name}</li>
              <li><strong>Email:</strong> ${variables.email}</li>
            </ul>
            <a href="${process.env.CLIENT_URL}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">
              Go to Dashboard →
            </a>
            <p>Best regards,<br><strong>SRD Tech Team</strong></p>
            <p style="font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} SRD Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      `
    },
    ticket_created: {
      subject: `Ticket #${variables.ticketNumber} Created - SRD Tech`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SRD Tech Solutions</h1>
          </div>
          <div style="padding: 20px;">
            <h2>🎫 Ticket #${variables.ticketNumber} Created</h2>
            <p>Dear ${variables.name},</p>
            <p>Your support ticket has been created successfully.</p>
            <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Title</strong></td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${variables.ticketTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Priority</strong></td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${variables.ticketPriority}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Status</strong></td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${variables.ticketStatus}</td>
              </tr>
            </table>
            <a href="${process.env.CLIENT_URL}/tickets/${variables.ticketId}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">
              View Ticket →
            </a>
            <p>We'll get back to you within 2-4 hours.</p>
            <p style="font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} SRD Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      `
    },
    ticket_updated: {
      subject: `Ticket #${variables.ticketNumber} Status Updated - SRD Tech`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SRD Tech Solutions</h1>
          </div>
          <div style="padding: 20px;">
            <h2>📋 Ticket #${variables.ticketNumber} Status Updated</h2>
            <p>Dear ${variables.name},</p>
            <p>Your ticket status has been updated.</p>
            <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Old Status</strong></td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${variables.oldStatus}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>New Status</strong></td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${variables.ticketStatus}</td>
              </tr>
            </table>
            <a href="${process.env.CLIENT_URL}/tickets/${variables.ticketId}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">
              View Ticket →
            </a>
            <p style="font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} SRD Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      `
    },
    ticket_assigned: {
      subject: `Ticket #${variables.ticketNumber} Assigned to You - SRD Tech`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SRD Tech Solutions</h1>
          </div>
          <div style="padding: 20px;">
            <h2>📌 Ticket #${variables.ticketNumber} Assigned to You</h2>
            <p>Dear ${variables.assignedTo},</p>
            <p>A new ticket has been assigned to you.</p>
            <table style="border-collapse: collapse; width: 100%; margin: 15px 0;">
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Title</strong></td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${variables.ticketTitle}</td>
              </tr>
              <tr>
                <td style="padding: 8px; border: 1px solid #e2e8f0;"><strong>Priority</strong></td>
                <td style="padding: 8px; border: 1px solid #e2e8f0;">${variables.ticketPriority}</td>
              </tr>
            </table>
            <a href="${process.env.CLIENT_URL}/tickets/${variables.ticketId}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">
              View Ticket →
            </a>
            <p style="font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} SRD Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      `
    },
    password_reset: {
      subject: `Password Reset Request - SRD Tech`,
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">SRD Tech Solutions</h1>
          </div>
          <div style="padding: 20px;">
            <h2>🔑 Password Reset Request</h2>
            <p>Dear ${variables.name},</p>
            <p>We received a request to reset your password.</p>
            <a href="${variables.resetLink}" style="background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 15px 0;">
              Reset Password →
            </a>
            <p style="font-size: 14px; color: #6b7280;">This link expires in 1 hour.</p>
            <p style="font-size: 12px; color: #6b7280;">If you didn't request this, please ignore this email.</p>
            <p style="font-size: 12px; color: #6b7280;">© ${new Date().getFullYear()} SRD Tech Solutions. All rights reserved.</p>
          </div>
        </div>
      `
    }
  };

  return defaults[type] || null;
};

// ============================================
// SEND EMAIL FUNCTION
// ============================================
const sendEmail = async (to, subject, html) => {
  try {
    console.log(`📧 Sending email to: ${to}`);
    console.log(`📧 Subject: ${subject}`);

    await transporter.sendMail({
      from: `"SRD Tech Solutions" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

// ============================================
// WELCOME EMAIL
// ============================================
const sendWelcomeEmail = async (user) => {
  const variables = {
    name: user.name,
    email: user.email,
    clientUrl: process.env.CLIENT_URL,
  };

  const template = await getTemplate('welcome', variables);
  const defaultTemplate = getDefaultTemplate('welcome', variables);

  const { subject, body } = template || defaultTemplate;
  return await sendEmail(user.email, subject, body);
};

// ============================================
// TICKET CREATED EMAIL
// ============================================
const sendTicketCreatedEmail = async (user, ticket) => {
  const variables = {
    name: user.name,
    email: user.email,
    ticketNumber: ticket.ticketNumber || ticket.id.slice(0,8),
    ticketTitle: ticket.title,
    ticketPriority: ticket.priority,
    ticketStatus: ticket.status,
    ticketCategory: ticket.category,
    ticketId: ticket.id,
    clientUrl: process.env.CLIENT_URL,
  };

  const template = await getTemplate('ticket_created', variables);
  const defaultTemplate = getDefaultTemplate('ticket_created', variables);

  const { subject, body } = template || defaultTemplate;
  return await sendEmail(user.email, subject, body);
};

// ============================================
// TICKET STATUS UPDATED EMAIL
// ============================================
const sendTicketStatusEmail = async (user, ticket, oldStatus) => {
  const variables = {
    name: user.name,
    email: user.email,
    ticketNumber: ticket.ticketNumber || ticket.id.slice(0,8),
    ticketTitle: ticket.title,
    ticketStatus: ticket.status,
    oldStatus: oldStatus,
    ticketId: ticket.id,
    clientUrl: process.env.CLIENT_URL,
  };

  const template = await getTemplate('ticket_updated', variables);
  const defaultTemplate = getDefaultTemplate('ticket_updated', variables);

  const { subject, body } = template || defaultTemplate;
  return await sendEmail(user.email, subject, body);
};

// ============================================
// TICKET ASSIGNED EMAIL
// ============================================
const sendTicketAssignedEmail = async (user, ticket, assignee) => {
  const variables = {
    name: assignee.name,
    email: assignee.email,
    ticketNumber: ticket.ticketNumber || ticket.id.slice(0,8),
    ticketTitle: ticket.title,
    ticketPriority: ticket.priority,
    ticketStatus: ticket.status,
    ticketId: ticket.id,
    assignedTo: assignee.name,
    clientUrl: process.env.CLIENT_URL,
  };

  const template = await getTemplate('ticket_assigned', variables);
  const defaultTemplate = getDefaultTemplate('ticket_assigned', variables);

  const { subject, body } = template || defaultTemplate;
  return await sendEmail(assignee.email, subject, body);
};

// ============================================
// PASSWORD RESET EMAIL - FIXED URL
// ============================================
const sendPasswordResetEmail = async (user, resetToken) => {
  // ✅ FIXED: Using CLIENT_URL from .env
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:3001';
  const resetLink = `${clientUrl}/reset-password?token=${resetToken}`;

  console.log('========================================');
  console.log('📧 PASSWORD RESET EMAIL');
  console.log('🔑 Token:', resetToken);
  console.log('🔗 Reset Link:', resetLink);
  console.log('========================================');

  const variables = {
    name: user.name,
    email: user.email,
    resetLink: resetLink,
    clientUrl: clientUrl,
  };

  const template = await getTemplate('password_reset', variables);
  const defaultTemplate = getDefaultTemplate('password_reset', variables);

  const { subject, body } = template || defaultTemplate;
  return await sendEmail(user.email, subject, body);
};

// ============================================
// EXPORTS
// ============================================
module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendTicketCreatedEmail,
  sendTicketStatusEmail,
  sendTicketAssignedEmail,
  sendPasswordResetEmail,
};