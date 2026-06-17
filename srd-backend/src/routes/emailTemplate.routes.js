const router = require('express').Router();
const { auth } = require('../middleware/auth');
const emailTemplateController = require('../controllers/emailTemplate.controller');

router.use(auth);
router.get('/', emailTemplateController.getTemplates);
router.get('/:id', emailTemplateController.getTemplate);
router.post('/', emailTemplateController.createTemplate);
router.put('/:id', emailTemplateController.updateTemplate);
router.delete('/:id', emailTemplateController.deleteTemplate);

module.exports = router;