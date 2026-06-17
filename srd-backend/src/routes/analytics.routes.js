const router = require('express').Router();
const { auth } = require('../middleware/auth');
const analyticsController = require('../controllers/analytics.controller');

router.get('/', auth, analyticsController.getAnalytics);

module.exports = router;