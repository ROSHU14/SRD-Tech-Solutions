const aiService = require('../services/aiService');

exports.analyzeTicket = async (req, res) => {
  try {
    const { title, description } = req.body;
    const insights = aiService.getTicketInsights({ title, description });
    res.json({ success: true, insights });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.generateSmartReply = async (req, res) => {
  try {
    const { ticketId } = req.params;
    res.json({ success: true, smartReply: "Thank you for reaching out to SRD Tech Support. Our team is reviewing your issue and will get back to you shortly." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};