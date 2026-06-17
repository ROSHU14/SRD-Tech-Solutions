const router = require('express').Router();
const { auth } = require('../middleware/auth');
const ticketController = require('../controllers/ticket.controller');

router.get('/stats', auth, ticketController.getStats);

module.exports = router;