const router = require('express').Router();
const { auth } = require('../middleware/auth');
const notificationController = require('../controllers/notification.controller');

router.use(auth);
router.get('/', notificationController.getNotifications);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.post('/send', notificationController.sendNotification);

module.exports = router;