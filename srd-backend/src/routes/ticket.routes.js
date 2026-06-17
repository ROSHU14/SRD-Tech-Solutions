const router = require('express').Router();
const { auth } = require('../middleware/auth');
const ticketController = require('../controllers/ticket.controller');

router.post('/', auth, ticketController.createTicket);
router.get('/my-tickets', auth, ticketController.getMyTickets);
router.get('/all', auth, ticketController.getAllTickets);
router.get('/stats', auth, ticketController.getStats);
router.get('/:id', auth, ticketController.getTicket);
router.put('/:id', auth, ticketController.updateTicket);
router.delete('/:id', auth, ticketController.deleteTicket);
router.post('/:id/comments', auth, ticketController.addComment);
router.put('/:id/assign', auth, ticketController.assignTicket);
router.post('/:id/rate', auth, ticketController.rateTicket);
router.post('/bulk', auth, ticketController.bulkUpdate); // NEW: Bulk actions

module.exports = router;