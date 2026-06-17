const router = require('express').Router();
const { auth } = require('../middleware/auth');
const aiController = require('../controllers/ai.controller');

router.use(auth);
router.post('/analyze', aiController.analyzeTicket);
router.get('/reply/:ticketId', aiController.generateSmartReply);

module.exports = router;